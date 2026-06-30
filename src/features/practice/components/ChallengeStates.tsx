import { Lock, Trophy } from "lucide-react";

// Shown when a concept has no linked challenge yet (parallels the Simulate tab's
// "coming soon" empty state).
export function ChallengeEmptyState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/40 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary text-text-muted">
        <Trophy className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-text-primary">Challenge coming soon</h2>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">
        This concept doesn&apos;t have a coding challenge yet. Try the Understand and Simulate tabs
        in the meantime.
      </p>
    </div>
  );
}

// Premium gate seam — Feature 38 wires up the upgrade CTA. No challenge is
// premium today, so this branch is currently unreachable.
export function ChallengePremiumLocked() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-premium/40 bg-premium-light/30 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-premium-light text-premium">
        <Lock className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-text-primary">Premium challenge</h2>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">
        Upgrade to Premium to unlock this coding challenge.
      </p>
    </div>
  );
}
