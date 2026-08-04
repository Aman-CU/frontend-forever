import Link from "next/link";
import { Check, Lock } from "lucide-react";

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
  completed: boolean;
  companies: string[];
  // Feature 38 — cosmetic here, same as every other list-row premium pill
  // (StudyPlanCard, BattleCard); the real gate lives on the detail page.
  isPremium: boolean;
};

// Each row is its own bordered card (the list container is a gap-2 stack,
// not a shared divide-y box) — matches the reference design the user
// supplied. Numbering is plain muted text (zero-padded, tabular-nums), not
// a circular badge; completion is a separate checkbox square on the far
// right, so ranking and solved-state no longer share one slot the way the
// earlier version did. See progress-tracker.md Post-Feature-28 entry.
// No concept-tag subtitle — Practice questions are standalone (not linked
// to a Learn concept), per the same entry's standalone-vs-concept-linked
// decision.
export function ChallengeListRow({
  index,
  slug,
  title,
  difficulty,
  category,
  completed,
  companies,
  isPremium,
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
      // items-center: every column centers against the (variable-height,
      // one-or-two-line) content column's full height, not just its top line.
      className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-accent/40 hover:bg-surface-secondary/40"
    >
      <span className="text-xs font-medium tabular-nums text-text-muted">
        {String(index).padStart(2, "0")}
      </span>

      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-medium text-text-primary">{title}</span>

        {isPremium && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-premium-light px-2 py-0.5 text-[0.6875rem] font-semibold text-premium">
            <Lock className="h-2.5 w-2.5" aria-hidden />
            Premium
          </span>
        )}

        {companies.length > 0 && (
          <span className="flex shrink-0 items-center gap-1.5">
            {companies.map((company) => (
              <span
                key={company}
                className="rounded-full bg-surface-secondary px-2 py-0.5 text-[0.6875rem] font-medium text-text-muted"
              >
                {company}
              </span>
            ))}
          </span>
        )}
      </span>

      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
          DIFFICULTY_STYLES[difficulty],
        )}
      >
        {difficulty}
      </span>

      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded",
          completed ? "bg-success" : "border-2 border-border",
        )}
      >
        {completed && (
          <Check className="h-3 w-3 text-success-foreground" strokeWidth={3} aria-hidden />
        )}
        <span className="sr-only">{completed ? "Completed" : "Not completed"}</span>
      </span>
    </Link>
  );
}
