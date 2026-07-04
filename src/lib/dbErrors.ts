// Safe to log — a Postgres error code (e.g. "23505") never contains the
// failing row's data, unlike a thrown DrizzleQueryError's `message`/`cause`,
// which embeds the full insert payload (see lib/auth/provisionProfile.ts,
// where this exact leak was first caught: full insert payload — name, email,
// avatar URL — surfacing in a log line via `error.message`).
export function getPostgresErrorCode(error: unknown): string | undefined {
  const cause = error instanceof Error ? error.cause : undefined;
  const code =
    typeof cause === "object" && cause !== null ? (cause as { code?: unknown }).code : undefined;
  return typeof code === "string" ? code : undefined;
}
