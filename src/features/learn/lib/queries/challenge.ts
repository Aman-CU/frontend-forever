import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { challenges } from "@/lib/schema";

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
