import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { challenges, userChallengeSubmissions } from "@/lib/schema";
import type { ChallengeDifficulty } from "@/lib/constants";
import { PRACTICE_CATEGORIES, type PracticeCategory } from "@/features/practice/lib/practiceCategories";

export type PracticeChallengeSummary = {
  id: string;
  slug: string;
  title: string;
  difficulty: ChallengeDifficulty;
  category: PracticeCategory;
  companies: string[];
  completed: boolean;
};

export type PracticeCategorySummary = {
  category: PracticeCategory;
  challengeCount: number;
  completedCount: number;
};

type CatalogChallenge = Omit<PracticeChallengeSummary, "completed">;

// Static catalog — standalone Practice questions, tagged directly via
// challenges.category (not via a concept join: these are Practice's own
// content, not Learn's per-concept Challenge-tab challenges). Cached across
// requests like Learn's getConceptCatalog (same "concepts" tag, since a
// reseed touches both).
const getPracticeCatalog = unstable_cache(
  async (): Promise<Record<PracticeCategory, CatalogChallenge[]>> => {
    const rows = await db
      .select({
        id: challenges.id,
        slug: challenges.slug,
        title: challenges.title,
        difficulty: challenges.difficulty,
        companies: challenges.companies,
        category: challenges.category,
        orderIndex: challenges.orderIndex,
      })
      .from(challenges)
      .where(inArray(challenges.category, PRACTICE_CATEGORIES))
      .orderBy(challenges.orderIndex);

    const grouped = Object.fromEntries(
      PRACTICE_CATEGORIES.map((cat) => [cat, [] as CatalogChallenge[]]),
    ) as Record<PracticeCategory, CatalogChallenge[]>;

    for (const row of rows) {
      const category = row.category as PracticeCategory;
      grouped[category]?.push({
        id: row.id,
        slug: row.slug,
        title: row.title,
        difficulty: row.difficulty as ChallengeDifficulty,
        category,
        companies: row.companies,
      });
    }

    return grouped;
  },
  ["practice-challenge-catalog"],
  { tags: ["concepts"], revalidate: 3600 },
);

// Live, per-user, per-request dedupe: which challenge IDs this user has a
// passing submission for. This is the correct signal for standalone Practice
// questions (keyed by challengeId directly, no concept involved) — it just
// returns empty today since nothing writes to user_challenge_submissions
// anywhere in the app yet (that's Feature 29's Editor page); it becomes real
// with zero query changes once that write path exists.
const getSolvedChallengeIds = cache(
  async (userId: string | null): Promise<Set<string>> => {
    if (!userId) return new Set();
    const rows = await db
      .select({ challengeId: userChallengeSubmissions.challengeId })
      .from(userChallengeSubmissions)
      .where(
        and(
          eq(userChallengeSubmissions.userId, userId),
          eq(userChallengeSubmissions.status, "passed"),
        ),
      );
    return new Set(rows.map((r) => r.challengeId));
  },
);

export const getPracticeCategorySummaries = cache(
  async (userId: string | null): Promise<PracticeCategorySummary[]> => {
    const [catalog, solvedIds] = await Promise.all([
      getPracticeCatalog(),
      getSolvedChallengeIds(userId),
    ]);

    return PRACTICE_CATEGORIES.map((category) => {
      const items = catalog[category] ?? [];
      return {
        category,
        challengeCount: items.length,
        completedCount: items.filter((c) => solvedIds.has(c.id)).length,
      };
    });
  },
);

export const getPracticeChallengesByCategory = cache(
  async (category: PracticeCategory, userId: string | null): Promise<PracticeChallengeSummary[]> => {
    const [catalog, solvedIds] = await Promise.all([
      getPracticeCatalog(),
      getSolvedChallengeIds(userId),
    ]);
    const items = catalog[category] ?? [];
    return items.map((c) => ({ ...c, completed: solvedIds.has(c.id) }));
  },
);

export async function getPracticeTotalSolved(userId: string | null): Promise<number> {
  if (!userId) return 0;
  const summaries = await getPracticeCategorySummaries(userId);
  return summaries.reduce((sum, s) => sum + s.completedCount, 0);
}
