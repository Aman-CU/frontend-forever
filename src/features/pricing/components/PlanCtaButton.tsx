"use client";

import { useId, useState } from "react";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { PRICING_LOGIN_HREF, type PricingViewerState } from "@/features/pricing/lib/viewer";

type Props = {
  /** Plan name only — the verb depends on who's looking. */
  planName: string;
  viewerState: PricingViewerState;
  /** Filled treatment for the plans we're steering people toward. */
  emphasis?: boolean;
  className?: string;
};

const BASE =
  "flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

// The one place a plan turns into an action.
//
// Checkout itself is Feature 39 (Stripe Integration) — a separate feature in
// build-plan.md, not part of Feature 38. Rather than wire this to a route
// that would 404, or fake a payment flow, the logged-in-free path states
// plainly that payments aren't live yet. `startCheckout` below is the single
// seam Feature 39 replaces; nothing else on this page needs to change.
export function PlanCtaButton({ planName, viewerState, emphasis, className }: Props) {
  const [checkoutRequested, setCheckoutRequested] = useState(false);
  // Four of these render on one page — the note's id has to be unique per
  // instance or aria-describedby points every button at the first note.
  const noteId = useId();

  // An existing subscriber is not done with this page. Someone on Monthly has
  // a real reason to move to Annual or Lifetime, and an earlier version of
  // this component locked all four cards behind an inert "you already have
  // full access" state, which left them no way to do it. They get working
  // CTAs, just phrased as a change of plan rather than a first purchase.
  //
  // Note what is deliberately NOT claimed: which plan they are currently on.
  // Nothing in the schema records it — `profiles` has `isPremium` and
  // `premiumExpiresAt` and nothing else — so no card is marked "your current
  // plan" and no card is disabled. Feature 39 (Stripe) is what will know the
  // subscription's real plan; that's when this can get smarter.
  const isExistingSubscriber = viewerState === "premium";
  const label = isExistingSubscriber ? `Switch to ${planName}` : `Get ${planName}`;

  if (viewerState === "anonymous") {
    return (
      <Link
        href={PRICING_LOGIN_HREF}
        className={cn(
          BASE,
          emphasis
            ? "bg-premium text-premium-foreground hover:bg-premium/90"
            : "border border-border bg-surface text-text-primary hover:border-premium hover:text-premium",
          className,
        )}
      >
        {label}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    );
  }

  // Logged in — either upgrading for the first time or changing plan. Both
  // land in the same place: the checkout Feature 39 will build.
  return (
    <div className={cn("w-full", className)}>
      <button
        type="button"
        onClick={() => setCheckoutRequested(true)}
        aria-describedby={checkoutRequested ? noteId : undefined}
        className={cn(
          BASE,
          emphasis
            ? "bg-premium text-premium-foreground hover:bg-premium/90"
            : "border border-border bg-surface text-text-primary hover:border-premium hover:text-premium",
        )}
      >
        {label}
        <ArrowRight className="size-4" aria-hidden />
      </button>
      {checkoutRequested && (
        <p
          id={noteId}
          role="status"
          className="mt-2.5 text-center text-xs leading-relaxed text-text-secondary"
        >
          {isExistingSubscriber
            ? "Changing plan isn't switched on just yet — your current access carries on unaffected in the meantime."
            : "Card payments aren't switched on just yet — you'll be able to complete checkout right here shortly."}
        </p>
      )}
    </div>
  );
}
