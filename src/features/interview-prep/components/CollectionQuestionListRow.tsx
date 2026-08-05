import Link from "next/link";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
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
  isPremium: boolean;
  // Drives PremiumBadge's icon only — the real gate lives on the detail page.
  isPremiumUser: boolean;
  completed: boolean;
  pending: boolean;
  onToggleComplete: (slug: string, completed: boolean) => void;
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
  isPremium,
  isPremiumUser,
  completed,
  pending,
  onToggleComplete,
}: Props) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-accent/40 hover:bg-surface-secondary/40">
      {/* display:contents — the row's grid children below stay direct grid
          items of the row above, while the link and the completion button
          remain DOM siblings, not nested interactive elements. */}
      <Link href={`/interview-prep/${routeCollection}/${slug}`} className="contents">
        <span className="text-xs font-medium tabular-nums text-text-muted">
          {String(index).padStart(2, "0")}
        </span>

        <span className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "truncate text-sm font-medium",
              completed ? "text-text-muted" : "text-text-primary",
            )}
          >
            {question}
          </span>

          {isPremium && <PremiumBadge isPremiumUser={isPremiumUser} size="xs" />}

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
      </Link>

      <button
        type="button"
        onClick={() => onToggleComplete(slug, !completed)}
        disabled={pending}
        aria-pressed={completed}
        aria-label={completed ? "Mark as not completed" : "Mark as completed"}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors disabled:opacity-60",
          completed ? "bg-success" : "border-2 border-border hover:border-accent",
        )}
      >
        {completed && (
          <Check className="h-3 w-3 text-success-foreground" strokeWidth={3} aria-hidden />
        )}
      </button>
    </div>
  );
}
