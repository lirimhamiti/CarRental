export type PlanTier = "SMALL" | "LARGE";
export type PlanInterval = "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "ANNUAL";

export interface PricingPlan {
  tier: PlanTier;
  interval: PlanInterval;
  priceId: string;
  amountEur: number;
}

// Amounts here are for display only — the amount actually charged always
// comes from the Stripe Price object itself. Keeping both together avoids
// an extra Stripe API round-trip just to render the pricing table.
export const PRICING_PLANS: PricingPlan[] = [
  { tier: "SMALL", interval: "MONTHLY", priceId: "price_1UIpngCOsFcz6y3OWXMMnk2l", amountEur: 35 },
  { tier: "SMALL", interval: "QUARTERLY", priceId: "price_1UIpoPCOsFcz6y3Opv6EpiYP", amountEur: 100 },
  { tier: "SMALL", interval: "SEMIANNUAL", priceId: "price_1UIpoiCOsFcz6y3OQ7WXuqt1", amountEur: 180 },
  { tier: "SMALL", interval: "ANNUAL", priceId: "price_1UIpoyCOsFcz6y3OprhOWmHt", amountEur: 340 },
  { tier: "LARGE", interval: "MONTHLY", priceId: "price_1UIppRCOsFcz6y3OwWJEbOwq", amountEur: 50 },
  { tier: "LARGE", interval: "QUARTERLY", priceId: "price_1UIppiCOsFcz6y3OGO8fejHh", amountEur: 130 },
  { tier: "LARGE", interval: "SEMIANNUAL", priceId: "price_1UIppxCOsFcz6y3OTejRgUBs", amountEur: 240 },
  { tier: "LARGE", interval: "ANNUAL", priceId: "price_1UIpqACOsFcz6y3OnqS9kzSZ", amountEur: 450 },
];

export function findPlan(priceId: string): PricingPlan | undefined {
  return PRICING_PLANS.find((plan) => plan.priceId === priceId);
}
