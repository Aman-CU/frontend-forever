import { cache } from "react";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { CONCEPT_CATEGORIES, type ConceptCategory } from "@/lib/constants";
import { concepts, userConceptProgress } from "@/lib/schema";

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

// Single concept by slug, for the concept page shell. cache()-wrapped so a
// repeated lookup in the same render pass (e.g. metadata + page body) hits once.
export const getConceptBySlug = cache(
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
);

// cache() deduplicates identical calls within the same server render pass —
// both learn/layout.tsx (sidebar) and learn/page.tsx (cards) call this function,
// but only one DB round-trip happens per request.
export const getCategorySummaries = cache(
  async (userId: string | null): Promise<CategorySummary[]> => {
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

    const categoryMap = new Map<ConceptCategory, CategorySummary>();

    for (const concept of allConcepts) {
      const cat = concept.category as ConceptCategory;
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, {
          category: cat,
          conceptCount: 0,
          completedCount: 0,
          concepts: [],
        });
      }
      const entry = categoryMap.get(cat)!;
      const isCompleted = completedConceptIds.has(concept.id);
      entry.conceptCount++;
      if (isCompleted) entry.completedCount++;
      entry.concepts.push({
        id: concept.id,
        slug: concept.slug,
        title: concept.title,
        difficulty: concept.difficulty,
        isPremium: concept.isPremium,
        orderIndex: concept.orderIndex,
        isCompleted,
      });
    }

    // Return in canonical CONCEPT_CATEGORIES order
    return CONCEPT_CATEGORIES.map(
      (cat) =>
        categoryMap.get(cat) ?? {
          category: cat,
          conceptCount: 0,
          completedCount: 0,
          concepts: [],
        },
    );
  },
);
