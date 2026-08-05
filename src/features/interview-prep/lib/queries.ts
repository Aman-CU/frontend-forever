import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, asc, eq, isNotNull, lte, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  challenges,
  collectionQuestions,
  interviewQuestions,
  profiles,
  userCollectionQuestionProgress,
  userInterviewReviews,
} from "@/lib/schema";
import {
  COLLECTION_QUESTION_COLLECTIONS,
  type ChallengeDifficulty,
  type CollectionQuestionCollection,
} from "@/lib/constants";
import { getAllSystemDesignGuides } from "@/lib/systemDesignGuides";
import { COMPANIES } from "@/features/interview-prep/lib/companies";

// COLLECTION_QUESTION_COLLECTIONS's declared order (javascript, react, nextjs)
// is the intended IA order (build-plan.md's sidebar order) — not alphabetical.
// Sorting by `asc(collectionQuestions.collection)` in SQL would sort
// alphabetically ("ff-nextjs" < "ff-react"), putting Next.js questions before
// React ones in the ff-75 virtual collection. This map lets the catalog sort
// by the real IA order instead.
const COLLECTION_SORT_RANK: Record<CollectionQuestionCollection, number> = Object.fromEntries(
  COLLECTION_QUESTION_COLLECTIONS.map((c, i) => [c, i]),
) as Record<CollectionQuestionCollection, number>;
import type { InterviewPrepCollectionKey } from "@/features/interview-prep/lib/collectionMeta";
import { FF_75_KEY, type InterviewPrepRouteCollection } from "@/features/interview-prep/lib/collectionRoutes";

export type CollectionSummary = {
  collection: InterviewPrepCollectionKey;
  questionCount: number;
  completedCount: number;
};

type CollectionCounts = Record<CollectionQuestionCollection, number> & { ff75: number };

// Static counts per collection_questions.collection value + the isFf75 flag.
// Cached like Practice/Learn's catalogs — a Feature 31 content-authoring pass
// invalidates it via the shared "concepts" tag.
const getCollectionQuestionCounts = unstable_cache(
  async (): Promise<CollectionCounts> => {
    const rows = await db
      .select({ collection: collectionQuestions.collection, count: sql<number>`count(*)::int` })
      .from(collectionQuestions)
      .groupBy(collectionQuestions.collection);

    const counts = Object.fromEntries(
      COLLECTION_QUESTION_COLLECTIONS.map((c) => [c, 0]),
    ) as Record<CollectionQuestionCollection, number>;
    for (const row of rows) {
      counts[row.collection as CollectionQuestionCollection] = row.count;
    }

    const [ff75Row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(collectionQuestions)
      .where(eq(collectionQuestions.isFf75, true));

    return { ...counts, ff75: ff75Row?.count ?? 0 };
  },
  ["collection-question-counts"],
  { tags: ["concepts"], revalidate: 3600 },
);

// Real per-user completed counts, grouped by collection_questions.collection
// + a separate ff75 tally — mirrors getCollectionQuestionCounts' shape above.
// A per-request cache() (not unstable_cache) since this is user-scoped, same
// precedent as getIsPremiumUser/getReviewQueuePreview below.
const getCompletedQuestionCounts = cache(async (userId: string | null): Promise<CollectionCounts> => {
  const empty = Object.fromEntries(
    COLLECTION_QUESTION_COLLECTIONS.map((c) => [c, 0]),
  ) as Record<CollectionQuestionCollection, number>;
  if (!userId) return { ...empty, ff75: 0 };

  const rows = await db
    .select({
      collection: collectionQuestions.collection,
      isFf75: collectionQuestions.isFf75,
      count: sql<number>`count(*)::int`,
    })
    .from(userCollectionQuestionProgress)
    .innerJoin(collectionQuestions, eq(userCollectionQuestionProgress.questionId, collectionQuestions.id))
    .where(eq(userCollectionQuestionProgress.userId, userId))
    .groupBy(collectionQuestions.collection, collectionQuestions.isFf75);

  const counts = { ...empty };
  let ff75 = 0;
  for (const row of rows) {
    counts[row.collection as CollectionQuestionCollection] += row.count;
    if (row.isFf75) ff75 += row.count;
  }
  return { ...counts, ff75 };
});

// FF Collections rows for Get Started. completedCount is real per-user data
// once logged in (userCollectionQuestionProgress) — 0 for logged-out users,
// same as every other personalization on this page. FF System Design still
// has no per-user tracking (Feature 49 has no schema at all) — its
// completedCount stays 0. FF System Design's count itself comes from the
// filesystem (Feature 49's MDX guides, no DB row), not a query — CollectionRow
// only falls back to "Coming soon" when this returns null, which it now does
// exactly when zero guides are authored yet.
export const getCollectionSummaries = cache(
  async (userId: string | null): Promise<CollectionSummary[]> => {
    const [counts, completed] = await Promise.all([
      getCollectionQuestionCounts(),
      getCompletedQuestionCounts(userId),
    ]);
    const systemDesignGuideCount = getAllSystemDesignGuides().length;

    return [
      { collection: "ff-75", questionCount: counts.ff75, completedCount: completed.ff75 },
      {
        collection: "ff-javascript",
        questionCount: counts["ff-javascript"],
        completedCount: completed["ff-javascript"],
      },
      { collection: "ff-react", questionCount: counts["ff-react"], completedCount: completed["ff-react"] },
      { collection: "ff-nextjs", questionCount: counts["ff-nextjs"], completedCount: completed["ff-nextjs"] },
      ...(systemDesignGuideCount > 0
        ? [{ collection: "ff-system-design" as const, questionCount: systemDesignGuideCount, completedCount: 0 }]
        : []),
    ];
  },
);

export type ReviewQueueItem = {
  id: string;
  question: string;
  difficulty: string;
};

// Feature 32's review session needs the full answer/companies/isPremium
// shape, not just the homepage preview's id/question/difficulty — a
// separate type rather than widening ReviewQueueItem, so the preview query
// below stays untouched.
export type ReviewSessionQuestion = {
  id: string;
  question: string;
  answer: string;
  difficulty: string;
  companies: string[];
  isPremium: boolean;
};

// Real query from day one (Feature 30's own sign-off decision), not a
// placeholder — returns empty for every user until Feature 32 ships the
// review session and starts writing to user_interview_reviews, then lights
// up automatically with no further changes here. Logged-out users never
// call this — Review Queue is personalization, gated by login, not premium.
export const getReviewQueuePreview = cache(
  async (userId: string | null, limit = 5): Promise<ReviewQueueItem[]> => {
    if (!userId) return [];
    return db
      .select({
        id: interviewQuestions.id,
        question: interviewQuestions.question,
        difficulty: interviewQuestions.difficulty,
      })
      .from(userInterviewReviews)
      .innerJoin(interviewQuestions, eq(userInterviewReviews.questionId, interviewQuestions.id))
      .where(
        and(
          eq(userInterviewReviews.userId, userId),
          lte(userInterviewReviews.nextReviewAt, new Date()),
        ),
      )
      .orderBy(userInterviewReviews.nextReviewAt)
      .limit(limit);
  },
);

// Feature 32's review session — the *entire* due set (no cap, unlike the
// 5-item homepage preview above), since the session's own "X remaining"
// progress and end-of-session summary need a fixed, complete queue loaded
// up front rather than a re-fetched teaser.
export const getDueReviewSession = cache(
  async (userId: string | null): Promise<ReviewSessionQuestion[]> => {
    if (!userId) return [];
    return db
      .select({
        id: interviewQuestions.id,
        question: interviewQuestions.question,
        answer: interviewQuestions.answer,
        difficulty: interviewQuestions.difficulty,
        companies: interviewQuestions.companies,
        isPremium: interviewQuestions.isPremium,
      })
      .from(userInterviewReviews)
      .innerJoin(interviewQuestions, eq(userInterviewReviews.questionId, interviewQuestions.id))
      .where(
        and(
          eq(userInterviewReviews.userId, userId),
          lte(userInterviewReviews.nextReviewAt, new Date()),
        ),
      )
      .orderBy(userInterviewReviews.nextReviewAt);
  },
);

// Whether the given user currently has active premium — same query shape as
// features/learn's getIsPremiumUser, duplicated locally rather than imported
// since features never import other features (architecture.md's invariant).
export const getIsPremiumUser = cache(async (userId: string): Promise<boolean> => {
  const [row] = await db
    .select({ isPremium: profiles.isPremium, premiumExpiresAt: profiles.premiumExpiresAt })
    .from(profiles)
    .where(eq(profiles.id, userId));
  if (!row?.isPremium) return false;
  return !row.premiumExpiresAt || row.premiumExpiresAt > new Date();
});

// ── Feature 31: FF Collections list/detail pages ─────────────────────────────

type CollectionQuestionRow = {
  id: string;
  collection: CollectionQuestionCollection;
  slug: string;
  question: string;
  answer: string;
  difficulty: ChallengeDifficulty;
  companies: string[];
  isFf75: boolean;
  isPremium: boolean;
};

// All collection_questions rows, cached like getCollectionQuestionCounts above
// (same "concepts" tag — a content-authoring upsert invalidates both).
// Small enough today (6 pilot rows, ~299 once the full run lands) to load in
// full and filter/sort in memory, same approach as Practice's getPracticeCatalog.
const getCollectionQuestionCatalog = unstable_cache(
  async (): Promise<CollectionQuestionRow[]> => {
    const rows = await db
      .select({
        id: collectionQuestions.id,
        collection: collectionQuestions.collection,
        slug: collectionQuestions.slug,
        question: collectionQuestions.question,
        answer: collectionQuestions.answer,
        difficulty: collectionQuestions.difficulty,
        companies: collectionQuestions.companies,
        isFf75: collectionQuestions.isFf75,
        isPremium: collectionQuestions.isPremium,
      })
      .from(collectionQuestions)
      .orderBy(asc(collectionQuestions.orderIndex));

    // Stable-sort by the real IA order (see COLLECTION_SORT_RANK above) —
    // rows within the same collection keep the orderIndex order from the
    // query above, since Array.prototype.sort is a stable sort.
    return rows
      .map((r) => ({
        ...r,
        collection: r.collection as CollectionQuestionCollection,
        difficulty: r.difficulty as ChallengeDifficulty,
      }))
      .sort((a, b) => COLLECTION_SORT_RANK[a.collection] - COLLECTION_SORT_RANK[b.collection]);
  },
  ["collection-question-catalog"],
  { tags: ["concepts"], revalidate: 3600 },
);

// "ff-75" is a virtual collection (isFf75 across all 3 real collections, see
// collectionRoutes.ts) — every other route collection is a literal DB value.
function filterByRouteCollection(
  rows: CollectionQuestionRow[],
  routeCollection: InterviewPrepRouteCollection,
): CollectionQuestionRow[] {
  if (routeCollection === FF_75_KEY) return rows.filter((r) => r.isFf75);
  return rows.filter((r) => r.collection === routeCollection);
}

// Real per-user completed question ids — a per-request cache() (not
// unstable_cache) since this is user-scoped, same precedent as
// getCompletedQuestionCounts above.
const getCompletedQuestionIds = cache(async (userId: string | null): Promise<Set<string>> => {
  if (!userId) return new Set();
  const rows = await db
    .select({ questionId: userCollectionQuestionProgress.questionId })
    .from(userCollectionQuestionProgress)
    .where(eq(userCollectionQuestionProgress.userId, userId));
  return new Set(rows.map((r) => r.questionId));
});

export type CollectionQuestionListItem = {
  slug: string;
  question: string;
  difficulty: ChallengeDifficulty;
  companies: string[];
  isPremium: boolean;
  // Real per-user state (user_collection_question_progress) — false for
  // logged-out users, same as every other personalization on this page.
  completed: boolean;
};

export const getCollectionQuestionList = cache(
  async (
    routeCollection: InterviewPrepRouteCollection,
    userId: string | null,
  ): Promise<CollectionQuestionListItem[]> => {
    const [catalog, completedIds] = await Promise.all([
      getCollectionQuestionCatalog(),
      getCompletedQuestionIds(userId),
    ]);
    return filterByRouteCollection(catalog, routeCollection).map((q) => ({
      slug: q.slug,
      question: q.question,
      difficulty: q.difficulty,
      companies: q.companies,
      isPremium: q.isPremium,
      completed: completedIds.has(q.id),
    }));
  },
);

export type CollectionQuestionDetail = {
  slug: string;
  question: string;
  answer: string;
  difficulty: ChallengeDifficulty;
  companies: string[];
  isPremium: boolean;
  // 1-based position within its route collection's ordered list — same
  // "questionNumber" convention as Practice's ChallengeDetail.
  questionNumber: number;
};

export const getCollectionQuestionBySlug = cache(
  async (
    routeCollection: InterviewPrepRouteCollection,
    slug: string,
  ): Promise<CollectionQuestionDetail | null> => {
    const catalog = await getCollectionQuestionCatalog();
    const items = filterByRouteCollection(catalog, routeCollection);
    const index = items.findIndex((q) => q.slug === slug);
    if (index === -1) return null;

    const item = items[index];
    return {
      slug: item.slug,
      question: item.question,
      answer: item.answer,
      difficulty: item.difficulty,
      companies: item.companies,
      isPremium: item.isPremium,
      questionNumber: index + 1,
    };
  },
);

export type CollectionQuestionNavItem = { slug: string; question: string; questionNumber: number };

export const getAdjacentCollectionQuestions = cache(
  async (
    routeCollection: InterviewPrepRouteCollection,
    slug: string,
  ): Promise<{ prev: CollectionQuestionNavItem | null; next: CollectionQuestionNavItem | null }> => {
    const catalog = await getCollectionQuestionCatalog();
    const items = filterByRouteCollection(catalog, routeCollection);
    const index = items.findIndex((q) => q.slug === slug);
    if (index === -1) return { prev: null, next: null };

    const prevItem = index > 0 ? items[index - 1] : null;
    const nextItem = index < items.length - 1 ? items[index + 1] : null;

    return {
      prev: prevItem ? { slug: prevItem.slug, question: prevItem.question, questionNumber: index } : null,
      next: nextItem
        ? { slug: nextItem.slug, question: nextItem.question, questionNumber: index + 2 }
        : null,
    };
  },
);

// ── Feature 51: Company Guides ───────────────────────────────────────────────
// Sourced from collection_questions (Feature 31's real 299-question FF
// Collections content) + challenges (Practice's real, company-tagged
// standalone content) — not interview_questions, which build-plan.md's
// original spec text names but which predates Feature 31's dedicated schema
// and today only feeds Learn's per-concept Interview tab. Both source tables
// are small enough (low hundreds of rows) to load in full and aggregate in
// memory, same "load it all, filter in memory" approach as
// getCollectionQuestionCatalog/Practice's getPracticeCatalog — avoids a raw
// unnest() query for a one-time-per-hour aggregation.

type CompanyCatalogRow = { companies: string[] };

// Plain Record, not a Map — unstable_cache round-trips its return value
// through JSON to store it, which silently collapses a Map to `{}` (this was
// a real bug, caught live: `questionCounts.get is not a function` once the
// cached value came back deserialized). Same reason getCollectionQuestionCounts
// above already returns a Record instead of a Map.
const getCompanyCountsByTable = unstable_cache(
  async (): Promise<{ questionCounts: Record<string, number>; challengeCounts: Record<string, number> }> => {
    const [questionRows, challengeRows]: [CompanyCatalogRow[], CompanyCatalogRow[]] = await Promise.all([
      db.select({ companies: collectionQuestions.companies }).from(collectionQuestions),
      db.select({ companies: challenges.companies }).from(challenges),
    ]);

    const tally = (rows: CompanyCatalogRow[]): Record<string, number> => {
      const counts: Record<string, number> = {};
      for (const row of rows) {
        for (const company of row.companies) {
          counts[company] = (counts[company] ?? 0) + 1;
        }
      }
      return counts;
    };

    return { questionCounts: tally(questionRows), challengeCounts: tally(challengeRows) };
  },
  ["company-guide-counts"],
  { tags: ["concepts"], revalidate: 3600 },
);

export type CompanyGuideSummary = {
  slug: string;
  name: string;
  questionCount: number;
  challengeCount: number;
};

// Real counts for all 32 companies, including the ones with zero content
// today — an honest zero, not a fabricated placeholder, same precedent as
// getCollectionSummaries above.
export const getCompanyGuideSummaries = cache(async (): Promise<CompanyGuideSummary[]> => {
  const { questionCounts, challengeCounts } = await getCompanyCountsByTable();
  return COMPANIES.map((company) => ({
    slug: company.slug,
    name: company.name,
    questionCount: questionCounts[company.name] ?? 0,
    challengeCount: challengeCounts[company.name] ?? 0,
  }));
});

export type CompanyGuideQuestion = {
  slug: string;
  collection: CollectionQuestionCollection;
  question: string;
  difficulty: ChallengeDifficulty;
};

export type CompanyGuideChallenge = {
  slug: string;
  category: string;
  title: string;
  difficulty: ChallengeDifficulty;
};

export type CompanyGuideDetail = {
  questions: CompanyGuideQuestion[];
  challenges: CompanyGuideChallenge[];
};

// companyName is the real display name (COMPANIES' `name`, e.g. "ByteDance")
// — the array-contains match is against that, not the slug.
export const getCompanyGuideDetail = cache(
  async (companyName: string): Promise<CompanyGuideDetail> => {
    const [questionRows, challengeRows] = await Promise.all([
      db
        .select({
          slug: collectionQuestions.slug,
          collection: collectionQuestions.collection,
          question: collectionQuestions.question,
          difficulty: collectionQuestions.difficulty,
        })
        .from(collectionQuestions)
        .where(sql`${collectionQuestions.companies} @> ARRAY[${companyName}]::text[]`)
        .orderBy(asc(collectionQuestions.orderIndex)),
      db
        .select({
          slug: challenges.slug,
          category: challenges.category,
          title: challenges.title,
          difficulty: challenges.difficulty,
        })
        .from(challenges)
        .where(
          and(
            sql`${challenges.companies} @> ARRAY[${companyName}]::text[]`,
            isNotNull(challenges.category),
          ),
        )
        .orderBy(asc(challenges.orderIndex)),
    ]);

    return {
      questions: questionRows.map((q) => ({
        ...q,
        collection: q.collection as CollectionQuestionCollection,
        difficulty: q.difficulty as ChallengeDifficulty,
      })),
      challenges: challengeRows.map((c) => ({
        ...c,
        category: c.category as string,
        difficulty: c.difficulty as ChallengeDifficulty,
      })),
    };
  },
);
