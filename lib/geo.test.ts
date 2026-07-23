import { describe, it, expect } from "vitest";
import { AIRPORTS, airportByIata, projectToSvg } from "./geo";
import { partnersForCountry, estimateDeliveryFee, partnerByName } from "./partners";

describe("geo", () => {
  it("has 16 airports with valid coords", () => {
    expect(AIRPORTS.length).toBe(16);
    for (const a of AIRPORTS) {
      expect(a.lat).toBeGreaterThanOrEqual(-90);
      expect(a.lat).toBeLessThanOrEqual(90);
      expect(a.lng).toBeGreaterThanOrEqual(-180);
      expect(a.lng).toBeLessThanOrEqual(180);
      expect(a.iata).toMatch(/^[A-Z]{3}$/);
    }
  });
  it("airportByIata is case/space tolerant, null on miss", () => {
    expect(airportByIata(" blr ")?.city).toBe("Bengaluru");
    expect(airportByIata("XXX")).toBeNull();
    expect(airportByIata(null)).toBeNull();
  });
  it("projectToSvg maps corners and center", () => {
    expect(projectToSvg(90, -180, 1000, 500)).toEqual({ x: 0, y: 0 });
    expect(projectToSvg(-90, 180, 1000, 500)).toEqual({ x: 1000, y: 500 });
    expect(projectToSvg(0, 0, 1000, 500)).toEqual({ x: 500, y: 250 });
  });
});

describe("partners", () => {
  it("India has local partners", () => {
    const names = partnersForCountry("India").map(p => p.name);
    expect(names).toContain("BlueDart Express");
    expect(names).toContain("Dunzo Local");
  });
  it("unknown country falls back to global partners", () => {
    const names = partnersForCountry("Atlantis").map(p => p.name);
    expect(names).toContain("DHL eCommerce");
    expect(names.length).toBeGreaterThan(0);
  });
  it("estimateDeliveryFee picks the cheapest available", () => {
    expect(estimateDeliveryFee("India")).toBe(19900); // Dunzo
    expect(estimateDeliveryFee("Atlantis")).toBe(99900); // DHL fallback
  });
  it("partnerByName lookup", () => {
    expect(partnerByName("Sendle")?.countries).toContain("Australia");
    expect(partnerByName("Nope")).toBeNull();
  });
});
