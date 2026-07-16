import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, asc, eq, lte, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { collectionQuestions, interviewQuestions, userInterviewReviews } from "@/lib/schema";
import {
  COLLECTION_QUESTION_COLLECTIONS,
  type ChallengeDifficulty,
  type CollectionQuestionCollection,
} from "@/lib/constants";

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

// FF Collections rows for Get Started. completedCount is always 0 today — no
// per-user completion tracking exists yet for collection_questions (that's
// Feature 31/32's job). Real, not mocked — genuinely zero until then, same
// precedent as Practice Hub's bars pre-Feature-29. FF System Design isn't
// included: it has no row in this table at all (Feature 49's separate content).
export const getCollectionSummaries = cache(async (): Promise<CollectionSummary[]> => {
  const counts = await getCollectionQuestionCounts();
  return [
    { collection: "ff-75", questionCount: counts.ff75, completedCount: 0 },
    { collection: "ff-javascript", questionCount: counts["ff-javascript"], completedCount: 0 },
    { collection: "ff-react", questionCount: counts["ff-react"], completedCount: 0 },
    { collection: "ff-nextjs", questionCount: counts["ff-nextjs"], completedCount: 0 },
  ];
});

export type ReviewQueueItem = {
  id: string;
  question: string;
  difficulty: string;
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

// ── Feature 31: FF Collections list/detail pages ─────────────────────────────

type CollectionQuestionRow = {
  collection: CollectionQuestionCollection;
  slug: string;
  question: string;
  answer: string;
  difficulty: ChallengeDifficulty;
  companies: string[];
  isFf75: boolean;
};

// All collection_questions rows, cached like getCollectionQuestionCounts above
// (same "concepts" tag — a content-authoring upsert invalidates both).
// Small enough today (6 pilot rows, ~299 once the full run lands) to load in
// full and filter/sort in memory, same approach as Practice's getPracticeCatalog.
const getCollectionQuestionCatalog = unstable_cache(
  async (): Promise<CollectionQuestionRow[]> => {
    const rows = await db
      .select({
        collection: collectionQuestions.collection,
        slug: collectionQuestions.slug,
        question: collectionQuestions.question,
        answer: collectionQuestions.answer,
        difficulty: collectionQuestions.difficulty,
        companies: collectionQuestions.companies,
        isFf75: collectionQuestions.isFf75,
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

export type CollectionQuestionListItem = {
  slug: string;
  question: string;
  difficulty: ChallengeDifficulty;
  companies: string[];
  // Always false — collection_questions has no per-user completion tracking at
  // all yet (unlike Practice/Learn, no feature currently scopes to build one).
  // Honest zero, not mocked, same precedent as getCollectionSummaries above.
  completed: boolean;
};

export const getCollectionQuestionList = cache(
  async (routeCollection: InterviewPrepRouteCollection): Promise<CollectionQuestionListItem[]> => {
    const catalog = await getCollectionQuestionCatalog();
    return filterByRouteCollection(catalog, routeCollection).map((q) => ({
      slug: q.slug,
      question: q.question,
      difficulty: q.difficulty,
      companies: q.companies,
      completed: false,
    }));
  },
);

export type CollectionQuestionDetail = {
  slug: string;
  question: string;
  answer: string;
  difficulty: ChallengeDifficulty;
  companies: string[];
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
