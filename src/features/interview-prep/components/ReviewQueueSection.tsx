import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChallengeDifficulty } from "@/lib/constants";
import type { ReviewQueueItem } from "@/features/interview-prep/lib/queries";

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  easy: "bg-success-muted text-success",
  medium: "bg-accent-muted text-accent-dark",
  hard: "bg-error-muted text-error",
};

// Conditional section — the caller only renders this when items.length > 0
// (honest empty state, same rule Practice Hub established pre-Feature-29).
// "Start review" links into /interview-prep/review, which 404s until
// Feature 32 ships the actual spaced-repetition session page.
export function ReviewQueueSection({ items }: { items: ReviewQueueItem[] }) {
  return (
    <section className="rounded-xl border border-accent/30 bg-accent-muted/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-accent" aria-hidden />
          <h2 className="text-sm font-semibold text-text-primary">Your Review Queue</h2>
        </div>
        <Link
          href="/interview-prep/review"
          className="flex items-center gap-1 text-xs font-semibold text-accent transition-colors hover:text-accent-dark"
        >
          Start review
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <ul className="mt-3 flex flex-col gap-1.5">
        {items.map((item) => {
          const badgeStyle =
            DIFFICULTY_STYLES[item.difficulty as ChallengeDifficulty] ??
            "bg-surface-secondary text-text-secondary";
          return (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2 text-sm text-text-primary"
            >
              <span className="min-w-0 flex-1 truncate">{item.question}</span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold capitalize",
                  badgeStyle,
                )}
              >
                {item.difficulty}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
