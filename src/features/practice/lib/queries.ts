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

export type ChallengeDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  category: PracticeCategory;
  starterCode: string;
  solutionCode: string;
  testCases: { input: string; expected: string; label: string }[];
  hints: string[];
  companies: string[];
  videoUrl: string | null;
  // 1-based position within its category's orderIndex-sorted list — the same
  // number ChallengeListRow already renders (01, 02, ...), reused here for
  // the page header and the share image.
  questionNumber: number;
};

// Static, full-detail row for one Editor page — separate from
// getPracticeCatalog (which only selects summary fields for the list pages).
// Cached the same way as getChallengeByConceptId: disk-backed, "concepts"
// tag, so a reseed needs a dev restart / .next clear / tag revalidation.
const getChallengeDetailBySlug = unstable_cache(
  async (slug: string) => {
    const rows = await db
      .select({
        id: challenges.id,
        slug: challenges.slug,
        title: challenges.title,
        description: challenges.description,
        difficulty: challenges.difficulty,
        category: challenges.category,
        starterCode: challenges.starterCode,
        solutionCode: challenges.solutionCode,
        testCases: challenges.testCases,
        hints: challenges.hints,
        companies: challenges.companies,
        videoUrl: challenges.videoUrl,
      })
      .from(challenges)
      .where(eq(challenges.slug, slug))
      .limit(1);
    return rows[0] ?? null;
  },
  ["practice-challenge-detail"],
  { tags: ["concepts"], revalidate: 3600 },
);

export async function getChallengeBySlug(
  category: PracticeCategory,
  slug: string,
): Promise<ChallengeDetail | null> {
  const [detail, catalog] = await Promise.all([getChallengeDetailBySlug(slug), getPracticeCatalog()]);
  // Category in the URL must match the challenge's real category — prevents
  // the same slug resolving under a mismatched /practice/[category] segment.
  if (!detail || detail.category !== category) return null;

  const items = catalog[category] ?? [];
  const position = items.findIndex((c) => c.slug === slug);

  return {
    ...detail,
    difficulty: detail.difficulty as ChallengeDifficulty,
    category: detail.category as PracticeCategory,
    questionNumber: position >= 0 ? position + 1 : items.length + 1,
  };
}

export type ChallengeNavItem = { slug: string; title: string; questionNumber: number };

// Prev/Next within the same category's orderIndex-sorted list — the same
// ordering the Category List page and questionNumber already use.
export async function getAdjacentChallenges(
  category: PracticeCategory,
  slug: string,
): Promise<{ prev: ChallengeNavItem | null; next: ChallengeNavItem | null }> {
  const catalog = await getPracticeCatalog();
  const items = catalog[category] ?? [];
  const index = items.findIndex((c) => c.slug === slug);
  if (index === -1) return { prev: null, next: null };

  const prevItem = index > 0 ? items[index - 1] : null;
  const nextItem = index < items.length - 1 ? items[index + 1] : null;

  return {
    prev: prevItem ? { slug: prevItem.slug, title: prevItem.title, questionNumber: index } : null,
    next: nextItem ? { slug: nextItem.slug, title: nextItem.title, questionNumber: index + 2 } : null,
  };
}

// Live, per-user: has this user ever passed this specific challenge? Drives
// the Editor page's solution-gate starting state (a returning user who
// already solved it shouldn't have to re-earn the unlock this session).
export const hasPassedChallenge = cache(
  async (userId: string | null, challengeId: string): Promise<boolean> => {
    if (!userId) return false;
    const [row] = await db
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
    return !!row;
  },
);
