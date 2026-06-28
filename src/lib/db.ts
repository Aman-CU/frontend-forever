import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/lib/schema";
import { env } from "@/lib/env";

const pool = new Pool({
  connectionString: env.databaseUrl,
  // Some local networks present a self-signed cert in the chain to Supabase's
  // pooler (TLS interception, not a Supabase issue) — only relax verification
  // outside production, where this doesn't occur.
  ssl: process.env.NODE_ENV === "production" ? true : { rejectUnauthorized: false },
  // TCP keepalive prevents the TLS-intercepting proxy from silently dropping
  // idle connections, which would force a costly re-handshake on the next query.
  keepAlive: true,
  // pg's default idleTimeoutMillis is 10s — far too short for this dev
  // environment where re-handshaking through the TLS proxy costs 7+ seconds.
  // 60s covers the typical page-load → interact → sign-out flow.
  idleTimeoutMillis: 60_000,
  // Fail fast on a dead/stalled connection instead of hanging until the platform
  // request timeout (a stuck pooler handshake otherwise blocked a request for 80s+).
  // Dev allows a long window for the slow TLS-proxy cold handshake (7-25s, see the
  // env note); production connects directly to the pooler and should give up quickly.
  connectionTimeoutMillis: process.env.NODE_ENV === "production" ? 8_000 : 30_000,
  // Client-side cap on a single query (no server/pooler SET, so transaction-mode
  // pooling can't reject it) — bounds a runaway or hung query in production.
  query_timeout: process.env.NODE_ENV === "production" ? 10_000 : 30_000,
});

export const db = drizzle(pool, { schema });
