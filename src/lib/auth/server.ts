import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";

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
        // Stubbed per build-plan.md Feature 16 — `profiles` doesn't exist until
        // Feature 18, so there's nothing to upsert into yet. Feature 16 implements
        // the real upsert here once that table is migrated.
        after: async () => {},
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
