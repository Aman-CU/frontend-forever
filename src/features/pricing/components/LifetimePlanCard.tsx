"use client";

import { motion } from "framer-motion";
import { Check, Infinity as InfinityIcon } from "lucide-react";

import { PREMIUM_INCLUDES } from "@/features/pricing/lib/catalog";
import {
  LIFETIME_BREAK_EVEN_MONTHS,
  LIFETIME_DISCOUNT_PERCENT,
  LIFETIME_LIST_PRICE,
  LIFETIME_PLAN,
  formatUsd,
} from "@/features/pricing/lib/plans";
import type { PricingViewerState } from "@/features/pricing/lib/viewer";
import { PlanCtaButton } from "@/features/pricing/components/PlanCtaButton";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

type Props = {
  viewerState: PricingViewerState;
};

// Sits above the three subscription cards, full width, because it's the plan
// with the strongest offer and the one that reads worst squeezed into a
// third of a row. Two columns on desktop — price and commitment on the left,
// the full unlock list on the right — so the value is legible without the
// user having to compare four cards at once.
export function LifetimePlanCard({ viewerState }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: EASE }}
      aria-labelledby="lifetime-plan-heading"
      className="relative overflow-hidden rounded-2xl border-2 border-premium/40 bg-surface shadow-lg"
    >
      {/* Soft premium wash — decorative only, sits behind the content */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-premium opacity-[0.07] blur-3xl"
      />

      <div className="relative grid grid-cols-1 gap-8 p-6 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-10 md:p-8">
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3
              id="lifetime-plan-heading"
              className="text-xl font-bold text-text-primary"
            >
              {LIFETIME_PLAN.name}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-premium-light px-2.5 py-0.5 text-xs font-semibold text-premium">
              <InfinityIcon className="size-3" aria-hidden />
              Forever access
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-sm text-text-muted line-through">
              {formatUsd(LIFETIME_LIST_PRICE)}
            </span>
            <span className="rounded-full bg-success-light px-2 py-0.5 text-xs font-semibold text-success">
              {LIFETIME_DISCOUNT_PERCENT}% off
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight text-text-primary md:text-6xl">
              {formatUsd(LIFETIME_PLAN.price)}
            </span>
            <span className="text-base text-text-secondary">paid once</span>
          </div>

          <p className="mt-2.5 text-sm text-text-secondary">
            Less than {LIFETIME_BREAK_EVEN_MONTHS} months on the monthly plan, compared against{" "}
            {formatUsd(LIFETIME_LIST_PRICE)} for a year of it — then never again.
          </p>

          <div className="mt-6">
            <PlanCtaButton label={LIFETIME_PLAN.ctaLabel} viewerState={viewerState} emphasis />
          </div>
        </div>

        <div className="flex flex-col md:border-l md:border-border-light md:pl-10">
          <p id="included" className="scroll-mt-24 text-sm font-semibold text-text-primary">
            Everything premium on the platform, permanently
          </p>
          {/* CSS multi-column, not a 2-col grid: grid couples each pair of
              items to a shared row height, so one three-line bullet leaves a
              visible hole beside its one-line neighbour. Columns let the list
              flow and balance instead. */}
          <ul className="mt-4 flex flex-col gap-2.5 lg:block lg:columns-2 lg:gap-x-8 lg:space-y-2.5">
            {[...PREMIUM_INCLUDES, ...LIFETIME_PLAN.perks].map((item) => (
              <li key={item} className="flex items-start gap-2.5 break-inside-avoid">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                <span className="text-sm leading-relaxed text-text-secondary">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.section>
  );
}
