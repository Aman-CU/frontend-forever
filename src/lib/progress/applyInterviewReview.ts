import type { InferInsertModel } from "drizzle-orm";
import { and, eq } from "drizzle-orm";

import type { db } from "@/lib/db";
import { userInterviewReviews, xpEvents, profiles } from "@/lib/schema";
import { INTERVIEW_ANSWERED_XP, STREAK_BONUS_XP } from "@/lib/constants";
import { applySm2Rating } from "@/features/interview-prep/spaced-repetition/sm2";
import { todayUtc, yesterdayUtc } from "@/lib/progress/applyProgressUpdate";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Shared write path for both of this app's interview-question rating UIs:
// Learn's Interview tab (Feature 25, binary "knew"/"review" -> quality 5/2)
// and Feature 32's dedicated review session (Easy/Okay/Hard/Forgot ->
// quality 5/4/3/1). Both need the same real SM-2 scheduling written to
// user_interview_reviews — before this, the Learn-tab route only stored
// quality/repetitions and never touched easeFactor/intervalDays/nextReviewAt,
// so the due-for-review queue (Feature 30's Get Started page) could never
// have anything in it.
//
// `awardXp` is false for the Learn-tab caller (that tab already has its own
// separate 20 XP tab-completion reward — see INTERVIEW_ANSWERED_XP's comment)
// and true for the review-session caller, which awards + bumps the daily
// streak on every rating, same "meaningful activity" bar as
// applyProgressUpdate/applyChallengeSubmission.
//
// Thrown by the awardXp path when the given question isn't an existing, due
// review row for this user — callers should map this to a 4xx, not a 500.
export class QuestionNotDueError extends Error {
  constructor() {
    super("Question is not due for review");
    this.name = "QuestionNotDueError";
  }
}

export async function applyInterviewReview(
  tx: Tx,
  userId: string,
  questionId: string,
  quality: number,
  awardXp: boolean,
): Promise<{ xpAwarded: number }> {
  let existing: typeof userInterviewReviews.$inferSelect | undefined;

  if (awardXp) {
    // Review-session path: require an already-existing, currently-due row —
    // never create one on the fly. Without this, a client could POST any
    // questionId (one never actually shown to them, possibly premium) and
    // replay the same rating indefinitely to farm XP, since nothing else
    // ties this route's reward to a review the user was genuinely due for.
    [existing] = await tx
      .select()
      .from(userInterviewReviews)
      .where(and(eq(userInterviewReviews.userId, userId), eq(userInterviewReviews.questionId, questionId)))
      .for("update");
    if (!existing || !existing.nextReviewAt || existing.nextReviewAt > new Date()) {
      throw new QuestionNotDueError();
    }
  } else {
    // Learn-tab path (unchanged): ensure the row exists before locking it —
    // same "insert is the synchronization point" idiom as
    // applyProgressUpdate, since a brand-new (user, question) pair has
    // nothing to lock yet.
    await tx
      .insert(userInterviewReviews)
      .values({ userId, questionId })
      .onConflictDoNothing({
        target: [userInterviewReviews.userId, userInterviewReviews.questionId],
      });

    [existing] = await tx
      .select()
      .from(userInterviewReviews)
      .where(and(eq(userInterviewReviews.userId, userId), eq(userInterviewReviews.questionId, questionId)))
      .for("update");
  }

  const sm2 = applySm2Rating(
    {
      easeFactor: existing?.easeFactor ?? 2.5,
      intervalDays: existing?.intervalDays ?? 1,
      repetitions: existing?.repetitions ?? 0,
    },
    quality,
  );

  await tx
    .update(userInterviewReviews)
    .set({
      easeFactor: sm2.easeFactor,
      intervalDays: sm2.intervalDays,
      repetitions: sm2.repetitions,
      quality,
      nextReviewAt: sm2.nextReviewAt,
      lastReviewedAt: new Date(),
    })
    .where(and(eq(userInterviewReviews.userId, userId), eq(userInterviewReviews.questionId, questionId)));

  if (!awardXp) {
    return { xpAwarded: 0 };
  }

  let xpToAward = INTERVIEW_ANSWERED_XP;
  const xpEventRows: InferInsertModel<typeof xpEvents>[] = [
    { userId, questionId, eventType: "interview_answered", xpAmount: INTERVIEW_ANSWERED_XP },
  ];

  // Lock the profile row so concurrent ratings can't race on the streak math
  // or clobber each other's XP increment (same pattern as
  // applyProgressUpdate/applyChallengeSubmission).
  const [profile] = await tx.select().from(profiles).where(eq(profiles.id, userId)).for("update");

  const today = todayUtc();
  let streakCurrent = profile?.streakCurrent ?? 0;
  let streakLongest = profile?.streakLongest ?? 0;
  const lastActivity = profile?.streakLastActivity ?? null;
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

  return { xpAwarded: xpToAward };
}
