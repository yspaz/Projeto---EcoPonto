import {
  date,
  double,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Manually submitted collection partners and suggested points. Suggestions use
 * the same table, but are kept distinguishable until an administrator reviews them.
 */
export const ecoPartners = mysqlTable(
  "eco_partners",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    kind: mysqlEnum("kind", [
      "empresa",
      "cooperativa",
      "ecoponto",
      "instituicao",
    ]).notNull(),
    address: text("address").notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    state: varchar("state", { length: 2 }).notNull(),
    contact: varchar("contact", { length: 320 }).notNull(),
    materials: json("materials").notNull(),
    hours: text("hours").notNull(),
    sourceUrl: varchar("sourceUrl", { length: 2048 }),
    submissionType: mysqlEnum("submissionType", ["cadastro", "sugestao"])
      .default("cadastro")
      .notNull(),
    status: mysqlEnum("status", ["pendente", "aprovado", "rejeitado"])
      .default("pendente")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    reviewedAt: timestamp("reviewedAt"),
    reviewedBy: int("reviewedBy").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  table => ({
    userIdIdx: index("eco_partners_user_id_idx").on(table.userId),
    statusIdx: index("eco_partners_status_idx").on(table.status),
  })
);

/** A preferred collection request; its date never implies a confirmed booking. */
export const ecoCollections = mysqlTable(
  "eco_collections",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: varchar("category", { length: 32 }).notNull(),
    material: varchar("material", { length: 200 }).notNull(),
    address: text("address").notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    state: varchar("state", { length: 2 }).notNull(),
    preferredDate: date("preferredDate", { mode: "string" }).notNull(),
    notes: text("notes"),
    status: mysqlEnum("status", [
      "pendente",
      "em_analise",
      "confirmada",
      "concluida",
      "cancelada",
    ])
      .default("pendente")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    reviewedAt: timestamp("reviewedAt"),
    reviewedBy: int("reviewedBy").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  table => ({
    userIdIdx: index("eco_collections_user_id_idx").on(table.userId),
    statusIdx: index("eco_collections_status_idx").on(table.status),
  })
);

/** Self-reported actions remain pending until an administrator validates them. */
export const ecoActions = mysqlTable(
  "eco_actions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: varchar("category", { length: 32 }).notNull(),
    material: varchar("material", { length: 200 }).notNull(),
    kg: double("kg").notNull(),
    description: text("description").notNull(),
    status: mysqlEnum("status", ["pendente", "aprovada", "rejeitada"])
      .default("pendente")
      .notNull(),
    points: int("points").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    reviewedAt: timestamp("reviewedAt"),
    reviewedBy: int("reviewedBy").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  table => ({
    userIdIdx: index("eco_actions_user_id_idx").on(table.userId),
    statusIdx: index("eco_actions_status_idx").on(table.status),
  })
);

export type EcoPartner = typeof ecoPartners.$inferSelect;
export type EcoCollection = typeof ecoCollections.$inferSelect;
export type EcoAction = typeof ecoActions.$inferSelect;
