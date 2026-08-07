import Link from "next/link";

import { Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Feature 38: the one shared "this is premium, here's how to unlock it" card,
// generalized from Build's original BuildPremiumLocked (the first surface
// this pattern ever shipped on). Reused across every locked surface in the
// app — Learn's Simulate/Challenge/Interview/Build tabs, Practice, UI
// Battles, FF Collections, FF System Design, Playbook, Company Guides —
// instead of one bespoke copy per surface.
//
// border-2 (not border): the first real premium-locked state any user ever
// saw (Build, pre-Feature-38) had its top edge reported invisible on a real
// display despite identical computed styles on every side and clean
// Playwright screenshots at every DPI tested — a 1px dashed line is thin
// enough to vanish under real sub-pixel/display-scaling rounding a headless
// browser doesn't reproduce. 2px removes the ambiguity for every future use
// of this card, not just Build's.
type PremiumLockedProps = {
  title: string;
  description: string;
  isLoggedIn: boolean;
  icon?: LucideIcon;
};

// CTA target: `/pricing` does not exist yet — it lands in a follow-up PR of
// Feature 38 (Stage 9). Until then this is a deliberate forward-link, the same
// pattern other sections used ahead of their own dependency landing.
const PRICING_PATH = "/pricing";

export function PremiumLocked({ title, description, isLoggedIn, icon: Icon = Lock }: PremiumLockedProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-premium/70 bg-premium-light/30 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-premium-light text-premium">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{description}</p>
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
