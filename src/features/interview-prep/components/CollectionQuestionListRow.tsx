import Link from "next/link";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChallengeDifficulty } from "@/lib/constants";
import type { InterviewPrepRouteCollection } from "@/features/interview-prep/lib/collectionRoutes";

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-accent-muted text-accent-dark",
  hard: "bg-error-muted text-error",
};

type Props = {
  routeCollection: InterviewPrepRouteCollection;
  index: number;
  slug: string;
  question: string;
  difficulty: ChallengeDifficulty;
  companies: string[];
  completed: boolean;
};

// Same row shape as Practice's ChallengeListRow (grid layout, zero-padded
// index, difficulty pill, company chips, completion checkbox) — deliberately
// consistent since both are "browse a list of standalone Q&A" pages.
export function CollectionQuestionListRow({
  routeCollection,
  index,
  slug,
  question,
  difficulty,
  companies,
  completed,
}: Props) {
  return (
    <Link
      href={`/interview-prep/${routeCollection}/${slug}`}
      className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-accent/40 hover:bg-surface-secondary/40"
    >
      <span className="text-xs font-medium tabular-nums text-text-muted">
        {String(index).padStart(2, "0")}
      </span>

      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-medium text-text-primary">{question}</span>

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
