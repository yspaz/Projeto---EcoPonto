import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import {
  ecoActions,
  ecoCollections,
  ecoPartners,
  type EcoAction,
  type EcoCollection,
  type EcoPartner,
} from "../drizzle/schema";
import { getDb } from "./db";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "./_core/trpc";

export const CATEGORY_SLUGS = [
  "papel",
  "plastico",
  "vidro",
  "metal",
  "organicos",
  "rejeitos",
  "madeira",
  "saude",
  "perigosos",
  "radioativos",
] as const;

export type EcoCategory = (typeof CATEGORY_SLUGS)[number];

const BRAZILIAN_UFS = new Set([
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]);

const PARTNER_KINDS = [
  "empresa",
  "cooperativa",
  "ecoponto",
  "instituicao",
] as const;
const PARTNER_STATUSES = ["pendente", "aprovado", "rejeitado"] as const;
const COLLECTION_STATUSES = [
  "pendente",
  "em_analise",
  "confirmada",
  "concluida",
  "cancelada",
] as const;
const ACTION_REVIEW_STATUSES = ["aprovada", "rejeitada"] as const;
const ACTION_STATUSES = ["pendente", "aprovada", "rejeitada"] as const;
const COLLECTION_REVIEW_STATUSES = ["em_analise", "cancelada"] as const;
const NON_RECYCLABLE_IMPACT_CATEGORIES = new Set<EcoCategory>([
  "rejeitos",
  "saude",
  "radioativos",
  "perigosos",
]);
const DAY_IN_MS = 24 * 60 * 60 * 1000;

type Database = NonNullable<Awaited<ReturnType<typeof getDb>>>;
type UserContext = { id: number; email: string | null; name: string | null };

type InsertHeader = {
  insertId?: number | string | bigint;
  affectedRows?: number | string | bigint;
};

function textField(label: string, maxLength: number) {
  return z
    .string({ error: `${label} deve ser um texto.` })
    .trim()
    .min(1, `${label} é obrigatório.`)
    .max(maxLength, `${label} deve ter no máximo ${maxLength} caracteres.`);
}

function enumString<const T extends readonly string[]>(
  values: T,
  label: string
) {
  return textField(label, 40).refine(
    (value): value is T[number] => values.includes(value),
    `${label} inválido.`
  );
}

export function isCategory(value: string): value is EcoCategory {
  return (CATEGORY_SLUGS as readonly string[]).includes(value);
}

export function isBrazilianState(value: string): boolean {
  return BRAZILIAN_UFS.has(value.toUpperCase());
}

const categorySchema = textField("Categoria", 32).refine(
  (value): value is EcoCategory => isCategory(value),
  "Categoria inválida."
);
const collectionCategorySchema = categorySchema.refine(
  value => value !== "saude" && value !== "radioativos",
  "Resíduos de saúde e radioativos não podem ser solicitados pela coleta comum."
);
const actionCategorySchema = categorySchema.refine(
  value => value !== "saude" && value !== "radioativos",
  "Ações de resíduos de saúde e radioativos não podem ser registradas aqui."
);
const stateSchema = textField("UF", 2)
  .transform(value => value.toUpperCase())
  .refine(isBrazilianState, "Informe uma UF brasileira válida.");
const materialsSchema = z
  .array(textField("Material", 160))
  .min(1, "Informe pelo menos um material.")
  .max(50, "Informe no máximo 50 materiais.");

function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

const optionalSourceUrlSchema = textField("URL da fonte", 2048)
  .refine(isSafeHttpUrl, "A URL da fonte deve usar http:// ou https://.")
  .optional();
const requiredSourceUrlSchema = textField("URL da fonte", 2048).refine(
  isSafeHttpUrl,
  "A URL da fonte deve usar http:// ou https://."
);

function startOfUtcDay(date = new Date()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }
  return parsed;
}

export function isValidFutureCollectionDate(
  value: string,
  today = new Date()
): boolean {
  const parsed = parseIsoDate(value);
  if (!parsed) return false;
  const startToday = startOfUtcDay(today);
  const daysFromToday = (parsed.getTime() - startToday.getTime()) / DAY_IN_MS;
  return daysFromToday >= 1 && daysFromToday <= 90;
}

const collectionDateSchema = z
  .string({ error: "A data deve ser informada como YYYY-MM-DD." })
  .trim()
  .refine(
    value => parseIsoDate(value) !== null,
    "Informe uma data válida como YYYY-MM-DD."
  )
  .refine(
    value => isValidFutureCollectionDate(value),
    "A data deve ser futura e estar dentro dos próximos 90 dias."
  );

const partnerCreateInput = z.object({
  name: textField("Nome", 200),
  kind: enumString(PARTNER_KINDS, "Tipo"),
  address: textField("Endereço", 500),
  city: textField("Cidade", 120),
  state: stateSchema,
  contact: textField("Contato", 320),
  materials: materialsSchema,
  hours: textField("Horário de funcionamento", 1000),
  sourceUrl: optionalSourceUrlSchema,
});

const suggestionCreateInput = z.object({
  name: textField("Nome", 200),
  address: textField("Endereço", 500),
  city: textField("Cidade", 120),
  state: stateSchema,
  sourceUrl: requiredSourceUrlSchema,
  materials: materialsSchema,
});

const collectionCreateInput = z.object({
  category: collectionCategorySchema,
  material: textField("Material", 200),
  address: textField("Endereço", 500),
  city: textField("Cidade", 120),
  state: stateSchema,
  date: collectionDateSchema,
  notes: textField("Observações", 2000).optional(),
});

const actionCreateInput = z.object({
  category: actionCategorySchema,
  material: textField("Material", 200),
  kg: z
    .number({ error: "A massa deve ser um número." })
    .refine(Number.isFinite, "A massa deve ser um número finito.")
    .gt(0, "A massa deve ser maior que zero.")
    .lte(10_000, "A massa deve ser de no máximo 10.000 kg."),
  description: textField("Descrição", 3000).refine(
    value => value.length >= 10,
    "A descrição deve ter pelo menos 10 caracteres."
  ),
});

const reviewActionInput = z.object({
  id: z
    .number({ error: "ID da ação inválido." })
    .int()
    .positive("ID da ação inválido."),
  status: enumString(ACTION_REVIEW_STATUSES, "Status"),
});

const reviewPartnerInput = z.object({
  id: z
    .number({ error: "ID do parceiro inválido." })
    .int()
    .positive("ID do parceiro inválido."),
  status: enumString(PARTNER_STATUSES.slice(1), "Status"),
});

const reviewCollectionInput = z.object({
  id: z
    .number({ error: "ID da solicitação inválido." })
    .int()
    .positive("ID da solicitação inválido."),
  status: enumString(COLLECTION_REVIEW_STATUSES, "Status"),
});

const collectionCancelInput = z.object({
  id: z
    .number({ error: "ID da solicitação inválido." })
    .int()
    .positive("ID da solicitação inválido."),
});

export type PartnerCreateInput = z.infer<typeof partnerCreateInput>;
export type SuggestionCreateInput = z.infer<typeof suggestionCreateInput>;
export type CollectionCreateInput = z.infer<typeof collectionCreateInput>;
export type ActionCreateInput = z.infer<typeof actionCreateInput>;

function databaseError(cause?: unknown): TRPCError {
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Não foi possível acessar o banco de dados.",
    cause,
  });
}

async function withDatabase<T>(
  operation: (db: Database) => Promise<T>
): Promise<T> {
  let db: Database | null = null;
  try {
    db = await getDb();
  } catch (error) {
    throw databaseError(error);
  }

  if (!db) throw databaseError();

  try {
    return await operation(db);
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    console.error("[EcoPonto] Database operation failed:", error);
    throw databaseError(error);
  }
}

function insertId(result: unknown): number {
  const header = (Array.isArray(result) ? result[0] : result) as
    | InsertHeader
    | undefined;
  const id = Number(header?.insertId ?? 0);
  if (!Number.isSafeInteger(id) || id <= 0) throw databaseError();
  return id;
}

function changedRows(result: unknown): number {
  const header = (Array.isArray(result) ? result[0] : result) as
    | InsertHeader
    | undefined;
  return Number(header?.affectedRows ?? 0);
}

function notFound(message: string): never {
  throw new TRPCError({ code: "NOT_FOUND", message });
}

function invalidState(message: string): never {
  throw new TRPCError({ code: "BAD_REQUEST", message });
}

function collectionView(row: EcoCollection) {
  return {
    id: row.id,
    category: row.category,
    material: row.material,
    address: row.address,
    city: row.city,
    state: row.state,
    date: row.preferredDate,
    notes: row.notes ?? undefined,
    status: row.status,
    createdAt: row.createdAt,
  };
}

function partnerAdminView(row: EcoPartner) {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    kind: row.kind,
    address: row.address,
    city: row.city,
    state: row.state,
    contact: row.contact,
    materials: row.materials,
    hours: row.hours,
    sourceUrl: row.sourceUrl,
    submissionType: row.submissionType,
    status: row.status,
    createdAt: row.createdAt,
    reviewedAt: row.reviewedAt,
    reviewedBy: row.reviewedBy,
  };
}

function collectionAdminView(row: EcoCollection) {
  return {
    ...collectionView(row),
    userId: row.userId,
    reviewedAt: row.reviewedAt,
    reviewedBy: row.reviewedBy,
  };
}

function actionAdminView(row: EcoAction) {
  return {
    id: row.id,
    userId: row.userId,
    category: row.category,
    material: row.material,
    kg: Number(row.kg),
    description: row.description,
    status: row.status,
    points: row.points,
    createdAt: row.createdAt,
    reviewedAt: row.reviewedAt,
    reviewedBy: row.reviewedBy,
  };
}

async function impact() {
  return withDatabase(async db => {
    const [categoryRows, pointRows, requestRows] = await Promise.all([
      db
        .select({
          category: ecoActions.category,
          kg: sql<number>`COALESCE(SUM(${ecoActions.kg}), 0)`,
        })
        .from(ecoActions)
        .where(eq(ecoActions.status, "aprovada"))
        .groupBy(ecoActions.category),
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(ecoPartners)
        .where(eq(ecoPartners.status, "aprovado")),
      db.select({ count: sql<number>`COUNT(*)` }).from(ecoCollections),
    ]);

    const byCategory = categoryRows.map(row => ({
      category: row.category,
      kg: Number(row.kg ?? 0),
    }));
    const destinedKg = byCategory.reduce((total, row) => total + row.kg, 0);
    const recycledKg = byCategory.reduce(
      (total, row) =>
        total +
        (NON_RECYCLABLE_IMPACT_CATEGORIES.has(row.category as EcoCategory)
          ? 0
          : row.kg),
      0
    );

    return {
      recycledKg,
      destinedKg,
      pointCount: Number(pointRows[0]?.count ?? 0),
      requestCount: Number(requestRows[0]?.count ?? 0),
      byCategory,
    };
  });
}

async function createPartner(userId: number, input: PartnerCreateInput) {
  return withDatabase(async db => {
    const result = await db.insert(ecoPartners).values({
      userId,
      name: input.name,
      kind: input.kind as EcoPartner["kind"],
      address: input.address,
      city: input.city,
      state: input.state,
      contact: input.contact,
      materials: input.materials,
      hours: input.hours,
      sourceUrl: input.sourceUrl,
      submissionType: "cadastro",
      status: "pendente",
    });
    return { id: insertId(result) };
  });
}

async function createSuggestion(
  user: UserContext,
  input: SuggestionCreateInput
) {
  return withDatabase(async db => {
    const contact = (user.email ?? user.name ?? "").trim().slice(0, 320);
    const result = await db.insert(ecoPartners).values({
      userId: user.id,
      name: input.name,
      kind: "ecoponto",
      address: input.address,
      city: input.city,
      state: input.state,
      contact,
      materials: input.materials,
      hours: "Não informado",
      sourceUrl: input.sourceUrl,
      submissionType: "sugestao",
      status: "pendente",
    });
    return { id: insertId(result) };
  });
}

async function listMinePartners(userId: number) {
  return withDatabase(async db => {
    const rows = await db
      .select({
        id: ecoPartners.id,
        name: ecoPartners.name,
        address: ecoPartners.address,
        status: ecoPartners.status,
        createdAt: ecoPartners.createdAt,
      })
      .from(ecoPartners)
      .where(eq(ecoPartners.userId, userId))
      .orderBy(desc(ecoPartners.createdAt));
    return rows;
  });
}

async function createCollection(userId: number, input: CollectionCreateInput) {
  return withDatabase(async db => {
    const result = await db.insert(ecoCollections).values({
      userId,
      category: input.category,
      material: input.material,
      address: input.address,
      city: input.city,
      state: input.state,
      preferredDate: input.date,
      notes: input.notes,
      status: "pendente",
    });
    return { id: insertId(result) };
  });
}

async function listMineCollections(userId: number) {
  return withDatabase(async db => {
    const rows = await db
      .select()
      .from(ecoCollections)
      .where(eq(ecoCollections.userId, userId))
      .orderBy(desc(ecoCollections.createdAt));
    return rows.map(collectionView);
  });
}

async function cancelCollection(userId: number, id: number) {
  return withDatabase(async db => {
    const rows = await db
      .select({ id: ecoCollections.id, status: ecoCollections.status })
      .from(ecoCollections)
      .where(and(eq(ecoCollections.id, id), eq(ecoCollections.userId, userId)))
      .limit(1);
    const row = rows[0];
    if (!row) notFound("Solicitação de coleta não encontrada.");
    if (row.status !== "pendente" && row.status !== "em_analise") {
      invalidState(
        "Somente solicitações pendentes ou em análise podem ser canceladas."
      );
    }

    const result = await db
      .update(ecoCollections)
      .set({ status: "cancelada" })
      .where(
        and(
          eq(ecoCollections.id, id),
          eq(ecoCollections.userId, userId),
          inArray(ecoCollections.status, ["pendente", "em_analise"])
        )
      );
    if (changedRows(result) !== 1) {
      invalidState(
        "A solicitação já foi alterada e não pode mais ser cancelada."
      );
    }
    return { success: true } as const;
  });
}

function levelForPoints(points: number): string {
  if (points >= 1000) return "Floresta";
  if (points >= 500) return "Ramo";
  if (points >= 100) return "Broto";
  return "Semente";
}

async function createAction(userId: number, input: ActionCreateInput) {
  return withDatabase(async db => {
    const result = await db.insert(ecoActions).values({
      userId,
      category: input.category,
      material: input.material,
      kg: input.kg,
      description: input.description,
      status: "pendente",
      points: 0,
    });
    return { id: insertId(result) };
  });
}

async function listMineActions(userId: number) {
  return withDatabase(async db => {
    const activities = await db
      .select()
      .from(ecoActions)
      .where(eq(ecoActions.userId, userId))
      .orderBy(desc(ecoActions.createdAt));
    const points = activities.reduce(
      (total, activity) =>
        total + (activity.status === "aprovada" ? activity.points : 0),
      0
    );
    return {
      points,
      level: levelForPoints(points),
      activities: activities.map(activity => ({
        id: activity.id,
        category: activity.category,
        material: activity.material,
        kg: Number(activity.kg),
        description: activity.description,
        status: activity.status,
        points: activity.points,
        createdAt: activity.createdAt,
      })),
    };
  });
}

async function adminOverview() {
  return withDatabase(async db => {
    const [partners, collections, actions] = await Promise.all([
      db.select().from(ecoPartners).orderBy(desc(ecoPartners.createdAt)),
      db.select().from(ecoCollections).orderBy(desc(ecoCollections.createdAt)),
      db.select().from(ecoActions).orderBy(desc(ecoActions.createdAt)),
    ]);
    return {
      partners: partners.map(partnerAdminView),
      collections: collections.map(collectionAdminView),
      actions: actions.map(actionAdminView),
    };
  });
}

async function reviewAction(
  adminId: number,
  input: z.infer<typeof reviewActionInput>
) {
  return withDatabase(async db =>
    db.transaction(async tx => {
      const rows = await tx
        .select()
        .from(ecoActions)
        .where(eq(ecoActions.id, input.id))
        .limit(1);
      const action = rows[0];
      if (!action) notFound("Ação não encontrada.");
      if (action.status !== "pendente") {
        invalidState(
          "Esta ação já foi revisada e não pode ser revisada novamente."
        );
      }

      const points =
        input.status === "aprovada"
          ? Math.min(1000, Math.max(1, Math.round(Number(action.kg) * 10)))
          : 0;
      const result = await tx
        .update(ecoActions)
        .set({
          status: input.status as EcoAction["status"],
          points,
          reviewedAt: new Date(),
          reviewedBy: adminId,
        })
        .where(
          and(eq(ecoActions.id, input.id), eq(ecoActions.status, "pendente"))
        );
      if (changedRows(result) !== 1) {
        invalidState("Esta ação já foi revisada por outro administrador.");
      }
      return { success: true } as const;
    })
  );
}

async function reviewPartner(
  adminId: number,
  input: z.infer<typeof reviewPartnerInput>
) {
  return withDatabase(async db => {
    const rows = await db
      .select()
      .from(ecoPartners)
      .where(eq(ecoPartners.id, input.id))
      .limit(1);
    const partner = rows[0];
    if (!partner) notFound("Parceiro não encontrado.");
    if (partner.status !== "pendente") {
      invalidState(
        "Este parceiro já foi revisado e não pode ser revisado novamente."
      );
    }
    if (
      input.status === "aprovado" &&
      (!partner.sourceUrl ||
        !isSafeHttpUrl(partner.sourceUrl) ||
        !partner.address.trim())
    ) {
      invalidState(
        "A aprovação exige uma fonte http(s) e um endereço informado para revisão manual."
      );
    }

    const result = await db
      .update(ecoPartners)
      .set({
        status: input.status as EcoPartner["status"],
        reviewedAt: new Date(),
        reviewedBy: adminId,
      })
      .where(
        and(eq(ecoPartners.id, input.id), eq(ecoPartners.status, "pendente"))
      );
    if (changedRows(result) !== 1) {
      invalidState("Este parceiro já foi revisado por outro administrador.");
    }
    return { success: true } as const;
  });
}

async function reviewCollection(
  adminId: number,
  input: z.infer<typeof reviewCollectionInput>
) {
  return withDatabase(async db => {
    const result = await db
      .update(ecoCollections)
      .set({
        status: input.status as EcoCollection["status"],
        reviewedAt: new Date(),
        reviewedBy: adminId,
      })
      .where(
        and(
          eq(ecoCollections.id, input.id),
          inArray(ecoCollections.status, ["pendente", "em_analise"])
        )
      );
    if (changedRows(result) !== 1) {
      const rows = await db
        .select({ status: ecoCollections.status })
        .from(ecoCollections)
        .where(eq(ecoCollections.id, input.id))
        .limit(1);
      if (!rows[0]) notFound("Solicitação de coleta não encontrada.");
      invalidState("Esta solicitação não está mais disponível para revisão.");
    }
    return { success: true } as const;
  });
}

export const ecoRouter = router({
  impact: publicProcedure.query(() => impact()),

  partners: router({
    create: protectedProcedure
      .input(partnerCreateInput)
      .mutation(({ ctx, input }) => createPartner(ctx.user.id, input)),
    mine: protectedProcedure.query(({ ctx }) => listMinePartners(ctx.user.id)),
  }),

  suggestions: router({
    create: protectedProcedure
      .input(suggestionCreateInput)
      .mutation(({ ctx, input }) => createSuggestion(ctx.user, input)),
  }),

  collection: router({
    create: protectedProcedure
      .input(collectionCreateInput)
      .mutation(({ ctx, input }) => createCollection(ctx.user.id, input)),
    mine: protectedProcedure.query(({ ctx }) =>
      listMineCollections(ctx.user.id)
    ),
    cancel: protectedProcedure
      .input(collectionCancelInput)
      .mutation(({ ctx, input }) => cancelCollection(ctx.user.id, input.id)),
  }),

  actions: router({
    create: protectedProcedure
      .input(actionCreateInput)
      .mutation(({ ctx, input }) => createAction(ctx.user.id, input)),
    mine: protectedProcedure.query(({ ctx }) => listMineActions(ctx.user.id)),
  }),

  admin: router({
    overview: adminProcedure.query(() => adminOverview()),
    reviewAction: adminProcedure
      .input(reviewActionInput)
      .mutation(({ ctx, input }) => reviewAction(ctx.user.id, input)),
    reviewPartner: adminProcedure
      .input(reviewPartnerInput)
      .mutation(({ ctx, input }) => reviewPartner(ctx.user.id, input)),
    reviewCollection: adminProcedure
      .input(reviewCollectionInput)
      .mutation(({ ctx, input }) => reviewCollection(ctx.user.id, input)),
  }),
});

export const ecoValidation = {
  partnerCreateInput,
  suggestionCreateInput,
  collectionCreateInput,
  actionCreateInput,
  isValidFutureCollectionDate,
};
