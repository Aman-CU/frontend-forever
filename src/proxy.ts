import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic cookie-presence check only — see architecture.md → Authentication.
// Real verification happens per-route via auth.api.getSession().
//
// /learn, /practice, and /interview-prep are publicly browsable — login only
// gates personalization within them (progress tracking, Practice discussion,
// Review Queue), enforced per-route, not here. Only routes that are useless
// without an account belong in this matcher.
export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    // Preserve the originally-requested path so /login (getSafeRedirectPath)
    // can send the user back here after signing in, same as every per-route
    // defensive redirect (e.g. /settings/[section], /dashboard, /leaderboard)
    // already does — without this, this matcher's routes were the one path
    // that dropped the user onto /login's default (/learn) instead.
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "callbackURL",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/leaderboard", "/settings/:path*", "/profile/:path*", "/dashboard"],
};
