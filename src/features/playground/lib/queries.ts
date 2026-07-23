import { unstable_cache } from "next/cache";
import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { profiles, uiBattleChallenges } from "@/lib/schema";
import type { ChallengeDifficulty } from "@/lib/constants";

export type UiBattleSummary = {
  slug: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  targetImageUrl: string;
  isPremium: boolean;
};

export type UiBattleDetail = UiBattleSummary & {
  description: string;
  targetWidth: number;
  targetHeight: number;
  targetHtml: string;
  targetCss: string;
  targetJs: string;
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  // Always returned by this query (cached, no notion of "who's asking") —
  // the caller (the page, not this query) is responsible for stripping these
  // to "" server-side before ever passing them to a client component when
  // the viewer isn't premium. See schema/playground.ts's header comment.
  solutionHtml: string;
  solutionCss: string;
  solutionJs: string;
};

// Same "concepts" tag reuse pattern would be wrong here — this table has
// nothing to do with the concept catalog, so it gets its own cache tag,
// invalidated whenever scripts/seed.ts reseeds this table specifically.
export const getUiBattleCatalog = unstable_cache(
  async (): Promise<UiBattleSummary[]> => {
    const rows = await db
      .select({
        slug: uiBattleChallenges.slug,
        title: uiBattleChallenges.title,
        description: uiBattleChallenges.description,
        difficulty: uiBattleChallenges.difficulty,
        targetImageUrl: uiBattleChallenges.targetImageUrl,
        isPremium: uiBattleChallenges.isPremium,
      })
      .from(uiBattleChallenges)
      .orderBy(asc(uiBattleChallenges.orderIndex));

    return rows.map((r) => ({ ...r, difficulty: r.difficulty as ChallengeDifficulty }));
  },
  ["ui-battle-catalog"],
  { tags: ["playground"], revalidate: 3600 },
);

export const getUiBattleBySlug = unstable_cache(
  async (slug: string): Promise<UiBattleDetail | null> => {
    const [row] = await db
      .select()
      .from(uiBattleChallenges)
      .where(eq(uiBattleChallenges.slug, slug))
      .limit(1);

    if (!row) return null;

    return {
      slug: row.slug,
      title: row.title,
      description: row.description,
      difficulty: row.difficulty as ChallengeDifficulty,
      targetImageUrl: row.targetImageUrl,
      targetWidth: row.targetWidth,
      targetHeight: row.targetHeight,
      targetHtml: row.targetHtml,
      targetCss: row.targetCss,
      targetJs: row.targetJs,
      starterHtml: row.starterHtml,
      starterCss: row.starterCss,
      starterJs: row.starterJs,
      solutionHtml: row.solutionHtml,
      solutionCss: row.solutionCss,
      solutionJs: row.solutionJs,
      isPremium: row.isPremium,
    };
  },
  ["ui-battle-by-slug"],
  { tags: ["playground"], revalidate: 3600 },
);

// Duplicated locally rather than imported from features/learn or
// features/interview-prep — features never import other features. Same
// precedent as features/interview-prep's own copy (see its queries.ts header
// comment). This is the *viewer's* premium status, independent of a
// challenge's own isPremium flag (that one's the cosmetic Feature-38 seam
// for the whole card/challenge).
export async function getIsPremiumUser(userId: string): Promise<boolean> {
  const row = await db.query.profiles.findFirst({
    columns: { isPremium: true, premiumExpiresAt: true },
    where: eq(profiles.id, userId),
  });
  if (!row?.isPremium) return false;
  return !row.premiumExpiresAt || row.premiumExpiresAt > new Date();
}
