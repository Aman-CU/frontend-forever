import type { InferInsertModel } from "drizzle-orm";
import { and, eq } from "drizzle-orm";

import type { db } from "@/lib/db";
import { userChallengeSubmissions, xpEvents, profiles } from "@/lib/schema";
import { CHALLENGE_SOLVED_XP, STREAK_BONUS_XP, type ChallengeStatus } from "@/lib/constants";
import { todayUtc, yesterdayUtc } from "@/lib/progress/applyProgressUpdate";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Feature 29 — Practice's Editor page. Writes one submission row per Run
// Tests attempt (pass or fail, per the schema's "multiple submissions
// expected" note), and awards XP + a streak day only on a user's first-ever
// PASSING submission for this challenge. A failed attempt, or re-passing a
// challenge already solved, is logged but never re-awards anything.
export async function applyChallengeSubmission(
  tx: Tx,
  userId: string,
  challengeId: string,
  status: ChallengeStatus,
  code: string,
): Promise<{ firstPass: boolean; xpAwarded: number }> {
  if (status !== "passed") {
    await tx.insert(userChallengeSubmissions).values({ userId, challengeId, status, code });
    return { firstPass: false, xpAwarded: 0 };
  }

  // Lock the profile row before checking "already passed" — serializes
  // concurrent passing submissions from the same user so two in-flight
  // requests can't both observe "not yet solved" and double-award XP (same
  // trick applyProgressUpdate uses, just anchored on the profile row since
  // user_challenge_submissions has no unique key to lock instead).
  const [profile] = await tx.select().from(profiles).where(eq(profiles.id, userId)).for("update");

  const [existingPass] = await tx
    .select({ id: userChallengeSubmissions.id })
    .from(userChallengeSubmissions)
    .where(
      and(
        eq(userChallengeSubmissions.userId, userId),
        eq(userChallengeSubmissions.challengeId, challengeId),
        eq(userChallengeSubmissions.status, "passed"),
      ),
    )
    .limit(1);
  const firstPass = !existingPass;

  await tx.insert(userChallengeSubmissions).values({ userId, challengeId, status, code });

  if (!firstPass) {
    return { firstPass: false, xpAwarded: 0 };
  }

  let xpToAward = CHALLENGE_SOLVED_XP;
  const xpEventRows: InferInsertModel<typeof xpEvents>[] = [
    { userId, challengeId, eventType: "challenge_solved", xpAmount: CHALLENGE_SOLVED_XP },
  ];

  const today = todayUtc();
  let streakCurrent = profile?.streakCurrent ?? 0;
  let streakLongest = profile?.streakLongest ?? 0;
  const lastActivity = profile?.streakLastActivity ?? null;
  // Streak only advances on a genuine first-time solve, not on every Run
  // Tests click — matches applyProgressUpdate's "meaningful activity" bar.
  const streakAdvances = lastActivity !== today;

  if (streakAdvances) {
    streakCurrent = lastActivity === yesterdayUtc() ? streakCurrent + 1 : 1;
    streakLongest = Math.max(streakLongest, streakCurrent);
    xpToAward += STREAK_BONUS_XP;
    xpEventRows.push({ userId, eventType: "streak_bonus", xpAmount: STREAK_BONUS_XP });
  }

  await tx.insert(xpEvents).values(xpEventRows);

  await tx
    .update(profiles)
    .set({
      xp: (profile?.xp ?? 0) + xpToAward,
      streakCurrent,
      streakLongest,
      streakLastActivity: streakAdvances ? today : profile?.streakLastActivity,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId));

  return { firstPass: true, xpAwarded: xpToAward };
}
