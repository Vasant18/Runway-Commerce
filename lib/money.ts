export const PLATFORM_FEE_PCT = 0.05;

export function estimatePlatformFee(productPrice: number, travelerReward: number): number {
  return Math.round((productPrice + travelerReward) * PLATFORM_FEE_PCT);
}

export function computeTotals(input: { productPrice: number; travelerReward: number }): {
  platformFee: number; totalCost: number;
} {
  const platformFee = estimatePlatformFee(input.productPrice, input.travelerReward);
  const totalCost = input.productPrice + input.travelerReward + platformFee;
  return { platformFee, totalCost };
}

export function computeSavings(localPrice: number | null | undefined, totalCost: number): number | null {
  if (localPrice == null) return null;
  return localPrice - totalCost;
}

export function toMinorUnits(major: number): number { return Math.round(major * 100); }
export function fromMinorUnits(minor: number): number { return minor / 100; }

export function formatMoney(minorUnits: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(fromMinorUnits(minorUnits));
  } catch {
    // unknown currency code → fall back to a plain number + code
    return `${fromMinorUnits(minorUnits).toLocaleString("en-US", { minimumFractionDigits: 2 })} ${currency}`;
  }
}
