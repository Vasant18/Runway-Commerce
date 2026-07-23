import { describe, it, expect } from "vitest";
import {
  PLATFORM_FEE_PCT, estimatePlatformFee, computeTotals, computeOrderTotals,
  computeSavings, formatMoney, toMinorUnits, fromMinorUnits,
} from "./money";

describe("estimatePlatformFee", () => {
  it("is 5% of product+reward, rounded", () => {
    // 400000 + 15000 = 415000 * 0.05 = 20750
    expect(estimatePlatformFee(400000, 15000)).toBe(20750);
  });
  it("rounds to nearest integer", () => {
    expect(estimatePlatformFee(101, 0)).toBe(5); // 5.05 -> 5
  });
});

describe("computeTotals", () => {
  it("sums product + reward + fee", () => {
    const { platformFee, totalCost } = computeTotals({ productPrice: 400000, travelerReward: 15000 });
    expect(platformFee).toBe(20750);
    expect(totalCost).toBe(435750);
  });
});

describe("computeOrderTotals", () => {
  it("adds delivery fee to the grand total", () => {
    const { platformFee, totalCost } = computeOrderTotals({ productPrice: 400000, travelerReward: 15000, deliveryFee: 34900 });
    expect(platformFee).toBe(20750); // unchanged: 5% of product+reward only
    expect(totalCost).toBe(470650);  // 400000 + 15000 + 20750 + 34900
  });
  it("zero delivery fee degrades to computeTotals", () => {
    expect(computeOrderTotals({ productPrice: 400000, travelerReward: 15000, deliveryFee: 0 }).totalCost)
      .toBe(computeTotals({ productPrice: 400000, travelerReward: 15000 }).totalCost);
  });
});

describe("computeSavings", () => {
  it("returns local - total when local given", () =>
    expect(computeSavings(500000, 435750)).toBe(64250));
  it("returns null when local missing", () =>
    expect(computeSavings(null, 435750)).toBeNull());
  it("can be negative (no floor)", () =>
    expect(computeSavings(400000, 435750)).toBe(-35750));
});

describe("unit conversion", () => {
  it("major -> minor", () => expect(toMinorUnits(4000)).toBe(400000));
  it("minor -> major", () => expect(fromMinorUnits(400000)).toBe(4000));
});

describe("formatMoney", () => {
  it("formats minor units in the currency", () => {
    const s = formatMoney(435750, "USD");
    expect(s).toMatch(/4,357\.50/); // $4,357.50
  });
  it("exposes the fee constant", () => expect(PLATFORM_FEE_PCT).toBe(0.05));
});
