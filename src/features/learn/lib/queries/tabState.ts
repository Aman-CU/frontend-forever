import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { profiles, userConceptProgress } from "@/lib/schema";

// Whether the given user has marked a concept's Understand tab complete. Per-user
// and small/indexed, so it stays a live query (not cached).
export async function getUnderstoodState(
  userId: string,
  conceptId: string,
): Promise<boolean> {
  const row = await db.query.userConceptProgress.findFirst({
    columns: { understandCompleted: true },
    where: and(
      eq(userConceptProgress.userId, userId),
      eq(userConceptProgress.conceptId, conceptId),
    ),
  });
  return row?.understandCompleted ?? false;
}

// Whether the given user has marked a concept's Simulate tab complete (set the
// first time they play a simulator through to its final frame). Per-user and
// indexed, so it stays a live query (not cached), same as getUnderstoodState.
export async function getSimulateState(
  userId: string,
  conceptId: string,
): Promise<boolean> {
  const row = await db.query.userConceptProgress.findFirst({
    columns: { simulateCompleted: true },
    where: and(
      eq(userConceptProgress.userId, userId),
      eq(userConceptProgress.conceptId, conceptId),
    ),
  });
  return row?.simulateCompleted ?? false;
}

// Whether the given user has completed a concept's Challenge tab. Per-user and
// indexed, so it stays a live query (not cached), same as getSimulateState.
export async function getChallengeState(
  userId: string,
  conceptId: string,
): Promise<boolean> {
  const row = await db.query.userConceptProgress.findFirst({
    columns: { challengeCompleted: true },
    where: and(
      eq(userConceptProgress.userId, userId),
      eq(userConceptProgress.conceptId, conceptId),
    ),
  });
  return row?.challengeCompleted ?? false;
}

// Whether the given user has completed a concept's Interview tab (set once they
// rate every question). Per-user and indexed, so it stays a live query, same as
// getChallengeState.
export async function getInterviewState(
  userId: string,
  conceptId: string,
): Promise<boolean> {
  const row = await db.query.userConceptProgress.findFirst({
    columns: { interviewCompleted: true },
    where: and(
      eq(userConceptProgress.userId, userId),
      eq(userConceptProgress.conceptId, conceptId),
    ),
  });
  return row?.interviewCompleted ?? false;
}

// Whether the given user has completed a concept's Build tab. Per-user and
// indexed, so it stays a live query (not cached), same as getInterviewState.
export async function getBuildState(userId: string, conceptId: string): Promise<boolean> {
  const row = await db.query.userConceptProgress.findFirst({
    columns: { buildCompleted: true },
    where: and(
      eq(userConceptProgress.userId, userId),
      eq(userConceptProgress.conceptId, conceptId),
    ),
  });
  return row?.buildCompleted ?? false;
}

// Whether the user currently has active premium — for server-side gating of
// premium challenges (the seam Feature 38 fills out). Live, per-user.
export async function getIsPremiumUser(userId: string): Promise<boolean> {
  const row = await db.query.profiles.findFirst({
    columns: { isPremium: true, premiumExpiresAt: true },
    where: eq(profiles.id, userId),
  });
  if (!row?.isPremium) return false;
  return !row.premiumExpiresAt || row.premiumExpiresAt > new Date();
}
