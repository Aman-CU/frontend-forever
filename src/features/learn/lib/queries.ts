import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { CONCEPT_CATEGORIES, type ConceptCategory } from "@/lib/constants";
import {
  challenges,
  concepts,
  interviewQuestions,
  profiles,
  projectBriefs,
  userConceptProgress,
} from "@/lib/schema";

export type ConceptSummary = {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  isPremium: boolean;
  orderIndex: number;
  isCompleted: boolean;
};

export type CategorySummary = {
  category: ConceptCategory;
  conceptCount: number;
  completedCount: number;
  concepts: ConceptSummary[];
};

export type ConceptDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ConceptCategory;
  difficulty: string;
  isPremium: boolean;
};

// The static concept catalog, grouped by category — identical for every user, so
// it's cached across requests/deploys (invalidate with revalidateTag("concepts")
// after a content reseed). No user data and no headers/cookies access inside, as
// required by unstable_cache.
type CatalogConcept = Omit<ConceptSummary, "isCompleted">;

const getConceptCatalog = unstable_cache(
  async (): Promise<Record<ConceptCategory, CatalogConcept[]>> => {
    const allConcepts = await db
      .select({
        id: concepts.id,
        slug: concepts.slug,
        title: concepts.title,
        category: concepts.category,
        difficulty: concepts.difficulty,
        isPremium: concepts.isPremium,
        orderIndex: concepts.orderIndex,
      })
      .from(concepts)
      .orderBy(concepts.category, concepts.orderIndex);

    const grouped = Object.fromEntries(
      CONCEPT_CATEGORIES.map((cat) => [cat, [] as CatalogConcept[]]),
    ) as Record<ConceptCategory, CatalogConcept[]>;

    for (const concept of allConcepts) {
      const { category, ...rest } = concept;
      grouped[category as ConceptCategory]?.push(rest);
    }

    return grouped;
  },
  ["concept-catalog"],
  { tags: ["concepts"], revalidate: 3600 },
);

// Single concept by slug, for the concept page shell. Static content, so cached
// across requests (same "concepts" tag as the catalog).
export const getConceptBySlug = unstable_cache(
  async (slug: string): Promise<ConceptDetail | null> => {
    const rows = await db
      .select({
        id: concepts.id,
        slug: concepts.slug,
        title: concepts.title,
        description: concepts.description,
        category: concepts.category,
        difficulty: concepts.difficulty,
        isPremium: concepts.isPremium,
      })
      .from(concepts)
      .where(eq(concepts.slug, slug))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return { ...row, category: row.category as ConceptCategory };
  },
  ["concept-by-slug"],
  { tags: ["concepts"], revalidate: 3600 },
);

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

// The single challenge bound to a concept (its Challenge tab renders this one).
// Static content, so cached across requests under the "concepts" tag.
export type ChallengeData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  starterCode: string;
  solutionCode: string;
  testCases: { input: string; expected: string; label: string }[];
  hints: string[];
  isPremium: boolean;
};

export const getChallengeByConceptId = unstable_cache(
  async (conceptId: string): Promise<ChallengeData | null> => {
    const rows = await db
      .select({
        id: challenges.id,
        slug: challenges.slug,
        title: challenges.title,
        description: challenges.description,
        difficulty: challenges.difficulty,
        starterCode: challenges.starterCode,
        solutionCode: challenges.solutionCode,
        testCases: challenges.testCases,
        hints: challenges.hints,
        isPremium: challenges.isPremium,
      })
      .from(challenges)
      .where(eq(challenges.conceptId, conceptId))
      .orderBy(challenges.orderIndex)
      .limit(1);

    return rows[0] ?? null;
  },
  ["challenge-by-concept"],
  { tags: ["concepts"], revalidate: 3600 },
);

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

// The single project brief bound to a concept (its Build tab renders this one).
// Static content, so cached across requests under the "concepts" tag.
export type ProjectBriefData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  starterCode: string;
  solutionCode: string;
  testCases: { input: string; expected: string; label: string }[];
  isPremium: boolean;
};

export const getProjectBriefByConceptId = unstable_cache(
  async (conceptId: string): Promise<ProjectBriefData | null> => {
    const rows = await db
      .select({
        id: projectBriefs.id,
        slug: projectBriefs.slug,
        title: projectBriefs.title,
        description: projectBriefs.description,
        starterCode: projectBriefs.starterCode,
        solutionCode: projectBriefs.solutionCode,
        testCases: projectBriefs.testCases,
        isPremium: projectBriefs.isPremium,
      })
      .from(projectBriefs)
      .where(eq(projectBriefs.conceptId, conceptId))
      .orderBy(projectBriefs.orderIndex)
      .limit(1);

    return rows[0] ?? null;
  },
  ["project-brief-by-concept"],
  { tags: ["concepts"], revalidate: 3600 },
);

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

// Overlays the current user's completion state onto the cached catalog. cache()
// dedupes the per-request call (layout + page both call it); only the small
// per-user progress query is live — the heavy concept read comes from the cache.
export const getCategorySummaries = cache(
  async (userId: string | null): Promise<CategorySummary[]> => {
    const catalog = await getConceptCatalog();

    let completedConceptIds = new Set<string>();
    if (userId) {
      const progress = await db
        .select({ conceptId: userConceptProgress.conceptId })
        .from(userConceptProgress)
        .where(
          and(
            eq(userConceptProgress.userId, userId),
            eq(userConceptProgress.fullyCompleted, true),
          ),
        );
      completedConceptIds = new Set(progress.map((p) => p.conceptId));
    }

    return CONCEPT_CATEGORIES.map((category) => {
      const catalogConcepts = catalog[category] ?? [];
      const conceptSummaries = catalogConcepts.map((concept) => ({
        ...concept,
        isCompleted: completedConceptIds.has(concept.id),
      }));
      return {
        category,
        conceptCount: conceptSummaries.length,
        completedCount: conceptSummaries.filter((c) => c.isCompleted).length,
        concepts: conceptSummaries,
      };
    });
  },
);
