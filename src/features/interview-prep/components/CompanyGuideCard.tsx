import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { PremiumBadge } from "@/components/shared/PremiumBadge";
import type { CompanyGuideSummary } from "@/features/interview-prep/lib/queries";
import { CompanyBadge } from "@/features/interview-prep/components/CompanyBadge";

type Props = {
  company: CompanyGuideSummary;
  // Every company guide is premium (Feature 38) — no per-company split, so
  // this isn't conditional on the company like PremiumBadge's other call
  // sites are on their own item's isPremium flag.
  isPremiumUser: boolean;
};

// Grid card for /interview-prep/company-guides — same
// hover/border-radius/shadow language as CollectionRow/StudyPlanCard, laid
// out as a grid card (not a full-width row) since 32 companies need to scan
// as a grid, not a long list. Honest zero counts render as "Coming soon"
// rather than "0 questions" — same empty-state precedent as CollectionRow.
export function CompanyGuideCard({ company, isPremiumUser }: Props) {
  const total = company.questionCount + company.challengeCount;
  const isComingSoon = total === 0;

  return (
    <Link
      href={`/interview-prep/company-guides/${company.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
    >
      <CompanyBadge name={company.name} />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-text-primary">{company.name}</h3>
          <PremiumBadge isPremiumUser={isPremiumUser} size="xs" iconOnly />
        </div>
        {isComingSoon ? (
          <span className="mt-0.5 inline-block rounded-full bg-surface-secondary px-2 py-0.5 text-[0.6875rem] font-semibold text-text-secondary">
            Coming soon
          </span>
        ) : (
          <p className="mt-0.5 truncate text-xs text-text-muted">
            {total} question{total === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <ChevronRight
        className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
        aria-hidden
      />
    </Link>
  );
}
