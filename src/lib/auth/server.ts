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
