import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { ecoPartners } from "../drizzle/schema";
import { categories } from "../shared/catalog";
import { getDb } from "./db";
import { publicProcedure, router } from "./_core/trpc";

export interface GeoLocation { lat: number; lng: number; name: string; }
export interface CollectionPoint extends GeoLocation {
  id: string; address: string; hours: string; materials: string[];
  categories: string[]; notes: string; sourceHref: string; distanceKm: number;
}
interface OsmElement { type: "node" | "way" | "relation"; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string>; }
const materialLabels: Record<string, [string, string]> = {
  paper: ["Papel", "papel"], cardboard: ["Papelão", "papel"], cartons: ["Cartonados", "papel"],
  plastic: ["Plástico", "plastico"], plastic_bottles: ["Garrafas plásticas", "plastico"], plastic_packaging: ["Embalagens plásticas", "plastico"],
  glass: ["Vidro", "vidro"], glass_bottles: ["Garrafas de vidro", "vidro"],
  metal: ["Metal", "metal"], scrap_metal: ["Sucata metálica", "metal"], aluminium: ["Alumínio", "metal"], cans: ["Latas", "metal"], steel: ["Aço", "metal"],
  organic: ["Orgânicos", "organicos"], green_waste: ["Resíduos de poda", "organicos"], food_waste: ["Resíduos de alimentos", "organicos"],
  wood: ["Madeira", "madeira"], waste: ["Resíduos gerais", "rejeitos"],
  batteries: ["Pilhas e baterias portáteis", "perigosos"], car_batteries: ["Baterias automotivas", "perigosos"], hazardous_waste: ["Resíduos perigosos (confirmar tipo)", "perigosos"],
  cooking_oil: ["Óleo de cozinha", "especial"], electrical_items: ["Eletroeletrônicos", "especial"], light_bulbs: ["Lâmpadas (confirmar tipo)", "especial"]
};
const geoCache = new Map<string, { time: number; value: GeoLocation[] }>();
const pointCache = new Map<string, { time: number; value: OsmElement[] }>();
let geocodeQueue: Promise<unknown> = Promise.resolve();
let lastGeocode = 0;
function remember<T>(cache: Map<string, { time: number; value: T }>, key: string, value: T) {
  if (cache.size >= 200) cache.delete(cache.keys().next().value!);
  cache.set(key, { time: Date.now(), value });
}
async function fetchJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "User-Agent": "EcoPonto/1.0 (recycling-information; manual-location-search)", "Accept": "application/json", ...init.headers }, signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`Serviço de mapas retornou ${response.status}`);
  return response.json() as Promise<T>;
}
export async function geocodeBrazil(q: string): Promise<GeoLocation[]> {
  const key = q.trim().toLowerCase();
  const cached = geoCache.get(key);
  if (cached && Date.now() - cached.time < 86400000) return cached.value;
  const task = geocodeQueue.catch(() => undefined).then(async () => {
    const wait = 1100 - (Date.now() - lastGeocode);
    if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
    lastGeocode = Date.now();
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.search = new URLSearchParams({ q, format: "jsonv2", countrycodes: "br", limit: "5", "accept-language": "pt-BR" }).toString();
    const result = await fetchJson<{ lat: string; lon: string; display_name: string }[]>(url.toString());
    const value = result.map(item => ({ lat: Number(item.lat), lng: Number(item.lon), name: item.display_name })).filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lng));
    remember(geoCache, key, value); return value;
  });
  geocodeQueue = task;
  return task;
}
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const rad = Math.PI / 180;
  const dlat = (lat2 - lat1) * rad; const dlng = (lng2 - lng1) * rad;
  const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dlng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
export function pointFromOsm(element: OsmElement, lat: number, lng: number): CollectionPoint | null {
  const tags = element.tags ?? {};
  if (tags.access === "private" || tags.access === "no" || tags.disused === "yes") return null;
  const position = { lat: element.lat ?? element.center?.lat, lng: element.lon ?? element.center?.lon };
  if (position.lat === undefined || position.lng === undefined) return null;
  const accepted = Object.entries(materialLabels).filter(([key]) => tags[`recycling:${key}`] === "yes");
  const addressParts = [tags["addr:street"], tags["addr:housenumber"], tags["addr:suburb"], tags["addr:city"], tags["addr:state"], tags["addr:postcode"]].filter(Boolean);
  const address = tags["addr:full"] ?? (addressParts.length ? `${addressParts.join(", ")}${!tags["addr:street"] || !tags["addr:housenumber"] ? " (endereço incompleto na fonte)" : ""}` : "Endereço não informado na fonte");
  return {
    id: `osm-${element.type}-${element.id}`, lat: position.lat, lng: position.lng,
    name: tags.name ?? tags.operator ?? "Ponto de reciclagem (nome não informado)", address,
    hours: tags.opening_hours ?? "Horário não informado na fonte", materials: accepted.map(([, value]) => value[0]),
    categories: Array.from(new Set(accepted.map(([, value]) => value[1]))),
    notes: [tags.description, tags.operator ? `Operador: ${tags.operator}` : "", tags.fee === "yes" ? "A fonte informa cobrança; confirme o valor." : "", !accepted.length ? "Materiais aceitos não informados. Confirme antes de levar qualquer resíduo." : "Aceitação declarada em fonte colaborativa; confirme antes de ir."].filter(Boolean).join(" "),
    sourceHref: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    distanceKm: Math.round(distanceKm(lat, lng, position.lat, position.lng) * 10) / 10
  };
}
async function fetchOsm(lat: number, lng: number): Promise<OsmElement[]> {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = pointCache.get(key);
  if (cached && Date.now() - cached.time < 600000) return cached.value;
  const query = `[out:json][timeout:20];area["ISO3166-1"="BR"]["admin_level"="2"]->.br;nwr(area.br)(around:20000,${lat},${lng})["amenity"="recycling"];out center tags 250;`;
  let lastError: unknown;
  for (const endpoint of ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]) {
    try {
      const data = await fetchJson<{ elements: OsmElement[]; remark?: string }>(endpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ data: query }).toString() });
      if (data.remark || !Array.isArray(data.elements)) throw new Error("A consulta da fonte foi interrompida");
      remember(pointCache, key, data.elements); return data.elements;
    } catch (error) { lastError = error; }
  }
  throw lastError;
}
async function approvedPartners(lat: number, lng: number, category?: string, material?: string): Promise<CollectionPoint[]> {
  // A general-category registration is not evidence of accepting a specific hazardous material.
  if (material || ["saude", "radioativos", "perigosos"].includes(category ?? "")) return [];
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(ecoPartners).where(eq(ecoPartners.status, "aprovado")).limit(25);
  const points: CollectionPoint[] = [];
  for (const row of rows) {
    const ids = Array.isArray(row.materials) ? row.materials as string[] : [];
    if (!row.sourceUrl || (category && !ids.includes(category))) continue;
    // Actual geocoder results, never inferred/generated coordinates. Keep approximation visible.
    const locations = await geocodeBrazil(`${row.address}, ${row.city}, ${row.state}, Brasil`);
    const loc = locations[0];
    if (!loc || distanceKm(lat, lng, loc.lat, loc.lng) > 20) continue;
    points.push({ ...loc, id: `partner-${row.id}`, name: row.name, address: `${row.address}, ${row.city} - ${row.state}`, hours: row.hours, materials: ids.map(id => categories.find(c => c.id === id)?.name ?? id), categories: ids,
      notes: "Cadastro revisado pela administração. Localização aproximada por geocodificação do endereço; confira o endereço e a aceitação com o parceiro.", sourceHref: row.sourceUrl,
      distanceKm: Math.round(distanceKm(lat, lng, loc.lat, loc.lng) * 10) / 10 });
  }
  return points;
}
const categoryIds = [...categories.map(item => item.id), "especial"];
export const mapRouter = router({
  geocode: publicProcedure.input(z.object({ q: z.string().trim().min(3, "Informe cidade, bairro ou CEP com pelo menos 3 caracteres.").max(200) })).query(async ({ input }) => {
    try { return await geocodeBrazil(input.q); }
    catch { throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "A busca de localização está indisponível no momento. Tente novamente ou use sua localização." }); }
  }),
  points: publicProcedure.input(z.object({ lat: z.number().finite().min(-34).max(6), lng: z.number().finite().min(-74).max(-32), category: z.string().refine(value => categoryIds.includes(value)).optional(), material: z.enum(["batteries", "car_batteries", "cooking_oil"]).optional() })).query(async ({ input }) => {
    const { lat, lng, category, material } = input;
    if (["saude", "radioativos"].includes(category ?? "")) return { points: [] as CollectionPoint[], source: "Gerenciamento especializado: não existem pontos domésticos listados para essa categoria.", updatedAt: new Date().toISOString() };
    try {
      const elements = await fetchOsm(lat, lng);
      const osm = elements.filter(element => !material || element.tags?.[`recycling:${material}`] === "yes").map(element => pointFromOsm(element, lat, lng)).filter((point): point is CollectionPoint => point !== null && (!category || point.categories.includes(category)));
      let partners: CollectionPoint[] = []; let partnerError = false;
      try { partners = await approvedPartners(lat, lng, category, material); } catch { partnerError = true; }
      return { points: [...osm, ...partners].sort((a, b) => a.distanceKm - b.distanceKm), source: `OpenStreetMap via Overpass · raio de 20 km${partnerError ? " · cadastros parceiros temporariamente indisponíveis" : " · parceiros revisados quando disponíveis"}`, updatedAt: new Date().toISOString() };
    } catch { throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "A fonte de pontos de coleta não respondeu. Não exibimos locais inventados: tente novamente ou consulte a prefeitura e os canais de logística reversa." }); }
  })
});
