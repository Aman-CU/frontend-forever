import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type Crumb = {
  label: string;
  // Omit href on the last (current-page) crumb.
  href?: string;
};

type Props = {
  // Where the circular back-arrow goes — the Hub for the Category List page,
  // the Category List for the Editor page (Feature 29).
  backHref: string;
  crumbs: Crumb[];
};

// No shared Breadcrumb primitive existed when this was Hub-only (single
// consumer, 2-level trail) — generalized here (Feature 29) once the Editor
// page needed a 3-level trail with a different back target, same "second
// consumer → generalize, don't duplicate" precedent as CodeEditor/the
// sandbox engine's promotion to components/shared/ and lib/.
export function PracticeBreadcrumb({ backHref, crumbs }: Props) {
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
          // A 3-level trail (Practice > Category > Title) doesn't fit next
          // to a long title on narrow viewports — same overflow lesson as
          // ChallengeListRow: hide the middle crumb (chevron included, same
          // span) below sm rather than letting the row silently overflow.
          // The back arrow already lands on the category page, so the
          // context isn't lost, just not spelled out in text on mobile.
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
