import { cache } from "react";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { profiles, userConceptProgress } from "@/lib/schema";

// The 5 per-tab completion flags for one (userId, conceptId) pair, in a
// single query — page.tsx's Promise.all calls all 5 getters below with the
// same arguments, so cache() dedupes them into one DB round trip per request
// instead of 5.
const getTabProgressRow = cache(async (userId: string, conceptId: string) => {
  return db.query.userConceptProgress.findFirst({
    columns: {
      understandCompleted: true,
      simulateCompleted: true,
      challengeCompleted: true,
      interviewCompleted: true,
      buildCompleted: true,
    },
    where: and(
      eq(userConceptProgress.userId, userId),
      eq(userConceptProgress.conceptId, conceptId),
    ),
  });
});

// Whether the given user has marked a concept's Understand tab complete.
export async function getUnderstoodState(
  userId: string,
  conceptId: string,
): Promise<boolean> {
  const row = await getTabProgressRow(userId, conceptId);
  return row?.understandCompleted ?? false;
}

// Whether the given user has marked a concept's Simulate tab complete (set the
// first time they play a simulator through to its final frame).
export async function getSimulateState(
  userId: string,
  conceptId: string,
): Promise<boolean> {
  const row = await getTabProgressRow(userId, conceptId);
  return row?.simulateCompleted ?? false;
}

// Whether the given user has completed a concept's Challenge tab.
export async function getChallengeState(
  userId: string,
  conceptId: string,
): Promise<boolean> {
  const row = await getTabProgressRow(userId, conceptId);
  return row?.challengeCompleted ?? false;
}

// Whether the given user has completed a concept's Interview tab (set once
// they rate every question).
export async function getInterviewState(
  userId: string,
  conceptId: string,
): Promise<boolean> {
  const row = await getTabProgressRow(userId, conceptId);
  return row?.interviewCompleted ?? false;
}

// Whether the given user has completed a concept's Build tab.
export async function getBuildState(userId: string, conceptId: string): Promise<boolean> {
  const row = await getTabProgressRow(userId, conceptId);
  return row?.buildCompleted ?? false;
}

// Whether the user currently has active premium — for server-side gating of
// premium challenges (the seam Feature 38 fills out). Live, per-user. Queries
// `profiles`, not `userConceptProgress`, so it stays separate from the shared
// tab-progress row above.
export async function getIsPremiumUser(userId: string): Promise<boolean> {
  const row = await db.query.profiles.findFirst({
    columns: { isPremium: true, premiumExpiresAt: true },
    where: eq(profiles.id, userId),
  });
  if (!row?.isPremium) return false;
  return !row.premiumExpiresAt || row.premiumExpiresAt > new Date();
}
