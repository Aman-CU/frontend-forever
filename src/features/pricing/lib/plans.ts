// Feature 38 Stage 9 — the single source of truth for what Premium costs.
//
// Everything on the pricing page (headline price, struck-through "was", the
// "% off" pills, the savings copy) is DERIVED from the four numbers below
// rather than written out by hand. A hardcoded "66% off" next to a price the
// numbers don't actually support is the classic way a pricing page goes
// quietly wrong — and it's the kind of wrong that's a legal problem, not just
// a typo. Change a price here and every percentage on the page follows.
//
// One premium tier, not a feature ladder: `profiles.isPremium` is a single
// boolean, so every plan below unlocks exactly the same content. They differ
// only in how long access lasts and what it costs. The per-plan bullet lists
// reflect that honestly instead of inventing tier-only features that the
// gating layer has no way to enforce.

// The list price every discount on the page is measured against. This is the
// real month-to-month price, not an inflated anchor invented to make the
// other plans look better.
export const MONTHLY_LIST_PRICE_USD = 29;

export type PlanId = "monthly" | "quarterly" | "annual";

export type PricingPlan = {
  id: PlanId;
  name: string;
  /** Effective cost per month — the big number on the card. */
  pricePerMonth: number;
  /** What actually gets charged each billing cycle. */
  billedTotal: number;
  /** Cycle length in months — also the divisor behind `pricePerMonth`. */
  months: number;
  cadenceLabel: string;
  ctaLabel: string;
  /** Plan-specific lines, appended to the shared unlock list. */
  perks: string[];
  isRecommended?: boolean;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "monthly",
    name: "Monthly",
    pricePerMonth: 29,
    billedTotal: 29,
    months: 1,
    cadenceLabel: "Billed monthly",
    ctaLabel: "Get Monthly",
    perks: ["Renews monthly — cancel anytime"],
  },
  {
    id: "quarterly",
    name: "Quarterly",
    pricePerMonth: 19,
    billedTotal: 57,
    months: 3,
    cadenceLabel: "Billed $57 every 3 months",
    ctaLabel: "Get Quarterly",
    perks: ["Renews quarterly — cancel anytime", "Enough runway for a full interview loop"],
  },
  {
    id: "annual",
    name: "Annual",
    pricePerMonth: 10,
    billedTotal: 120,
    months: 12,
    cadenceLabel: "Billed $120 per year",
    ctaLabel: "Get Annual",
    perks: [
      "Renews yearly — cancel anytime",
      "Best value if you're preparing over a few months",
    ],
    isRecommended: true,
  },
];

export type LifetimePlan = {
  id: "lifetime";
  name: string;
  price: number;
  ctaLabel: string;
  perks: string[];
};

export const LIFETIME_PLAN: LifetimePlan = {
  id: "lifetime",
  name: "Lifetime",
  price: 180,
  ctaLabel: "Get Lifetime",
  perks: [
    "One payment — never renews, never expires",
    "Every premium feature we ship from here on is included",
  ],
};

// The comparison window for lifetime: what one year on the month-to-month
// plan would cost. Twelve months is the fairest honest anchor — it's a real
// price someone could actually pay, unlike a made-up "regular $399" figure.
const LIFETIME_COMPARISON_MONTHS = 12;

/** What this plan's cycle would cost at the month-to-month list price. */
export function listPriceFor(months: number): number {
  return MONTHLY_LIST_PRICE_USD * months;
}

/** Whole-percent discount vs. paying month-to-month for the same period. */
export function discountPercentFor(billedTotal: number, months: number): number {
  return Math.round((1 - billedTotal / listPriceFor(months)) * 100);
}

export function planDiscountPercent(plan: PricingPlan): number {
  return discountPercentFor(plan.billedTotal, plan.months);
}

export function planSavings(plan: PricingPlan): number {
  return listPriceFor(plan.months) - plan.billedTotal;
}

export const LIFETIME_LIST_PRICE = listPriceFor(LIFETIME_COMPARISON_MONTHS);

export const LIFETIME_DISCOUNT_PERCENT = discountPercentFor(
  LIFETIME_PLAN.price,
  LIFETIME_COMPARISON_MONTHS,
);

// How many months of the monthly plan it takes to exceed the lifetime price —
// the "it pays for itself in N months" line. Ceil, because you'd be charged
// for the whole month that tips it over.
export const LIFETIME_BREAK_EVEN_MONTHS = Math.ceil(
  LIFETIME_PLAN.price / MONTHLY_LIST_PRICE_USD,
);

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}
