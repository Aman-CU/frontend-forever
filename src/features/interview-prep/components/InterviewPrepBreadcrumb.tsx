import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type Crumb = {
  label: string;
  // Omit href on the last (current-page) crumb.
  href?: string;
};

type Props = {
  // Where the circular back-arrow goes — the Get Started page for the
  // Collection List page, the Collection List for the Question page.
  backHref: string;
  crumbs: Crumb[];
};

// Same shape as Practice's PracticeBreadcrumb (Feature 29) — kept as its own
// feature-scoped copy rather than a cross-feature import, per this codebase's
// feature-first structure (AGENTS.md rule 3).
export function InterviewPrepBreadcrumb({ backHref, crumbs }: Props) {
  const lastIndex = crumbs.length - 1;

  return (
    <div className="mb-4 flex items-center gap-5">
      <Link
        href={backHref}
        aria-label="Back"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden />
      </Link>
      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
        {crumbs.map((crumb, index) => {
          const isLast = index === lastIndex;
          const isMiddle = index > 0 && !isLast;

          return (
            <span
              key={index}
              className={cn(
                "flex min-w-0 items-center gap-1.5",
                isMiddle && "hidden sm:flex",
                isLast && "min-w-0 flex-1",
              )}
            >
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
              )}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="shrink-0 text-text-muted transition-colors hover:text-text-primary"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="truncate font-medium text-text-primary">{crumb.label}</span>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
