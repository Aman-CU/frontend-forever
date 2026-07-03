import Link from "next/link";

import { Hammer, Lock } from "lucide-react";

// Shown when a concept has no linked project brief yet (parallels the Challenge
// and Interview tabs' own "coming soon" empty states).
export function BuildEmptyState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/40 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary text-text-muted">
        <Hammer className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-text-primary">Build project coming soon</h2>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">
        This concept doesn&apos;t have a build project yet. Try the Understand and Challenge tabs
        in the meantime.
      </p>
    </div>
  );
}

// Server-side gated (page.tsx computes isPremiumLocked from isPremium + the
// viewer's premium status, per security.md) — most Build projects are premium
// by design (project-overview.md), with one free flagship per category.
//
// border-2 (not border): this is the first *actually reachable* premium-locked
// state in the app (Challenge/Interview's equivalents exist in code but no real
// challenge/question is premium yet, so their border was only ever verified via
// a temporary DB flip, never seen by a real user). A real user reported the top
// edge invisible on their display even though computed styles are byte-identical
// on all 4 sides and Playwright screenshots show it fine at every DPI tested —
// a 1px dashed line is thin enough to vanish under real sub-pixel/display-scaling
// rounding that a headless browser doesn't reproduce. 2px removes the ambiguity
// instead of re-trusting a value (border/70) already once bumped for the same
// class of "thin dashed line disappears" bug and apparently still not enough.
type BuildPremiumLockedProps = {
  isLoggedIn: boolean;
};

// CTA target: `/pricing` doesn't exist yet (Stripe/pricing is Phase 9) — same
// deliberate forward-link pattern already used by `MoreInterviewPrepCta` for
// `/interview-prep` ahead of Phase 6. 404s today, lights up once Feature 38/39
// ship, no code here needs to change when it does.
const PRICING_PATH = "/pricing";

export function BuildPremiumLocked({ isLoggedIn }: BuildPremiumLockedProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-premium/70 bg-premium-light/30 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-premium-light text-premium">
        <Lock className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-text-primary">Premium build project</h2>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">
        Upgrade to Premium to unlock this build project.
      </p>
      {/* Logged-in non-premium users go straight to pricing. Logged-out users
          go through login first — the callbackURL carries them on to pricing
          afterward instead of dropping them at the default /learn. */}
      <Link
        href={isLoggedIn ? PRICING_PATH : `/login?callbackURL=${encodeURIComponent(PRICING_PATH)}`}
        className="mt-5 inline-flex items-center rounded-lg bg-premium px-6 py-3 text-sm font-semibold text-premium-foreground transition-colors hover:bg-premium/90"
      >
        {isLoggedIn ? "Upgrade to Premium" : "Log in to upgrade"}
      </Link>
    </div>
  );
}
