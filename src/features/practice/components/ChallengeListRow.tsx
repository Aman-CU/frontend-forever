import Link from "next/link";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChallengeDifficulty, ConceptCategory } from "@/lib/constants";

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-accent-muted text-accent-dark",
  hard: "bg-error-muted text-error",
};

type Props = {
  index: number;
  slug: string;
  title: string;
  difficulty: ChallengeDifficulty;
  category: ConceptCategory;
  conceptTitle: string;
  completed: boolean;
  companies: string[];
};

// Compact, single-line-where-possible list row (replaces the earlier
// two-line version — user wanted tighter density and numbering, matching
// BFE.dev's numbered-list convention). The numbered badge (same shape as
// QuestionCard's index circle from Interview Prep) swaps to a green check
// once solved, so ranking and completion share one slot instead of
// competing for space. See progress-tracker.md Post-Feature-28 entry.
export function ChallengeListRow({
  index,
  slug,
  title,
  difficulty,
  category,
  conceptTitle,
  completed,
  companies,
}: Props) {
  return (
    <Link
      href={`/practice/${category}/${slug}`}
      // grid, not flex: a flex item's default min-width is its content's
      // natural width, not 0, so a plain flex row silently refuses to shrink
      // a long title below that width (truncate never engages, and the row
      // overflows its container on narrow viewports). grid-cols with an
      // explicit minmax(0,1fr) column is the standard fix — it forces the
      // title column's minimum to 0 so it actually truncates.
      className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-secondary/50"
    >
      <span
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          completed ? "bg-success text-white" : "bg-surface-secondary text-text-secondary",
        )}
      >
        {completed ? <Check className="h-3.5 w-3.5" aria-hidden /> : index}
      </span>

      <span className="min-w-0">
        {/* Title always shares its line with the difficulty badge — title
            truncates instead of ever letting the badge get pushed off-screen. */}
        <span className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <span className="truncate text-sm font-medium text-text-primary">{title}</span>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
              DIFFICULTY_STYLES[difficulty],
            )}
          >
            {difficulty}
          </span>
        </span>

        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-text-muted">{conceptTitle}</span>
          {companies.map((company) => (
            <span
              key={company}
              className="rounded-full bg-surface-secondary px-2 py-0.5 text-[0.6875rem] font-medium text-text-muted"
            >
              {company}
            </span>
          ))}
        </span>
      </span>
    </Link>
  );
}
