import { cache } from "react";
import { eq, inArray, and } from "drizzle-orm";

import { db } from "@/lib/db";
import type { RoadmapType, RoadmapNodeType, RoadmapNodeLinkType } from "@/lib/constants";
import {
  roadmaps,
  roadmapNodes,
  roadmapNodeLinks,
  concepts,
  challenges,
  collectionQuestions,
  userConceptProgress,
  userRoadmapNodeProgress,
} from "@/lib/schema";

export type RoadmapNodeLinkView = {
  id: string;
  linkType: RoadmapNodeLinkType;
  label: string;
  href: string;
};

export type RoadmapNodeView = {
  id: string;
  slug: string;
  title: string;
  description: string;
  nodeType: RoadmapNodeType;
  isOptional: boolean;
  positionX: number;
  positionY: number;
  parentId: string | null;
  isCompleted: boolean;
  links: RoadmapNodeLinkView[];
};

export type RoadmapDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  roadmapType: RoadmapType;
  isPremium: boolean;
  nodes: RoadmapNodeView[];
};

// A single roadmap's full node graph, for the canvas page. Not
// unstable_cache-wrapped like the list-page catalog — this reads the
// current user's progress inline (per-request, not cacheable across users),
// and a single roadmap's node count is small enough that the extra query
// weight doesn't need a separate cached-catalog layer the way the list
// page's "every roadmap at once" view does.
export const getRoadmapDetail = cache(
  async (slug: string, userId: string | null): Promise<RoadmapDetail | null> => {
    const [roadmap] = await db
      .select({
        id: roadmaps.id,
        slug: roadmaps.slug,
        title: roadmaps.title,
        description: roadmaps.description,
        roadmapType: roadmaps.roadmapType,
        isPremium: roadmaps.isPremium,
      })
      .from(roadmaps)
      .where(eq(roadmaps.slug, slug))
      .limit(1);
    if (!roadmap) return null;

    const nodeRows = await db
      .select({
        id: roadmapNodes.id,
        slug: roadmapNodes.slug,
        title: roadmapNodes.title,
        description: roadmapNodes.description,
        nodeType: roadmapNodes.nodeType,
        isOptional: roadmapNodes.isOptional,
        positionX: roadmapNodes.positionX,
        positionY: roadmapNodes.positionY,
        parentId: roadmapNodes.parentId,
      })
      .from(roadmapNodes)
      .where(eq(roadmapNodes.roadmapId, roadmap.id))
      // Column-major, not row-major: every node in one authored column
      // (same positionX) sorts fully together, top to bottom, before the
      // next column starts. A row-major sort (positionY first) looked
      // right for a single-column roadmap but interleaved two columns'
      // sections out of their intended reading order whenever one column's
      // sections ran shorter than the other's and drifted out of vertical
      // sync — most visible in RoadmapMobileList, which has no 2D layout
      // to fall back on.
      .orderBy(roadmapNodes.positionX, roadmapNodes.positionY);
    const nodeIds = nodeRows.map((n) => n.id);

    const linkRows = nodeIds.length
      ? await db
          .select({
            id: roadmapNodeLinks.id,
            nodeId: roadmapNodeLinks.nodeId,
            linkType: roadmapNodeLinks.linkType,
            externalTitle: roadmapNodeLinks.externalTitle,
            externalUrl: roadmapNodeLinks.externalUrl,
            orderIndex: roadmapNodeLinks.orderIndex,
            conceptSlug: concepts.slug,
            conceptCategory: concepts.category,
            conceptTitle: concepts.title,
            challengeSlug: challenges.slug,
            challengeCategory: challenges.category,
            challengeTitle: challenges.title,
            questionSlug: collectionQuestions.slug,
            questionCollection: collectionQuestions.collection,
            questionText: collectionQuestions.question,
          })
          .from(roadmapNodeLinks)
          .leftJoin(concepts, eq(roadmapNodeLinks.conceptId, concepts.id))
          .leftJoin(challenges, eq(roadmapNodeLinks.challengeId, challenges.id))
          .leftJoin(collectionQuestions, eq(roadmapNodeLinks.collectionQuestionId, collectionQuestions.id))
          .where(inArray(roadmapNodeLinks.nodeId, nodeIds))
          .orderBy(roadmapNodeLinks.orderIndex)
      : [];

    const linksByNode = new Map<string, RoadmapNodeLinkView[]>();
    for (const row of linkRows) {
      const view = toLinkView(row);
      if (!view) continue;
      const list = linksByNode.get(row.nodeId) ?? [];
      list.push(view);
      linksByNode.set(row.nodeId, list);
    }

    const completedNodeIds = userId
      ? await getCompletedNodeIds(userId, nodeRows, linkRows)
      : new Set<string>();

    return {
      ...roadmap,
      roadmapType: roadmap.roadmapType as RoadmapType,
      nodes: nodeRows.map((n) => ({
        ...n,
        nodeType: n.nodeType as RoadmapNodeType,
        isCompleted: completedNodeIds.has(n.id),
        links: linksByNode.get(n.id) ?? [],
      })),
    };
  },
);

function toLinkView(row: {
  id: string;
  linkType: string;
  externalTitle: string | null;
  externalUrl: string | null;
  conceptSlug: string | null;
  conceptCategory: string | null;
  conceptTitle: string | null;
  challengeSlug: string | null;
  challengeCategory: string | null;
  challengeTitle: string | null;
  questionSlug: string | null;
  questionCollection: string | null;
  questionText: string | null;
}): RoadmapNodeLinkView | null {
  const linkType = row.linkType as RoadmapNodeLinkType;
  if (linkType === "learn-concept" && row.conceptSlug && row.conceptCategory && row.conceptTitle) {
    return {
      id: row.id,
      linkType,
      label: row.conceptTitle,
      href: `/learn/${row.conceptCategory}/${row.conceptSlug}`,
    };
  }
  if (
    linkType === "practice-challenge" &&
    row.challengeSlug &&
    row.challengeCategory &&
    row.challengeTitle
  ) {
    return {
      id: row.id,
      linkType,
      label: row.challengeTitle,
      href: `/practice/${row.challengeCategory}/${row.challengeSlug}`,
    };
  }
  if (
    linkType === "interview-question" &&
    row.questionSlug &&
    row.questionCollection &&
    row.questionText
  ) {
    return {
      id: row.id,
      linkType,
      label: row.questionText,
      href: `/interview-prep/${row.questionCollection}/${row.questionSlug}`,
    };
  }
  if (
    (linkType === "external-video" || linkType === "external-article" || linkType === "internal-page") &&
    row.externalUrl
  ) {
    return {
      id: row.id,
      linkType,
      label: row.externalTitle ?? row.externalUrl,
      href: row.externalUrl,
    };
  }
  // A link row whose target row got deleted out from under it (e.g. a
  // concept removed) — skip rather than render a dead/blank link.
  return null;
}

// A topic node reads as done if a "learn-concept" link's concept is fully
// completed, OR the user manually marked the node done (external nodes —
// see user_roadmap_node_progress's schema comment). Mirrors
// queries/summaries.ts's getRoadmapSummaries derivation, at single-roadmap
// scope.
async function getCompletedNodeIds(
  userId: string,
  nodeRows: { id: string }[],
  linkRows: { nodeId: string; linkType: string; conceptSlug: string | null }[],
): Promise<Set<string>> {
  const conceptSlugsByNode = new Map<string, string[]>();
  for (const row of linkRows) {
    if (row.linkType !== "learn-concept" || !row.conceptSlug) continue;
    const list = conceptSlugsByNode.get(row.nodeId) ?? [];
    list.push(row.conceptSlug);
    conceptSlugsByNode.set(row.nodeId, list);
  }

  const nodeIds = nodeRows.map((n) => n.id);
  const [completedConcepts, doneNodes] = await Promise.all([
    db
      .select({ slug: concepts.slug })
      .from(userConceptProgress)
      .innerJoin(concepts, eq(userConceptProgress.conceptId, concepts.id))
      .where(and(eq(userConceptProgress.userId, userId), eq(userConceptProgress.fullyCompleted, true))),
    nodeIds.length
      ? db
          .select({ nodeId: userRoadmapNodeProgress.nodeId })
          .from(userRoadmapNodeProgress)
          .where(
            and(
              eq(userRoadmapNodeProgress.userId, userId),
              inArray(userRoadmapNodeProgress.nodeId, nodeIds),
            ),
          )
      : Promise.resolve([]),
  ]);
  const completedConceptSlugs = new Set(completedConcepts.map((c) => c.slug));
  const doneNodeIds = new Set(doneNodes.map((n) => n.nodeId));

  const completed = new Set<string>(doneNodeIds);
  for (const [nodeId, slugs] of conceptSlugsByNode) {
    if (slugs.some((s) => completedConceptSlugs.has(s))) completed.add(nodeId);
  }
  return completed;
}
