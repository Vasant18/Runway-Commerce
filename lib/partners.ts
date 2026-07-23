// Synthetic last-mile delivery partners. Coverage is by country; fees are flat
// synthetic tiers in MINOR units of the order currency (demo only — a real build
// would quote per-carrier).

export type DeliveryPartner = {
  name: string;
  countries: string[]; // "*" = global fallback
  feeMinor: number;    // flat synthetic fee in minor units
};

export const PARTNERS: DeliveryPartner[] = [
  { name: "BlueDart Express", countries: ["India"], feeMinor: 34900 },
  { name: "Dunzo Local", countries: ["India"], feeMinor: 19900 },
  { name: "FedEx Local", countries: ["USA", "Canada"], feeMinor: 129900 },
  { name: "UPS Ground", countries: ["USA"], feeMinor: 109900 },
  { name: "DHL eCommerce", countries: ["UK", "France", "Germany", "Netherlands", "*"], feeMinor: 99900 },
  { name: "Lalamove", countries: ["Singapore", "UAE", "Japan", "South Korea"], feeMinor: 89900 },
  { name: "Sendle", countries: ["Australia"], feeMinor: 79900 },
  { name: "Loggi", countries: ["Brazil"], feeMinor: 49900 },
];

export function partnersForCountry(country: string): DeliveryPartner[] {
  const c = country.trim().toLowerCase();
  const direct = PARTNERS.filter(p => p.countries.some(x => x.toLowerCase() === c));
  if (direct.length > 0) return direct;
  return PARTNERS.filter(p => p.countries.includes("*"));
}

// Default delivery-fee estimate for a destination country: the cheapest partner there.
export function estimateDeliveryFee(country: string): number {
  const options = partnersForCountry(country);
  if (options.length === 0) return 99900;
  return Math.min(...options.map(p => p.feeMinor));
}

export function partnerByName(name: string): DeliveryPartner | null {
  return PARTNERS.find(p => p.name === name) ?? null;
}
