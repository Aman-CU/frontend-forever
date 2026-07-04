import { unstable_cache } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { interviewQuestions, userInterviewReviews } from "@/lib/schema";

// The interview questions linked to a concept (its Interview tab renders these).
// Static content, so cached across requests under the "concepts" tag.
export type InterviewQuestionData = {
  id: string;
  question: string;
  answer: string;
  difficulty: string;
  companies: string[];
  isPremium: boolean;
};

export const getInterviewQuestionsByConceptId = unstable_cache(
  async (conceptId: string): Promise<InterviewQuestionData[]> => {
    return db
      .select({
        id: interviewQuestions.id,
        question: interviewQuestions.question,
        answer: interviewQuestions.answer,
        difficulty: interviewQuestions.difficulty,
        companies: interviewQuestions.companies,
        isPremium: interviewQuestions.isPremium,
      })
      .from(interviewQuestions)
      .where(eq(interviewQuestions.conceptId, conceptId))
      .orderBy(interviewQuestions.orderIndex);
  },
  ["interview-questions-by-concept"],
  { tags: ["concepts"], revalidate: 3600 },
);

// Per-question self-assessment ratings for a concept's Interview tab, keyed by
// question id. Backed by user_interview_reviews (Feature 32's SM-2 table,
// pulled forward here so ratings persist across visits instead of resetting
// on every tab switch — Feature 32 will read/extend the same rows for real
// spaced-repetition scheduling; this query only derives the local tab's
// binary "knew"/"review" view from `quality`). Returns a plain string union,
// not features/interview-prep's QuestionRating type — features/learn must
// never import another feature (see architecture.md's invariant).
export async function getInterviewRatings(
  userId: string,
  conceptId: string,
): Promise<Record<string, "knew" | "review">> {
  const rows = await db
    .select({ questionId: userInterviewReviews.questionId, quality: userInterviewReviews.quality })
    .from(userInterviewReviews)
    .innerJoin(interviewQuestions, eq(interviewQuestions.id, userInterviewReviews.questionId))
    .where(and(eq(userInterviewReviews.userId, userId), eq(interviewQuestions.conceptId, conceptId)));
  return Object.fromEntries(rows.map((r) => [r.questionId, r.quality >= 4 ? "knew" : "review"]));
}
