import { describe, it, expect } from "vitest";
import { airlineTheme, airlineThemeVars } from "./airlines";

describe("airlineTheme", () => {
  it("maps known airlines to their accents", () => {
    expect(airlineTheme("Emirates").accent).toBe("#D71920");
    expect(airlineTheme("Qatar Airways").accent).toBe("#5C0632");
    expect(airlineTheme("United").accent).toBe("#0033A0");
  });

  it("is case/whitespace insensitive", () => {
    expect(airlineTheme(" emirates ").accent).toBe("#D71920");
    expect(airlineTheme("BRITISH AIRWAYS").accent).toBe("#1E3A5F");
  });

  it("falls back to amber for unknown or missing airlines", () => {
    expect(airlineTheme("Zephyr Air").accent).toBe("#F9A600");
    expect(airlineTheme(null).accent).toBe("#F9A600");
    expect(airlineTheme(undefined).accent).toBe("#F9A600");
  });

  it("exposes CSS custom props", () => {
    const vars = airlineThemeVars("Emirates");
    expect(vars["--tk-accent"]).toBe("#D71920");
    expect(vars["--tk-badge"]).toBe("#C9A24B");
  });
});
