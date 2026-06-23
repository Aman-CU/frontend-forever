import { db } from "@/lib/db";
import { profiles } from "@/lib/schema";

const USERNAME_RETRY_ATTEMPTS = 5;
const USERNAME_FALLBACK_BASE = "user";
const POSTGRES_UNIQUE_VIOLATION = "23505";
const PROFILES_USERNAME_CONSTRAINT = "profiles_username_unique";

type NewAuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function randomSuffix(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 6);
}

function isUsernameConflict(error: unknown): boolean {
  // Drizzle wraps the raw `pg` error (which carries `.code`/`.constraint`) in
  // a DrizzleQueryError — the fields we need are on `error.cause`, not on
  // the error Drizzle itself throws.
  const cause = error instanceof Error ? error.cause : undefined;
  return (
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    cause.code === POSTGRES_UNIQUE_VIOLATION &&
    "constraint" in cause &&
    cause.constraint === PROFILES_USERNAME_CONSTRAINT
  );
}

async function upsertProfile(user: NewAuthUser, username: string): Promise<void> {
  await db
    .insert(profiles)
    .values({
      id: user.id,
      username,
      fullName: user.name,
      email: user.email,
      avatarUrl: user.image ?? null,
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        fullName: user.name,
        email: user.email,
        avatarUrl: user.image ?? null,
        updatedAt: new Date(),
      },
    });
}

// Called from databaseHooks.user.create.after — the Better-Auth `user` row is
// already committed by the time this runs, so a thrown error here can't be
// rolled back. The caller (lib/auth/server.ts) catches and logs instead of
// letting this block sign-in.
export async function provisionProfile(user: NewAuthUser): Promise<void> {
  const baseUsername = slugify(user.name) || slugify(user.email.split("@")[0]) || USERNAME_FALLBACK_BASE;
  let username = baseUsername;

  for (let attempt = 0; attempt < USERNAME_RETRY_ATTEMPTS; attempt++) {
    try {
      await upsertProfile(user, username);
      return;
    } catch (error) {
      if (!isUsernameConflict(error)) throw error;
      username = `${baseUsername}-${randomSuffix()}`;
    }
  }

  // Exhausted retries against a collision-prone base slug — a fully random
  // suffix on a generic base makes the final attempt's own collision odds
  // negligible, guaranteeing this loop terminates.
  await upsertProfile(user, `${USERNAME_FALLBACK_BASE}-${randomSuffix()}${randomSuffix()}`);
}
