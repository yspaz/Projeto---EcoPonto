import { describe, it, expect } from "vitest";
import { categories, searchMaterials } from "../shared/catalog";
import { distanceKm, pointFromOsm } from "./mapRouter";

describe("Guia de resíduos", () => {
  it("mantém as dez categorias de coleta seletiva", () => {
    expect(categories).toHaveLength(10);
    expect(new Set(categories.map(item => item.id)).size).toBe(10);
    expect(categories.find(item => item.id === "saude")?.colorName).toBe("Branco");
    expect(categories.find(item => item.id === "perigosos")?.colorName).toBe("Laranja");
  });
  it.each([["pilhas", "perigosos"], ["garrafas PET", "plastico"], ["papelão", "papel"], ["vidro", "vidro"], ["óleo de cozinha", "especial"]])("classifica %s sem perder seu destino específico", (query, expected) => {
    expect(searchMaterials(query)[0].category).toBe(expected);
  });
  it("diferencia pilhas domésticas de baterias automotivas", () => {
    expect(searchMaterials("pilhas")[0].mapMaterial).toBe("batteries");
    expect(searchMaterials("bateria de carro")[0].mapMaterial).toBe("car_batteries");
  });
  it("não finge saber materiais desconhecidos", () => {
    expect(searchMaterials("material totalmente desconhecido xyz")).toEqual([]);
  });
});
describe("Dados reais do mapa", () => {
  it("não supõe materiais, endereço ou horário ausentes", () => {
    const point = pointFromOsm({ type: "node", id: 1, lat: -23, lon: -46, tags: { name: "Objeto sintético para teste unitário" } }, -23, -46);
    expect(point?.materials).toEqual([]);
    expect(point?.address).toContain("não informado");
    expect(point?.hours).toContain("não informado");
  });
  it("usa somente aceitação expressa e respeita acesso privado", () => {
    const element = { type: "node" as const, id: 2, lat: -23, lon: -46, tags: { "recycling:batteries": "yes", "recycling:glass": "no" } };
    expect(pointFromOsm(element, -23, -46)?.materials).toEqual(["Pilhas e baterias portáteis"]);
    expect(pointFromOsm({ ...element, tags: { access: "private" } }, -23, -46)).toBeNull();
  });
  it("calcula distância aproximada entre coordenadas, sem inventar deslocamento", () => {
    expect(distanceKm(-23, -46, -23, -46)).toBe(0);
    expect(distanceKm(-23, -46, -24, -46)).toBeGreaterThan(100);
  });
});
