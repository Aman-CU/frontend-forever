import { Map } from "lucide-react";

// Same dashed-border empty-state language as ChallengeEmptyState
// (features/practice/components/ChallengeStates.tsx) — the roadmap's real
// node content stays seeded in the DB, just not rendered here yet.
export function RoadmapComingSoonState() {
  return (
    <div className="mx-auto flex min-h-[320px] max-w-2xl flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/40 px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary text-text-muted">
        <Map className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-text-primary">Roadmap coming soon</h2>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">
        We&apos;re still polishing this roadmap. In the meantime, check out the Frontend Forever
        Roadmap — it&apos;s live now.
      </p>
    </div>
  );
}
