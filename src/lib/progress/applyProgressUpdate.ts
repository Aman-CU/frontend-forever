import type { InferInsertModel } from "drizzle-orm";
import { and, eq } from "drizzle-orm";

import type { db } from "@/lib/db";
import { userConceptProgress, xpEvents, profiles } from "@/lib/schema";
import {
  type ConceptTab,
  TAB_XP_REWARDS,
  TAB_XP_EVENT_TYPE,
  CONCEPT_COMPLETED_BONUS_XP,
  STREAK_BONUS_XP,
} from "@/lib/constants";

type ProgressInsert = InferInsertModel<typeof userConceptProgress>;
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Per-tab completion flag. Award-eligibility (XP, streak) is computed below —
// this map only says which column a tab writes to.
const COMPLETED_SET: Record<ConceptTab, Partial<ProgressInsert>> = {
  understand: { understandCompleted: true },
  simulate: { simulateCompleted: true },
  challenge: { challengeCompleted: true },
  interview: { interviewCompleted: true },
  build: { buildCompleted: true },
};

const TAB_FLAG_KEY: Record<ConceptTab, keyof ProgressInsert> = {
  understand: "understandCompleted",
  simulate: "simulateCompleted",
  challenge: "challengeCompleted",
  interview: "interviewCompleted",
  build: "buildCompleted",
};

// UTC calendar day — there is no per-user timezone system in the app today,
// so "today"/"yesterday" for streak purposes is the server's UTC date.
function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayUtc(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Writes a tab's completion flag, awards XP (tab completion, the +50
// first-time-fully-completed bonus, and the once-per-UTC-day streak bonus),
// and updates the streak — all inside the caller's transaction, so a failure
// partway through never leaves progress and XP out of sync.
export async function applyProgressUpdate(tx: Tx, userId: string, conceptId: string, tab: ConceptTab) {
  const flagKey = TAB_FLAG_KEY[tab];
  const flagUpdate = COMPLETED_SET[tab];

  // Ensure the row exists before locking it. `SELECT ... FOR UPDATE` only
  // locks rows that already exist — on a user's very first-ever action on
  // this concept there's nothing to lock, so two truly concurrent first
  // completions could both read "no row" and both award XP. This insert is
  // itself the synchronization point: Postgres serializes concurrent inserts
  // that target the same unique (userId, conceptId) key, so by the time the
  // SELECT below runs, the row is guaranteed to exist.
  await tx
    .insert(userConceptProgress)
    .values({ userId, conceptId })
    .onConflictDoNothing({
      target: [userConceptProgress.userId, userConceptProgress.conceptId],
    });

  // Lock this user's progress row for the duration of the transaction so two
  // concurrent completions of the same tab can't both observe "not yet
  // completed" and double-award XP.
  const [existingProgress] = await tx
    .select()
    .from(userConceptProgress)
    .where(and(eq(userConceptProgress.userId, userId), eq(userConceptProgress.conceptId, conceptId)))
    .for("update");

  const wasTabCompleted = existingProgress?.[flagKey] === true;
  const wasFullyCompleted = existingProgress?.fullyCompleted === true;

  const mergedFlags = {
    understandCompleted: existingProgress?.understandCompleted ?? false,
    simulateCompleted: existingProgress?.simulateCompleted ?? false,
    challengeCompleted: existingProgress?.challengeCompleted ?? false,
    interviewCompleted: existingProgress?.interviewCompleted ?? false,
    buildCompleted: existingProgress?.buildCompleted ?? false,
    ...flagUpdate,
  };
  const isFullyCompletedNow = Object.values(mergedFlags).every(Boolean);
  const bonusNewlyEarned = isFullyCompletedNow && !wasFullyCompleted;

  await tx
    .insert(userConceptProgress)
    .values({
      userId,
      conceptId,
      ...flagUpdate,
      ...(bonusNewlyEarned ? { fullyCompleted: true, completedAt: new Date() } : {}),
    })
    .onConflictDoUpdate({
      target: [userConceptProgress.userId, userConceptProgress.conceptId],
      set: {
        ...flagUpdate,
        ...(bonusNewlyEarned ? { fullyCompleted: true, completedAt: new Date() } : {}),
        updatedAt: new Date(),
      },
    });

  let xpToAward = 0;
  const xpEventRows: InferInsertModel<typeof xpEvents>[] = [];

  if (!wasTabCompleted) {
    const tabXp = TAB_XP_REWARDS[tab];
    xpToAward += tabXp;
    xpEventRows.push({
      userId,
      conceptId,
      eventType: TAB_XP_EVENT_TYPE[tab],
      xpAmount: tabXp,
    });
  }

  if (bonusNewlyEarned) {
    xpToAward += CONCEPT_COMPLETED_BONUS_XP;
    xpEventRows.push({
      userId,
      conceptId,
      eventType: "concept_completed",
      xpAmount: CONCEPT_COMPLETED_BONUS_XP,
    });
  }

  // Lock the profile row so concurrent requests can't race on the streak
  // math or clobber each other's XP increment.
  const [profile] = await tx.select().from(profiles).where(eq(profiles.id, userId)).for("update");

  const today = todayUtc();
  let streakCurrent = profile?.streakCurrent ?? 0;
  let streakLongest = profile?.streakLongest ?? 0;
  const lastActivity = profile?.streakLastActivity ?? null;

  if (lastActivity !== today) {
    streakCurrent = lastActivity === yesterdayUtc() ? streakCurrent + 1 : 1;
    streakLongest = Math.max(streakLongest, streakCurrent);
    xpToAward += STREAK_BONUS_XP;
    xpEventRows.push({
      userId,
      eventType: "streak_bonus",
      xpAmount: STREAK_BONUS_XP,
    });
  }

  if (xpEventRows.length > 0) {
    await tx.insert(xpEvents).values(xpEventRows);
  }

  await tx
    .update(profiles)
    .set({
      xp: (profile?.xp ?? 0) + xpToAward,
      streakCurrent,
      streakLongest,
      streakLastActivity: today,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId));
}
