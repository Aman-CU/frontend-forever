import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

import { PRACTICE_CATEGORY_LABELS } from "@/features/practice/lib/practiceCategories";
import type { MockChallenge } from "@/features/practice/lib/mockPracticeData";

type Props = {
  challenge: MockChallenge;
};

// "Continue where you left off" — shown only when the user has an
// in-progress (attempted, not-yet-passed) challenge. Real version reads the
// most recent non-passing user_challenge_submissions row.
export function ContinueChallengeCard({ challenge }: Props) {
  const categoryLabel = PRACTICE_CATEGORY_LABELS[challenge.category];

  return (
    <Link
      href={`/practice/${challenge.category}/${challenge.slug}`}
      className="group mb-8 flex items-center gap-4 rounded-xl border border-border bg-surface-secondary/40 p-4 transition-colors hover:border-accent"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-muted text-accent">
        <Play className="h-4 w-4" aria-hidden fill="currentColor" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-text-muted">Continue where you left off</p>
        <p className="truncate text-sm font-semibold text-text-primary">
          {challenge.title}
          <span className="ml-2 font-normal text-text-muted">· {categoryLabel}</span>
        </p>
      </div>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
        aria-hidden
      />
    </Link>
  );
}
