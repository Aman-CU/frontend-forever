import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { projectBriefs } from "@/lib/schema";

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
