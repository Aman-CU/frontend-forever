import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChallengeDifficulty, ConceptCategory } from "@/lib/constants";

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-accent-muted text-accent-dark",
  hard: "bg-error-muted text-error",
};

type Props = {
  slug: string;
  title: string;
  difficulty: ChallengeDifficulty;
  category: ConceptCategory;
  conceptTitle: string;
  completed: boolean;
  companies: string[];
};

// Compact list row (replaces the earlier grid ChallengeCard) — matches the
// data density of BFE.dev's numbered list, mirroring QuestionCard's tag-row
// pattern from Interview Prep. See progress-tracker.md Post-Feature-28 entry.
export function ChallengeListRow({
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
      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-secondary/50"
    >
      {completed ? (
        <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-success" aria-hidden />
      ) : (
        <Circle className="h-4.5 w-4.5 shrink-0 text-border" aria-hidden />
      )}

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-text-primary">{title}</span>
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
