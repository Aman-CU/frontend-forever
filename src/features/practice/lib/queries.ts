import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { challenges, concepts, userConceptProgress } from "@/lib/schema";
import type { ChallengeDifficulty } from "@/lib/constants";
import { PRACTICE_CATEGORIES, type PracticeCategory } from "@/features/practice/lib/practiceCategories";

export type PracticeChallengeSummary = {
  slug: string;
  title: string;
  difficulty: ChallengeDifficulty;
  category: PracticeCategory;
  conceptId: string;
  conceptTitle: string;
  companies: string[];
  completed: boolean;
};

export type PracticeCategorySummary = {
  category: PracticeCategory;
  challengeCount: number;
  completedCount: number;
};

type CatalogChallenge = Omit<PracticeChallengeSummary, "completed">;

// Static catalog — every challenge in the 5 Practice categories, joined to its
// concept for title/category. Identical for every user, so it's cached across
// requests like Learn's getConceptCatalog (same "concepts" tag: challenges are
// seeded alongside concepts, so a reseed invalidates both together).
const getPracticeCatalog = unstable_cache(
  async (): Promise<Record<PracticeCategory, CatalogChallenge[]>> => {
    const rows = await db
      .select({
        slug: challenges.slug,
        title: challenges.title,
        difficulty: challenges.difficulty,
        companies: challenges.companies,
        conceptId: concepts.id,
        conceptTitle: concepts.title,
        category: concepts.category,
        orderIndex: challenges.orderIndex,
      })
      .from(challenges)
      .innerJoin(concepts, eq(challenges.conceptId, concepts.id))
      .where(inArray(concepts.category, PRACTICE_CATEGORIES))
      .orderBy(challenges.orderIndex);

    const grouped = Object.fromEntries(
      PRACTICE_CATEGORIES.map((cat) => [cat, [] as CatalogChallenge[]]),
    ) as Record<PracticeCategory, CatalogChallenge[]>;

    for (const row of rows) {
      const category = row.category as PracticeCategory;
      grouped[category]?.push({
        slug: row.slug,
        title: row.title,
        difficulty: row.difficulty as ChallengeDifficulty,
        category,
        conceptId: row.conceptId,
        conceptTitle: row.conceptTitle,
        companies: row.companies,
      });
    }

    return grouped;
  },
  ["practice-challenge-catalog"],
  { tags: ["concepts"], revalidate: 3600 },
);

// Live, per-user, per-request dedupe: which concepts' Challenge tab this user
// has completed — used as Practice's "solved" signal. `user_challenge_submissions`
// (a raw attempt log) exists in the schema but nothing writes to it anywhere in
// the app yet — that's Feature 29's Editor page. `userConceptProgress.challengeCompleted`
// is the real signal today, already set by Learn's Challenge tab flow, and
// Practice's challenges are those same rows (same `challenges` table).
const getCompletedChallengeConceptIds = cache(
  async (userId: string | null): Promise<Set<string>> => {
    if (!userId) return new Set();
    const rows = await db
      .select({ conceptId: userConceptProgress.conceptId })
      .from(userConceptProgress)
      .where(
        and(eq(userConceptProgress.userId, userId), eq(userConceptProgress.challengeCompleted, true)),
      );
    return new Set(rows.map((r) => r.conceptId));
  },
);

export const getPracticeCategorySummaries = cache(
  async (userId: string | null): Promise<PracticeCategorySummary[]> => {
    const [catalog, completedConceptIds] = await Promise.all([
      getPracticeCatalog(),
      getCompletedChallengeConceptIds(userId),
    ]);

    return PRACTICE_CATEGORIES.map((category) => {
      const items = catalog[category] ?? [];
      return {
        category,
        challengeCount: items.length,
        completedCount: items.filter((c) => completedConceptIds.has(c.conceptId)).length,
      };
    });
  },
);

export const getPracticeChallengesByCategory = cache(
  async (category: PracticeCategory, userId: string | null): Promise<PracticeChallengeSummary[]> => {
    const [catalog, completedConceptIds] = await Promise.all([
      getPracticeCatalog(),
      getCompletedChallengeConceptIds(userId),
    ]);
    const items = catalog[category] ?? [];
    return items.map((c) => ({ ...c, completed: completedConceptIds.has(c.conceptId) }));
  },
);

export async function getPracticeTotalSolved(userId: string | null): Promise<number> {
  if (!userId) return 0;
  const summaries = await getPracticeCategorySummaries(userId);
  return summaries.reduce((sum, s) => sum + s.completedCount, 0);
}
