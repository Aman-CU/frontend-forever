import { cache } from "react";
import { and, asc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  studyPlans,
  studyPlanItems,
  concepts,
  userConceptProgress,
  playbookReads,
} from "@/lib/schema";
import { STUDY_PLAN_SLUGS, type StudyPlanItemType, type StudyPlanSlug } from "@/lib/constants";

export function isStudyPlanSlug(value: string): value is StudyPlanSlug {
  return (STUDY_PLAN_SLUGS as readonly string[]).includes(value);
}

export type StudyPlanSummary = {
  slug: StudyPlanSlug;
  title: string;
  durationLabel: string;
  hoursCommitment: string;
  description: string;
  isPremium: boolean;
  itemCount: number;
};

// All 3 plans, item counts included — small table, loaded in full and
// grouped in memory, same approach as this feature's other small catalogs.
export const getStudyPlans = cache(async (): Promise<StudyPlanSummary[]> => {
  const rows = await db
    .select({
      slug: studyPlans.slug,
      title: studyPlans.title,
      durationLabel: studyPlans.durationLabel,
      hoursCommitment: studyPlans.hoursCommitment,
      description: studyPlans.description,
      isPremium: studyPlans.isPremium,
      orderIndex: studyPlans.orderIndex,
      itemCount: sql<number>`count(${studyPlanItems.id})::int`,
    })
    .from(studyPlans)
    .leftJoin(studyPlanItems, eq(studyPlanItems.studyPlanId, studyPlans.id))
    .groupBy(studyPlans.id)
    .orderBy(asc(studyPlans.orderIndex));

  return rows.map((r) => ({ ...r, slug: r.slug as StudyPlanSlug }));
});

export type StudyPlanItemView = {
  id: string;
  groupLabel: string;
  itemType: StudyPlanItemType;
  refId: string | null;
  href: string;
  title: string;
  description: string;
  // null when this itemType has no per-user progress source to check
  // (collection / system-design-guide / review-session / company-guide) —
  // rendered with no checkmark rather than a fabricated false.
  completed: boolean | null;
};

export type StudyPlanDetail = {
  slug: StudyPlanSlug;
  title: string;
  durationLabel: string;
  hoursCommitment: string;
  description: string;
  isPremium: boolean;
  items: StudyPlanItemView[];
};

export const getStudyPlanBySlug = cache(
  async (slug: StudyPlanSlug, userId: string | null): Promise<StudyPlanDetail | null> => {
    const [plan] = await db.select().from(studyPlans).where(eq(studyPlans.slug, slug));
    if (!plan) return null;

    const items = await db
      .select()
      .from(studyPlanItems)
      .where(eq(studyPlanItems.studyPlanId, plan.id))
      .orderBy(asc(studyPlanItems.orderIndex));

    const completionByItemId = await getStudyPlanItemCompletion(userId, items);

    return {
      slug: plan.slug as StudyPlanSlug,
      title: plan.title,
      durationLabel: plan.durationLabel,
      hoursCommitment: plan.hoursCommitment,
      description: plan.description,
      isPremium: plan.isPremium,
      items: items.map((item) => ({
        id: item.id,
        groupLabel: item.groupLabel,
        itemType: item.itemType as StudyPlanItemType,
        refId: item.refId,
        href: item.href,
        title: item.title,
        description: item.description,
        completed: completionByItemId.get(item.id) ?? null,
      })),
    };
  },
);

type StudyPlanItemRow = { id: string; itemType: string; refId: string | null };

// Derives a live completion flag per item from each item's own real progress
// table — no dedicated study-plan-completion schema (architect decision, see
// build-plan.md's Feature 51 entry). Only "concept" and "playbook-chapter"
// items have a real per-user progress source; every other itemType resolves
// to `null` (no checkmark) rather than a guessed value.
async function getStudyPlanItemCompletion(
  userId: string | null,
  items: StudyPlanItemRow[],
): Promise<Map<string, boolean>> {
  const result = new Map<string, boolean>();
  if (!userId) return result;

  const conceptItems = items.filter((i) => i.itemType === "concept" && i.refId);
  const playbookItems = items.filter((i) => i.itemType === "playbook-chapter" && i.refId);

  if (conceptItems.length > 0) {
    const conceptSlugs = conceptItems.map((i) => i.refId!.split("/")[1]).filter(Boolean);
    const conceptRows = await db
      .select({ id: concepts.id, slug: concepts.slug })
      .from(concepts)
      .where(inArray(concepts.slug, conceptSlugs));
    const conceptIdBySlug = new Map(conceptRows.map((c) => [c.slug, c.id]));

    const conceptIds = conceptRows.map((c) => c.id);
    const progressRows =
      conceptIds.length > 0
        ? await db
            .select({ conceptId: userConceptProgress.conceptId, fullyCompleted: userConceptProgress.fullyCompleted })
            .from(userConceptProgress)
            .where(and(eq(userConceptProgress.userId, userId), inArray(userConceptProgress.conceptId, conceptIds)))
        : [];
    const completedConceptIds = new Set(
      progressRows.filter((p) => p.fullyCompleted).map((p) => p.conceptId),
    );

    for (const item of conceptItems) {
      const slug = item.refId!.split("/")[1];
      const conceptId = conceptIdBySlug.get(slug);
      result.set(item.id, conceptId ? completedConceptIds.has(conceptId) : false);
    }
  }

  if (playbookItems.length > 0) {
    const readRows = await db
      .select({ playbookSlug: playbookReads.playbookSlug, chapterSlug: playbookReads.chapterSlug })
      .from(playbookReads)
      .where(eq(playbookReads.userId, userId));
    const readSet = new Set(readRows.map((r) => `${r.playbookSlug}/${r.chapterSlug}`));

    for (const item of playbookItems) {
      result.set(item.id, readSet.has(item.refId!));
    }
  }

  return result;
}
