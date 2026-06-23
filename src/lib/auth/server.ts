import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { provisionProfile, getProfileProvisioningErrorCode } from "@/lib/auth/provisionProfile";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
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
