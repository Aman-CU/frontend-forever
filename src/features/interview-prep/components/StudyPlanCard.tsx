import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, ListChecks, Target, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StudyPlanSlug } from "@/lib/constants";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import type { StudyPlanSummary } from "@/features/interview-prep/lib/studyPlanQueries";

type Props = {
  plan: StudyPlanSummary;
  isPremiumUser: boolean;
};

// Per-plan icon + tint, keyed by slug — same "small inline meta map" pattern
// as StudyPlanItemRow's ITEM_TYPE_ICON, just 3 entries so it isn't worth its
// own file. Zap/streak for the cram-fast 1-Week, CalendarDays/info for the
// steady-pace 1-Month, Target/accent for the flagship long-runway 3-Months —
// distinct from the shared `premium` token so the icon doesn't visually
// collide with the "Premium" pill every plan already carries.
const PLAN_ICON: Record<StudyPlanSlug, LucideIcon> = {
  "1-week": Zap,
  "1-month": CalendarDays,
  "3-months": Target,
};

const PLAN_ICON_BG: Record<StudyPlanSlug, string> = {
  "1-week": "bg-streak-light",
  "1-month": "bg-info-muted",
  "3-months": "bg-accent-muted",
};

const PLAN_ICON_TEXT: Record<StudyPlanSlug, string> = {
  "1-week": "text-streak",
  "1-month": "text-info",
  "3-months": "text-accent",
};

// List page card (/interview-prep/study-plans) — same card language as
// CollectionRow/CompanyGuideCard. Real enforcement (the detail page's wall)
// and the shared PremiumBadge both landed in Feature 38.
export function StudyPlanCard({ plan, isPremiumUser }: Props) {
  const Icon = PLAN_ICON[plan.slug];

  return (
    <Link
      href={`/interview-prep/study-plans/${plan.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            PLAN_ICON_BG[plan.slug],
          )}
        >
          <Icon className={cn("h-5 w-5", PLAN_ICON_TEXT[plan.slug])} aria-hidden />
        </div>
        {plan.isPremium && <PremiumBadge isPremiumUser={isPremiumUser} />}
      </div>

      <h3 className="mt-3.5 text-lg font-semibold text-text-primary">{plan.title}</h3>
      <p className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-text-secondary">
        {plan.description}
      </p>

      {/* Pinned to the bottom regardless of description length, so every
          card in the row lines up on the same footer/CTA baseline. */}
      <div className="mt-auto flex flex-col gap-3 pt-5">
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {plan.hoursCommitment}
          </span>
          <span className="flex items-center gap-1.5">
            <ListChecks className="h-3.5 w-3.5" aria-hidden />
            {plan.itemCount} steps
          </span>
        </div>

        <span className="flex items-center gap-1 text-sm font-semibold text-accent">
          View plan
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
