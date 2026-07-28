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
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/leaderboard", "/settings/:path*", "/profile/:path*", "/dashboard"],
};
