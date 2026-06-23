import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic cookie-presence check only — see architecture.md → Authentication.
// Real verification happens per-route via auth.api.getSession().
export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/learn/:path*",
    "/practice/:path*",
    "/interview-prep/:path*",
    "/leaderboard",
    "/settings",
  ],
};
