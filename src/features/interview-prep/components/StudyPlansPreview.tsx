import Link from "next/link";
import { ArrowRight, Clock, Flame, Star, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PremiumBadge } from "@/components/shared/PremiumBadge";
import type { StudyPlanSummary } from "@/features/interview-prep/lib/studyPlanQueries";

// Icon per plan slug — meta only, no per-plan color (matches
// COLLECTION_META/PLAYBOOK_META's monochrome-icon precedent, GreatFrontEnd's
// own Dashboard treatment).
const ICON_BY_SLUG: Record<string, LucideIcon> = {
  "1-week": Zap,
  "1-month": Flame,
  "3-months": Star,
};

type Props = {
  plans: StudyPlanSummary[];
  isPremiumUser: boolean;
};

// Converted from a static, schema-less teaser (Feature 30) to a real
// server-rendered row, same conversion Feature 50 did for PlaybookPreview —
// title/description/hoursCommitment now come from the study_plans table
// (Feature 51), not hardcoded copy.
export function StudyPlansPreview({ plans, isPremiumUser }: Props) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Study Plans
        </h2>
        <Link
          href="/interview-prep/study-plans"
          className="flex items-center gap-1 text-xs font-semibold text-accent transition-colors hover:text-accent-dark"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {plans.map((plan) => {
          const Icon = ICON_BY_SLUG[plan.slug] ?? Zap;
          return (
            <Link
              key={plan.slug}
              href={`/interview-prep/study-plans/${plan.slug}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
                <Icon className="h-5 w-5 text-text-secondary" aria-hidden />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-text-primary">{plan.title}</h3>
                  {plan.isPremium && <PremiumBadge isPremiumUser={isPremiumUser} size="xs" />}
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted">
                  {plan.description}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {plan.hoursCommitment}
                </div>
              </div>

              <ArrowRight
                className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
