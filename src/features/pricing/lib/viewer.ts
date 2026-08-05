// Who is looking at the pricing page. Three states, because the CTA has three
// genuinely different jobs: send a stranger to sign up, sell to a logged-in
// free user, and get out of the way for someone who already paid.
export type PricingViewerState = "anonymous" | "free" | "premium";

export function resolveViewerState(
  isLoggedIn: boolean,
  isPremiumUser: boolean,
): PricingViewerState {
  if (!isLoggedIn) return "anonymous";
  return isPremiumUser ? "premium" : "free";
}

export const PRICING_PATH = "/pricing";

/** Log in, then come back here rather than dropping the user on /learn. */
export const PRICING_LOGIN_HREF = `/login?callbackURL=${encodeURIComponent(PRICING_PATH)}`;
