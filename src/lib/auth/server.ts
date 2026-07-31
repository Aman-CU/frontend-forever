import { cache } from "react";
import { headers } from "next/headers";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { redis } from "@/lib/upstash";
import { provisionProfile, getProfileProvisioningErrorCode } from "@/lib/auth/provisionProfile";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secondaryStorage: {
    get: (key) => redis.get<string>(key),
    set: async (key, value, ttl) => {
      if (ttl) {
        await redis.set(key, value, { ex: ttl });
      } else {
        await redis.set(key, value);
      }
    },
    delete: (key) => redis.del(key).then(() => undefined),
  },
  session: {
    storeSessionInDatabase: true,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes — get-session reads from signed cookie, no DB hit
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 5,
    storage: "secondary-storage",
    // /get-session is a read-only check of the caller's own already-issued
    // cookie, not a sensitive/brute-forceable action like sign-in — there's
    // nothing to guess, so hammering it gains an attacker nothing. But every
    // full page navigation fires one (the client session store remounts from
    // scratch each time), and the global 5-req/60s default is tuned for
    // sign-in abuse, not that. A short burst of normal navigation (e.g. one
    // page linking to another which links to a third) trips it, and — because
    // a fresh page's session store has no prior data to fall back on — the
    // Navbar renders logged-out for up to the rest of the window (confirmed:
    // `curl` 6x in a row returns 200,200,200,200,200,429). Real user-reported
    // bug, not test noise (this endpoint was already seen tripping the same
    // limit under rapid *headless test* page loads during Feature 25's
    // verification, dismissed then as harmless — it isn't, once a human
    // triggers it through completely ordinary browsing).
    customRules: {
      "/get-session": { window: 60, max: 100 },
    },
  },
  socialProviders: {
    google: {
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
    },
    github: {
      clientId: env.githubClientId,
      clientSecret: env.githubClientSecret,
    },
  },
  // Real emails commonly differ between a user's Google and GitHub accounts —
  // without this, linking a second provider from Settings > Account fails
  // with LINKING_DIFFERENT_EMAILS_NOT_ALLOWED for most real users. Safe here
  // specifically because linking is always explicit and initiated by an
  // already-authenticated user (not an implicit merge during sign-in).
  account: {
    accountLinking: {
      allowDifferentEmails: true,
    },
  },
  // Disabled by default. Feature 57 (Settings > Account) needs this for
  // real account deletion. No password exists on any account (OAuth-only)
  // and no email-sending infra exists in this project (same constraint that
  // made Feedback a plain mailto: link, not a form) — so deletion relies on
  // Better Auth's built-in session-freshness check instead of a verification
  // email. See AccountSection.tsx for how a stale/non-fresh session is
  // handled.
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  advanced: {
    database: {
      // Keep ids uuid, consistent with every other table's PK (see architecture.md).
      generateId: () => crypto.randomUUID(),
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // The `user` row is already committed — never let a profile-write
          // failure surface as a sign-in failure (see provisionProfile.ts).
          try {
            await provisionProfile(user);
          } catch (error) {
            // Never log `error` itself — Drizzle's DrizzleQueryError embeds
            // the full insert payload (name, email, avatar URL) in its
            // message. Only the Postgres error code (if any) is safe.
            console.error("[auth] Failed to provision profile:", user.id, getProfileProvisioningErrorCode(error));
          }
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;

// Deduplicates the session lookup across RSC layout + page trees on the same
// request — both learn/layout.tsx and learn/page.tsx call this; only one
// auth.api.getSession() fires per request.
export const getCachedSession = cache(async () => {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch {
    return null;
  }
});
