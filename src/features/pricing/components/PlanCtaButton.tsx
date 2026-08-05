"use client";

import { useId, useState } from "react";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { PRICING_LOGIN_HREF, type PricingViewerState } from "@/features/pricing/lib/viewer";

type Props = {
  label: string;
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
export function PlanCtaButton({ label, viewerState, emphasis, className }: Props) {
  const [checkoutRequested, setCheckoutRequested] = useState(false);
  // Four of these render on one page — the note's id has to be unique per
  // instance or aria-describedby points every button at the first note.
  const noteId = useId();

  if (viewerState === "premium") {
    return (
      <div
        className={cn(
          BASE,
          "cursor-default border border-success/30 bg-success-light text-success",
          className,
        )}
      >
        <Check className="size-4" aria-hidden />
        You already have full access
      </div>
    );
  }

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

  // Logged in, not premium — the only path that needs real checkout.
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
          Card payments aren&apos;t switched on just yet — you&apos;ll be able to complete
          checkout right here shortly.
        </p>
      )}
    </div>
  );
}
