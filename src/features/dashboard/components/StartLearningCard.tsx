import Link from "next/link";
import { Compass } from "lucide-react";

// Shown only when hasAnyLearningProgress is false (see
// features/dashboard/lib/queries.ts) — an honest empty state that simply
// disappears once the user has real activity, rather than a fake
// "continue where you left off" for a specific concept.
export function StartLearningCard() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-muted">
        <Compass className="size-5 text-accent" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-text-primary">Start your first course</p>
        <p className="mt-0.5 text-xs text-text-secondary">
          Pick a topic and your progress, streaks, and stats will all show up here.
        </p>
      </div>
      <Link
        href="/learn"
        className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-dark"
      >
        Browse courses
      </Link>
    </div>
  );
}
