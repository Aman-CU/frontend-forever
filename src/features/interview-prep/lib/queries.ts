import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, eq, lte, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { collectionQuestions, interviewQuestions, userInterviewReviews } from "@/lib/schema";
import { COLLECTION_QUESTION_COLLECTIONS, type CollectionQuestionCollection } from "@/lib/constants";
import type { InterviewPrepCollectionKey } from "@/features/interview-prep/lib/collectionMeta";

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
