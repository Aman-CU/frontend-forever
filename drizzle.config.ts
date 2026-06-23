import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    // sslmode is stripped from the URL since it otherwise overrides the `ssl`
    // option below. This machine's network presents a self-signed cert in
    // the chain to Supabase's pooler (local TLS interception, not a Supabase
    // issue) — CLI tooling is dev-only, so relax verification here. The app's
    // own src/lib/db.ts only does this outside production.
    url: process.env.DATABASE_URL!.replace(/[?&]sslmode=[^&]+/, ""),
    ssl: { rejectUnauthorized: false },
  },
});
