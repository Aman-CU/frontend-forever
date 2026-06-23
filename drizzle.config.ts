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
    // issue) — relax verification only outside production, same gate as
    // src/lib/db.ts, in case this ever runs with a production DATABASE_URL.
    url: process.env.DATABASE_URL!.replace(/[?&]sslmode=[^&]+/, ""),
    ssl: process.env.NODE_ENV === "production" ? true : { rejectUnauthorized: false },
  },
});
