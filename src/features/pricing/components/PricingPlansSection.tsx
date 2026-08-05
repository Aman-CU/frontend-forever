import {
  MONTHLY_LIST_PRICE_USD,
  PRICING_PLANS,
  formatUsd,
} from "@/features/pricing/lib/plans";
import type { PricingViewerState } from "@/features/pricing/lib/viewer";
import { LifetimePlanCard } from "@/features/pricing/components/LifetimePlanCard";
import { PlanCard } from "@/features/pricing/components/PlanCard";

type Props = {
  viewerState: PricingViewerState;
};

// Lifetime on top at full width, then the three subscription plans in a row —
// the explicit layout asked for, and the one that reads best: the strongest
// offer isn't competing for attention with three cards beside it.
export function PricingPlansSection({ viewerState }: Props) {
  return (
    <section
      id="plans"
      aria-label="Premium plans"
      className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-6 px-6 py-10 md:px-8 md:py-12"
    >
      <LifetimePlanCard viewerState={viewerState} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {PRICING_PLANS.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            viewerState={viewerState}
            delay={0.08 * index}
          />
        ))}
      </div>

      <p className="mt-2 text-center text-xs leading-relaxed text-text-muted">
        Prices in USD. Every plan unlocks exactly the same premium content — they differ only
        in how long access lasts. Discounts are calculated against the{" "}
        {formatUsd(MONTHLY_LIST_PRICE_USD)} per month plan.
      </p>
    </section>
  );
}
