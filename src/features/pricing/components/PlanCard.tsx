"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  PREMIUM_INCLUDES_HIGHLIGHTS,
  PREMIUM_INCLUDES_REMAINDER,
} from "@/features/pricing/lib/catalog";
import {
  MONTHLY_LIST_PRICE_USD,
  formatUsd,
  planDiscountPercent,
  planSavings,
  type PricingPlan,
} from "@/features/pricing/lib/plans";
import type { PricingViewerState } from "@/features/pricing/lib/viewer";
import { PlanCtaButton } from "@/features/pricing/components/PlanCtaButton";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

type Props = {
  plan: PricingPlan;
  viewerState: PricingViewerState;
  delay?: number;
};

export function PlanCard({ plan, viewerState, delay = 0 }: Props) {
  const discount = planDiscountPercent(plan);
  const savings = planSavings(plan);
  // Monthly is the anchor, so it has no discount to show and no crossed-out
  // "was" price — showing "0% off" or striking $29 through to $29 would be
  // theatre. Only the plans that genuinely cost less get the treatment.
  const isDiscounted = discount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      aria-labelledby={`plan-${plan.id}-heading`}
      className={cn(
        "relative flex flex-col rounded-2xl border bg-surface p-6 shadow-sm transition-shadow duration-200 hover:shadow-md",
        plan.isRecommended ? "border-2 border-accent shadow-md" : "border-border",
      )}
    >
      {plan.isRecommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-sm">
          Most popular
        </span>
      )}

      {/* No extra top margin on the recommended card: the badge is absolutely
          positioned above the border (-top-3) and never overlaps the heading
          at p-6, so nudging this down only knocked the whole Annual column
          ~6px out of line with the other two. */}
      <h3 id={`plan-${plan.id}-heading`} className="text-lg font-bold text-text-primary">
        {plan.name}
      </h3>

      <div className="mt-4 flex min-h-6 flex-wrap items-center gap-x-2.5 gap-y-1">
        {isDiscounted && (
          <>
            <span className="text-sm text-text-muted line-through">
              {formatUsd(MONTHLY_LIST_PRICE_USD)}/mo
            </span>
            <span className="rounded-full bg-success-light px-2 py-0.5 text-xs font-semibold text-success">
              {discount}% off
            </span>
          </>
        )}
      </div>

      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-4xl font-bold tracking-tight text-text-primary">
          {formatUsd(plan.pricePerMonth)}
        </span>
        <span className="text-sm text-text-secondary">/month</span>
      </div>

      <p className="mt-2 text-sm text-text-secondary">{plan.cadenceLabel}</p>
      {/* min-h keeps the three CTAs on one baseline whether or not a card has
          a savings line — without it the monthly card's button sits higher. */}
      <p className="mt-1 min-h-5 text-sm font-medium text-success">
        {isDiscounted ? `You save ${formatUsd(savings)} per cycle` : ""}
      </p>

      <div className="mt-6">
        <PlanCtaButton
          label={plan.ctaLabel}
          viewerState={viewerState}
          emphasis={plan.isRecommended}
        />
      </div>

      <div className="mt-6 border-t border-border-light pt-6">
        {/* Stated explicitly so a shorter list on the cheaper cards can't be
            misread as a smaller plan — there is only one Premium tier. */}
        <p className="text-sm font-semibold text-text-primary">Full Premium access</p>

        <ul className="mt-3 flex flex-col gap-2.5">
          {[...PREMIUM_INCLUDES_HIGHLIGHTS, ...plan.perks].map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <span className="text-sm leading-relaxed text-text-secondary">{item}</span>
            </li>
          ))}
        </ul>

        <a
          href="#included"
          className="mt-3 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          + {PREMIUM_INCLUDES_REMAINDER} more included
        </a>
      </div>
    </motion.div>
  );
}
