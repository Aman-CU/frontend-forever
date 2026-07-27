import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { ROADMAP_TYPES, type RoadmapType } from "@/lib/constants";
import {
  roadmaps,
  roadmapNodes,
  roadmapNodeLinks,
  userConceptProgress,
  userRoadmapNodeProgress,
} from "@/lib/schema";

export type RoadmapSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  roadmapType: RoadmapType;
  isPremium: boolean;
  topicCount: number;
  completedCount: number;
};

type CatalogNode = {
  roadmapId: string;
  nodeId: string;
  // Every learn-concept-linked conceptId this topic node carries — a node
  // counts as complete if the user has fully completed any one of them.
  conceptIds: string[];
};

type CatalogRoadmap = Omit<RoadmapSummary, "completedCount">;

// roadmaps.roadmap_type is a DB text column (CHECK-constrained, but the
// driver still hands it back as a plain string) — validate against the real
// value set instead of a blind `as RoadmapType` cast, so a data-integrity
// bug surfaces here as a loud error rather than silently mistyped data.
// Exported so queries/detail.ts's getRoadmapDetail can reuse the same
// validation instead of its own blind cast.
export function parseRoadmapType(value: string): RoadmapType {
  if ((ROADMAP_TYPES as readonly string[]).includes(value)) return value as RoadmapType;
  throw new Error(`[roadmaps] Unexpected roadmap_type "${value}" — not in ROADMAP_TYPES.`);
}

// The static roadmap catalog (roadmaps + their topic node/concept-link
// shape) — identical for every user, so it's cached across requests
// (invalidate with revalidateTag("roadmaps") after a content reseed). No
// user data and no headers/cookies access inside, as required by
// unstable_cache. Mirrors features/learn/lib/queries/concepts.ts's
// getConceptCatalog pattern.
const getRoadmapCatalog = unstable_cache(
  async (): Promise<{ roadmaps: CatalogRoadmap[]; nodes: CatalogNode[] }> => {
    const allRoadmaps = await db
      .select({
        id: roadmaps.id,
        slug: roadmaps.slug,
        title: roadmaps.title,
        description: roadmaps.description,
        roadmapType: roadmaps.roadmapType,
        isPremium: roadmaps.isPremium,
      })
      .from(roadmaps)
      .orderBy(roadmaps.roadmapType, roadmaps.orderIndex);

    // Only "topic" nodes count toward a roadmap's size — "section" headers
    // are non-clickable group labels with no links of their own.
    const topicNodes = await db
      .select({ id: roadmapNodes.id, roadmapId: roadmapNodes.roadmapId })
      .from(roadmapNodes)
      .where(eq(roadmapNodes.nodeType, "topic"));

    const learnConceptLinks = await db
      .select({ nodeId: roadmapNodeLinks.nodeId, conceptId: roadmapNodeLinks.conceptId })
      .from(roadmapNodeLinks)
      .where(eq(roadmapNodeLinks.linkType, "learn-concept"));

    const conceptIdsByNode = new Map<string, string[]>();
    for (const link of learnConceptLinks) {
      if (!link.conceptId) continue;
      const list = conceptIdsByNode.get(link.nodeId) ?? [];
      list.push(link.conceptId);
      conceptIdsByNode.set(link.nodeId, list);
    }

    const nodes: CatalogNode[] = topicNodes.map((n) => ({
      roadmapId: n.roadmapId,
      nodeId: n.id,
      conceptIds: conceptIdsByNode.get(n.id) ?? [],
    }));

    return {
      roadmaps: allRoadmaps.map((r) => ({
        ...r,
        roadmapType: parseRoadmapType(r.roadmapType),
        topicCount: nodes.filter((n) => n.roadmapId === r.id).length,
      })),
      nodes,
    };
  },
  ["roadmap-catalog"],
  { tags: ["roadmaps"], revalidate: 3600 },
);

// Overlays the current user's completion state onto the cached catalog. A
// topic node reads as done if EITHER the concept it links to is fully
// completed (real Learn progress) OR the user manually marked it done
// (external-linked nodes — see user_roadmap_node_progress's schema comment).
export const getRoadmapSummaries = cache(
  async (userId: string | null): Promise<RoadmapSummary[]> => {
    const { roadmaps: catalogRoadmaps, nodes } = await getRoadmapCatalog();

    if (!userId) {
      return catalogRoadmaps.map((r) => ({ ...r, completedCount: 0 }));
    }

    const [completedConcepts, doneNodes] = await Promise.all([
      db
        .select({ conceptId: userConceptProgress.conceptId })
        .from(userConceptProgress)
        .where(
          and(eq(userConceptProgress.userId, userId), eq(userConceptProgress.fullyCompleted, true)),
        ),
      db
        .select({ nodeId: userRoadmapNodeProgress.nodeId })
        .from(userRoadmapNodeProgress)
        .where(eq(userRoadmapNodeProgress.userId, userId)),
    ]);
    const completedConceptIds = new Set(completedConcepts.map((c) => c.conceptId));
    const doneNodeIds = new Set(doneNodes.map((n) => n.nodeId));

    const isNodeDone = (n: CatalogNode) =>
      doneNodeIds.has(n.nodeId) || n.conceptIds.some((id) => completedConceptIds.has(id));

    return catalogRoadmaps.map((r) => ({
      ...r,
      completedCount: nodes.filter((n) => n.roadmapId === r.id && isNodeDone(n)).length,
    }));
  },
);
