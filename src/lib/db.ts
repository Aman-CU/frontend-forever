import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/lib/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Some local networks present a self-signed cert in the chain to Supabase's
  // pooler (TLS interception, not a Supabase issue) — only relax verification
  // outside production, where this doesn't occur.
  ssl: process.env.NODE_ENV === "production" ? true : { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
