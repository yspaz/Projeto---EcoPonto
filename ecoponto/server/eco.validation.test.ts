import { describe, expect, it } from "vitest";
import {
  ecoValidation,
  isCategory,
  isBrazilianState,
  isValidFutureCollectionDate,
} from "./eco";

describe("EcoPonto validations", () => {
  it("accepts only the ten category slugs and Brazilian UFs", () => {
    expect(isCategory("papel")).toBe(true);
    expect(isCategory("eletronicos")).toBe(false);
    expect(isBrazilianState("sp")).toBe(true);
    expect(isBrazilianState("XX")).toBe(false);
  });

  it("accepts only dates from tomorrow through the next 90 days", () => {
    const today = new Date(Date.UTC(2026, 10, 5));
    expect(isValidFutureCollectionDate("2026-11-06", today)).toBe(true);
    expect(isValidFutureCollectionDate("2026-11-05", today)).toBe(false);
    expect(isValidFutureCollectionDate("2027-02-03", today)).toBe(true);
    expect(isValidFutureCollectionDate("2027-02-04", today)).toBe(false);
    expect(isValidFutureCollectionDate("2026-02-30", today)).toBe(false);
  });

  it("rejects health and radioactive collection/action categories", () => {
    expect(
      ecoValidation.collectionCreateInput.safeParse({
        category: "saude",
        material: "material de teste",
        address: "Rua A, 1",
        city: "São Paulo",
        state: "SP",
        date: "2026-11-06",
      }).success
    ).toBe(false);
    expect(
      ecoValidation.actionCreateInput.safeParse({
        category: "radioativos",
        material: "material de teste",
        kg: 1,
        description: "Descrição suficientemente longa",
      }).success
    ).toBe(false);
  });
});
