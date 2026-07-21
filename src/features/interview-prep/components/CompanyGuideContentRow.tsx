import Link from "next/link";

import { cn } from "@/lib/utils";
import type { ChallengeDifficulty } from "@/lib/constants";

// Same difficulty color map as CollectionQuestionListRow — a small,
// file-local constant is this codebase's own precedent for style maps this
// size (QuestionCard/ChallengePrompt do the same) rather than a shared import
// across features, which the feature-first invariant forbids anyway.
const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-accent-muted text-accent-dark",
  hard: "bg-error-muted text-error",
};

type Props = {
  href: string;
  badgeLabel: string;
  title: string;
  difficulty: ChallengeDifficulty;
};

// One row inside a Company Guide's "Interview Questions" or "Practice
// Challenges" section — a lighter version of CollectionQuestionListRow
// (no index, no company chips since the whole section is already scoped to
// one company, no completion checkbox since this is an aggregation view, not
// its own tracked list).
export function CompanyGuideContentRow({ href, badgeLabel, title, difficulty }: Props) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-accent/40 hover:bg-surface-secondary/40"
    >
      <span className="shrink-0 rounded-full bg-surface-secondary px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-text-muted">
        {badgeLabel}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">{title}</span>
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
          DIFFICULTY_STYLES[difficulty],
        )}
      >
        {difficulty}
      </span>
    </Link>
  );
}
