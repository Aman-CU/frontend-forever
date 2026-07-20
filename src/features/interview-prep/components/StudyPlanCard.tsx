import Link from "next/link";
import { ArrowRight, Clock, ListChecks } from "lucide-react";

import type { StudyPlanSummary } from "@/features/interview-prep/lib/studyPlanQueries";

type Props = {
  plan: StudyPlanSummary;
};

// List page card (/interview-prep/study-plans) — same card language as
// CollectionRow/CompanyGuideCard. isPremium renders a PremiumBadge-style
// pill (no shared PremiumBadge component exists in this codebase yet —
// every premium indicator so far is an inline pill, see QuestionCard's
// Lock-badged "Premium" pill) rather than blur/lock UI, since real
// enforcement is deferred to Feature 38 (build-plan.md).
export function StudyPlanCard({ plan }: Props) {
  return (
    <Link
      href={`/interview-prep/study-plans/${plan.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-text-primary">{plan.title}</h3>
        {plan.isPremium && (
          <span className="shrink-0 rounded-full bg-premium-light px-2.5 py-1 text-xs font-semibold text-premium">
            Premium
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">{plan.description}</p>

      <div className="mt-1 flex items-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {plan.hoursCommitment}
        </span>
        <span className="flex items-center gap-1.5">
          <ListChecks className="h-3.5 w-3.5" aria-hidden />
          {plan.itemCount} steps
        </span>
      </div>

      <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-accent">
        View plan
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
