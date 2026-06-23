import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

// sslmode is stripped from the URL since it otherwise overrides the `ssl`
// option below. This machine's network presents a self-signed cert in the
// chain to Supabase's pooler (local TLS interception, not a Supabase issue)
// — relax verification only outside production, same gate as src/lib/db.ts,
// in case this ever runs with a production DATABASE_URL.
// Use the URL API, not a regex — DATABASE_URL has other params after
// sslmode (e.g. `?sslmode=require&uselibpqcompat=true`), and a regex that
// only strips up to the next `&` leaves a dangling `&param=value` with no
// leading `?`, corrupting the connection string (silently breaks the db
// name, which `drizzle-kit migrate` then fails on with no useful error).
const databaseUrl = new URL(process.env.DATABASE_URL!);
databaseUrl.searchParams.delete("sslmode");

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl.toString(),
    ssl: process.env.NODE_ENV === "production" ? true : { rejectUnauthorized: false },
  },
});
