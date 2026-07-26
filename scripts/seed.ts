/**
 * Seed script — run with: npx tsx scripts/seed.ts
 * Safe to re-run: all inserts are idempotent (keyed on slug or collection+order_index).
 * Extend this file as platform content grows; never bake seeds into migrations.
 *
 * Content lives in scripts/seed/ (one file per table, and further split by
 * Practice category / Interview collection for the two largest tables) — this
 * file is just DB connection + upsert logic. See scripts/seed/types.ts for
 * the shared per-table seed shapes.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { sql, eq, and, inArray, notInArray } from "drizzle-orm";
import { Pool } from "pg";
import {
  concepts,
  challenges,
  interviewQuestions,
  collectionQuestions,
  projectBriefs,
  roadmaps,
  roadmapNodes,
  roadmapNodeLinks,
  studyPlans,
  studyPlanItems,
  uiBattleChallenges,
} from "../src/lib/schema";
import { CONCEPTS } from "./seed/concepts";
import { CHALLENGES } from "./seed/challenges";
import { INTERVIEW_QUESTIONS } from "./seed/interviewQuestions";
import { COLLECTION_QUESTIONS } from "./seed/collectionQuestions";
import { PROJECT_BRIEFS } from "./seed/projectBriefs";
import { ROADMAPS } from "./seed/roadmaps";
import { STUDY_PLANS } from "./seed/studyPlans";
import { UI_BATTLE_CHALLENGES } from "./seed/uiBattles";

// ── DB connection (same TLS pattern as drizzle.config.ts) ────────────────────

const url = new URL(process.env.DATABASE_URL!);
url.searchParams.delete("sslmode");

const pool = new Pool({
  connectionString: url.toString(),
  ssl: process.env.NODE_ENV === "production" ? true : { rejectUnauthorized: false },
});

const db = drizzle(pool);

// ── Seed ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("[seed] Inserting concepts...");
  // onConflictDoUpdate (not DoNothing) so re-running backfills orderIndex/title
  // changes onto existing concepts — needed by Feature 40, which renumbers and
  // renames concepts already seeded by earlier features as Phase 10 slots new
  // concepts in around them. Still idempotent on slug.
  const insertedConcepts = await db
    .insert(concepts)
    .values(CONCEPTS.map((c) => ({ ...c })))
    .onConflictDoUpdate({
      target: concepts.slug,
      set: {
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        category: sql`excluded.category`,
        difficulty: sql`excluded.difficulty`,
        isPremium: sql`excluded.is_premium`,
        orderIndex: sql`excluded.order_index`,
      },
    })
    .returning({ id: concepts.id, slug: concepts.slug });

  // Build a slug → id map from what's now in the DB (inserted + pre-existing)
  const allConcepts = await db
    .select({ id: concepts.id, slug: concepts.slug })
    .from(concepts);
  const conceptBySlug = Object.fromEntries(allConcepts.map((c) => [c.slug, c.id]));
  console.log(`[seed] ${insertedConcepts.length} concept(s) upserted (${allConcepts.length} total)`);

  console.log("[seed] Inserting challenges...");
  const challengeValues = CHALLENGES.map(({ conceptSlug, ...ch }) => {
    // Fail fast: a conceptSlug that doesn't resolve is a seed-data bug, not a
    // reason to silently insert an unlinked challenge.
    if (conceptSlug && !conceptBySlug[conceptSlug]) {
      throw new Error(
        `[seed] Challenge "${ch.slug}" references unknown conceptSlug "${conceptSlug}". Fix the seed before re-running.`,
      );
    }
    return {
      ...ch,
      isPremium: ch.isPremium ?? false,
      conceptId: conceptSlug ? conceptBySlug[conceptSlug] : null,
    };
  });
  // onConflictDoUpdate (not DoNothing) so re-running backfills conceptId onto
  // challenges seeded before they were concept-linked. Still idempotent on slug.
  const insertedChallenges = await db
    .insert(challenges)
    .values(challengeValues)
    .onConflictDoUpdate({
      target: challenges.slug,
      set: {
        // COALESCE so a standalone challenge (no conceptSlug → null) never
        // clobbers an existing link on re-run; a real new link still applies.
        conceptId: sql`COALESCE(excluded.concept_id, ${challenges.conceptId})`,
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        difficulty: sql`excluded.difficulty`,
        starterCode: sql`excluded.starter_code`,
        solutionCode: sql`excluded.solution_code`,
        testCases: sql`excluded.test_cases`,
        hints: sql`excluded.hints`,
        companies: sql`excluded.companies`,
        category: sql`excluded.category`,
        isPremium: sql`excluded.is_premium`,
        orderIndex: sql`excluded.order_index`,
      },
    })
    .returning({ slug: challenges.slug });
  console.log(`[seed] ${insertedChallenges.length} challenge(s) upserted`);

  // Slug → id map for roadmap_node_links' "practice-challenge" links below.
  const allChallenges = await db.select({ id: challenges.id, slug: challenges.slug }).from(challenges);
  const challengeBySlug = Object.fromEntries(allChallenges.map((c) => [c.slug, c.id]));

  console.log("[seed] Inserting interview questions...");
  const questionValues = INTERVIEW_QUESTIONS.map(({ conceptSlug, ...q }) => {
    // Fail fast: a conceptSlug that doesn't resolve is a seed-data bug, not a
    // reason to silently insert an unlinked question (mirrors challenges above).
    if (conceptSlug && !conceptBySlug[conceptSlug]) {
      throw new Error(
        `[seed] Interview question "${q.question}" references unknown conceptSlug "${conceptSlug}". Fix the seed before re-running.`,
      );
    }
    return {
      ...q,
      isPremium: q.isPremium ?? false,
      conceptId: conceptSlug ? conceptBySlug[conceptSlug] : null,
    };
  });
  // onConflictDoUpdate (not DoNothing) so re-running backfills concept_id onto
  // questions seeded before they were concept-linked. Idempotent on (collection,
  // order_index) — same caveat as CHALLENGES' slug-based identity, but this table
  // has no stable per-row key: reordering questions within a collection (rather
  // than appending) will upsert onto the wrong existing row instead of the
  // intended one, and can leave a stale duplicate behind. Fixing this properly
  // needs a schema change (a stable `slug`/key column, unique per row) — tracked
  // as a known follow-up, out of scope for this pass since it isn't hit by any
  // seed edit made so far (only appends, never reorders).
  const insertedQuestions = await db
    .insert(interviewQuestions)
    .values(questionValues)
    .onConflictDoUpdate({
      target: [interviewQuestions.collection, interviewQuestions.orderIndex],
      set: {
        // COALESCE so an unlinked question (null) never clobbers an existing
        // link on re-run; a real new link still applies.
        conceptId: sql`COALESCE(excluded.concept_id, ${interviewQuestions.conceptId})`,
        question: sql`excluded.question`,
        answer: sql`excluded.answer`,
        difficulty: sql`excluded.difficulty`,
        companies: sql`excluded.companies`,
        isPremium: sql`excluded.is_premium`,
      },
    })
    .returning({ id: interviewQuestions.id });
  console.log(`[seed] ${insertedQuestions.length} question(s) upserted`);

  console.log("[seed] Inserting collection questions...");
  // Keyed on slug (unique in the schema), not (collection, orderIndex) — avoids
  // the reorder-upserts-onto-wrong-row caveat documented above for
  // interview_questions, which has no stable per-row key.
  const insertedCollectionQuestions = await db
    .insert(collectionQuestions)
    .values(
      COLLECTION_QUESTIONS.map((q) => ({
        ...q,
        companies: q.companies ?? [],
        isFf75: q.isFf75 ?? false,
        isPremium: q.isPremium ?? false,
      })),
    )
    .onConflictDoUpdate({
      target: collectionQuestions.slug,
      set: {
        collection: sql`excluded.collection`,
        question: sql`excluded.question`,
        answer: sql`excluded.answer`,
        difficulty: sql`excluded.difficulty`,
        companies: sql`excluded.companies`,
        isFf75: sql`excluded.is_ff75`,
        isPremium: sql`excluded.is_premium`,
        orderIndex: sql`excluded.order_index`,
      },
    })
    .returning({ slug: collectionQuestions.slug });
  console.log(`[seed] ${insertedCollectionQuestions.length} collection question(s) upserted`);

  // Slug → id map for roadmap_node_links' "interview-question" links below.
  const allCollectionQuestions = await db
    .select({ id: collectionQuestions.id, slug: collectionQuestions.slug })
    .from(collectionQuestions);
  const collectionQuestionBySlug = Object.fromEntries(
    allCollectionQuestions.map((q) => [q.slug, q.id]),
  );

  console.log("[seed] Inserting project briefs...");
  const projectBriefValues = PROJECT_BRIEFS.map(({ conceptSlug, ...pb }) => {
    // Fail fast, same as CHALLENGES/INTERVIEW_QUESTIONS above — a project brief
    // is always concept-linked (no standalone case), so an unknown conceptSlug
    // is a seed-data bug.
    if (!conceptBySlug[conceptSlug]) {
      throw new Error(
        `[seed] Project brief "${pb.slug}" references unknown conceptSlug "${conceptSlug}". Fix the seed before re-running.`,
      );
    }
    return { ...pb, isPremium: pb.isPremium ?? false, conceptId: conceptBySlug[conceptSlug] };
  });
  const insertedProjectBriefs = await db
    .insert(projectBriefs)
    .values(projectBriefValues)
    .onConflictDoUpdate({
      target: projectBriefs.slug,
      set: {
        conceptId: sql`excluded.concept_id`,
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        starterCode: sql`excluded.starter_code`,
        solutionCode: sql`excluded.solution_code`,
        testCases: sql`excluded.test_cases`,
        isPremium: sql`excluded.is_premium`,
        orderIndex: sql`excluded.order_index`,
      },
    })
    .returning({ slug: projectBriefs.slug });
  console.log(`[seed] ${insertedProjectBriefs.length} project brief(s) upserted`);

  console.log("[seed] Inserting roadmaps...");
  // Nodes are upserted on their real (roadmap_id, slug) unique key, not
  // deleted-and-reinserted — a node's id, and any real
  // user_roadmap_node_progress row hanging off it, now survives a re-seed
  // unless that node's slug is genuinely removed from the authored content.
  // (An earlier version deleted every node on every run "for simplicity,"
  // which would have silently wiped real user progress on the next content
  // update once this feature has real users — caught in CodeRabbit review.)
  // Slugs no longer present in the seed get pruned, which does cascade to
  // their links/progress — that's correct, just scoped to genuine removals
  // now instead of the whole roadmap every time. Each roadmap's writes run
  // inside one transaction so a crash mid-run can't leave it half-updated.
  for (const roadmap of ROADMAPS) {
    const { nodes: nodeSeeds, ...roadmapData } = roadmap;

    await db.transaction(async (tx) => {
      await tx
        .insert(roadmaps)
        .values({ ...roadmapData, isPremium: roadmapData.isPremium ?? false })
        .onConflictDoUpdate({
          target: roadmaps.slug,
          set: {
            title: sql`excluded.title`,
            description: sql`excluded.description`,
            roadmapType: sql`excluded.roadmap_type`,
            isPremium: sql`excluded.is_premium`,
            orderIndex: sql`excluded.order_index`,
          },
        });

      const [{ id: roadmapId }] = await tx
        .select({ id: roadmaps.id })
        .from(roadmaps)
        .where(eq(roadmaps.slug, roadmap.slug));

      // Pass 1: upsert every node. Parents may not have a settled id until
      // every node in this roadmap has been upserted at least once — the
      // self-referencing parent_id FK is backfilled separately in Pass 2.
      const insertedNodes = nodeSeeds.length
        ? await tx
            .insert(roadmapNodes)
            .values(
              nodeSeeds.map((n) => ({
                roadmapId,
                slug: n.slug,
                title: n.title,
                description: n.description ?? "",
                nodeType: n.nodeType ?? "topic",
                isOptional: n.isOptional ?? false,
                positionX: n.positionX,
                positionY: n.positionY,
                orderIndex: n.orderIndex,
              })),
            )
            .onConflictDoUpdate({
              target: [roadmapNodes.roadmapId, roadmapNodes.slug],
              set: {
                title: sql`excluded.title`,
                description: sql`excluded.description`,
                nodeType: sql`excluded.node_type`,
                isOptional: sql`excluded.is_optional`,
                positionX: sql`excluded.position_x`,
                positionY: sql`excluded.position_y`,
                orderIndex: sql`excluded.order_index`,
                // Reset to NULL on every upsert, not just left alone — a node
                // that drops its parentSlug (promoted to a root) would
                // otherwise keep pointing at its old, stale parent, since
                // Pass 2 below only ever *sets* parentId, never clears it.
                parentId: null,
              },
            })
            .returning({ id: roadmapNodes.id, slug: roadmapNodes.slug })
        : [];
      const nodeIdBySlug = Object.fromEntries(insertedNodes.map((n) => [n.slug, n.id]));

      // Pass 2: backfill parentId for every retained/new node *before*
      // pruning below. Order matters here: a retained node whose
      // parentSlug changed (its old parent renamed/restructured, e.g. a
      // section split into two) still has its *old* parent_id pointing at
      // the now-stale parent until this runs. Pruning first would delete
      // that stale parent and, thanks to parent_id's ON DELETE CASCADE,
      // collaterally delete the retained child right along with it — the
      // child's id would still be sitting in nodeIdBySlug, causing an FK
      // violation on the Pass 3 link insert.
      for (const n of nodeSeeds) {
        if (!n.parentSlug) continue;
        const parentId = nodeIdBySlug[n.parentSlug];
        if (!parentId) {
          throw new Error(
            `[seed] Roadmap node "${n.slug}" references unknown parentSlug "${n.parentSlug}" in roadmap "${roadmap.slug}". Fix the seed before re-running.`,
          );
        }
        await tx
          .update(roadmapNodes)
          .set({ parentId })
          .where(eq(roadmapNodes.id, nodeIdBySlug[n.slug]));
      }

      // Prune nodes this roadmap no longer seeds (a topic removed from the
      // authored content) — cascades to their links/progress, scoped to
      // genuine removals. Runs after the parentId backfill above, not
      // before — see that pass's comment for why the order matters.
      const currentSlugs = nodeSeeds.map((n) => n.slug);
      await tx
        .delete(roadmapNodes)
        .where(
          currentSlugs.length
            ? and(eq(roadmapNodes.roadmapId, roadmapId), notInArray(roadmapNodes.slug, currentSlugs))
            : eq(roadmapNodes.roadmapId, roadmapId),
        );

      // Pass 3: links have no stable per-row key of their own (unlike nodes
      // now), so they're still cleared and rebuilt — scoped to this
      // roadmap's current node set, not a blanket delete across the table.
      const nodeIds = insertedNodes.map((n) => n.id);
      if (nodeIds.length) {
        await tx.delete(roadmapNodeLinks).where(inArray(roadmapNodeLinks.nodeId, nodeIds));
      }

      // RoadmapNodeLinkSeed is a discriminated union on linkType, so each
      // branch below has direct, non-optional access to its own field — no
      // `?.`/`??` guards for "is this field even provided," only the real
      // runtime check of "does this slug resolve to an actual DB row."
      const linkRows = nodeSeeds.flatMap((n) =>
        (n.links ?? []).map((link, i) => {
          const nodeId = nodeIdBySlug[n.slug];
          let conceptId: string | null = null;
          let challengeId: string | null = null;
          let collectionQuestionId: string | null = null;
          let externalTitle: string | null = null;
          let externalUrl: string | null = null;

          if (link.linkType === "learn-concept") {
            conceptId = conceptBySlug[link.conceptSlug] ?? null;
            if (!conceptId) {
              throw new Error(
                `[seed] Roadmap node "${n.slug}" links to unknown conceptSlug "${link.conceptSlug}". Fix the seed before re-running.`,
              );
            }
          } else if (link.linkType === "practice-challenge") {
            challengeId = challengeBySlug[link.challengeSlug] ?? null;
            if (!challengeId) {
              throw new Error(
                `[seed] Roadmap node "${n.slug}" links to unknown challengeSlug "${link.challengeSlug}". Fix the seed before re-running.`,
              );
            }
          } else if (link.linkType === "interview-question") {
            collectionQuestionId = collectionQuestionBySlug[link.collectionQuestionSlug] ?? null;
            if (!collectionQuestionId) {
              throw new Error(
                `[seed] Roadmap node "${n.slug}" links to unknown collectionQuestionSlug "${link.collectionQuestionSlug}". Fix the seed before re-running.`,
              );
            }
          } else {
            externalTitle = link.externalTitle;
            externalUrl = link.externalUrl;
          }

          return {
            nodeId,
            linkType: link.linkType,
            conceptId,
            challengeId,
            collectionQuestionId,
            externalTitle,
            externalUrl,
            orderIndex: i + 1,
          };
        }),
      );

      if (linkRows.length) {
        await tx.insert(roadmapNodeLinks).values(linkRows);
      }

      console.log(
        `[seed] Roadmap "${roadmap.slug}" upserted, ${insertedNodes.length} node(s) upserted, ${linkRows.length} link(s) rebuilt`,
      );
    });
  }

  console.log("[seed] Inserting study plans...");
  for (const plan of STUDY_PLANS) {
    const { items, ...planData } = plan;

    await db
      .insert(studyPlans)
      .values({ ...planData, isPremium: planData.isPremium ?? false })
      .onConflictDoUpdate({
        target: studyPlans.slug,
        set: {
          title: sql`excluded.title`,
          durationLabel: sql`excluded.duration_label`,
          hoursCommitment: sql`excluded.hours_commitment`,
          description: sql`excluded.description`,
          isPremium: sql`excluded.is_premium`,
          orderIndex: sql`excluded.order_index`,
        },
      });

    const [planRow] = await db
      .select({ id: studyPlans.id })
      .from(studyPlans)
      .where(sql`${studyPlans.slug} = ${plan.slug}`);
    if (!planRow) continue;

    // Items have no stable per-row key of their own (a plan's itinerary is
    // re-authored as a whole, not edited row-by-row) — delete and reinsert
    // fresh per plan rather than upserting on (study_plan_id, order_index),
    // which would leave stale trailing rows behind if an edit ever shrinks
    // a plan's item count.
    await db.delete(studyPlanItems).where(sql`${studyPlanItems.studyPlanId} = ${planRow.id}`);
    await db.insert(studyPlanItems).values(
      items.map((item, i) => ({
        studyPlanId: planRow.id,
        groupLabel: item.groupLabel,
        orderIndex: i + 1,
        itemType: item.itemType,
        refId: item.refId ?? null,
        href: item.href,
        title: item.title,
        description: item.description,
        rangeLabel: item.rangeLabel ?? null,
      })),
    );

    console.log(`[seed] Study plan "${plan.slug}" upserted, ${items.length} item(s) replaced`);
  }

  console.log("[seed] Inserting UI Battle challenges...");
  const insertedUiBattles = await db
    .insert(uiBattleChallenges)
    .values(
      UI_BATTLE_CHALLENGES.map((b) => ({
        ...b,
        targetJs: b.targetJs ?? "",
        starterJs: b.starterJs ?? "",
        solutionHtml: b.solutionHtml ?? "",
        solutionCss: b.solutionCss ?? "",
        solutionJs: b.solutionJs ?? "",
        isPremium: b.isPremium ?? false,
      })),
    )
    .onConflictDoUpdate({
      target: uiBattleChallenges.slug,
      set: {
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        difficulty: sql`excluded.difficulty`,
        targetImageUrl: sql`excluded.target_image_url`,
        targetWidth: sql`excluded.target_width`,
        targetHeight: sql`excluded.target_height`,
        targetHtml: sql`excluded.target_html`,
        targetCss: sql`excluded.target_css`,
        targetJs: sql`excluded.target_js`,
        starterHtml: sql`excluded.starter_html`,
        starterCss: sql`excluded.starter_css`,
        starterJs: sql`excluded.starter_js`,
        solutionHtml: sql`excluded.solution_html`,
        solutionCss: sql`excluded.solution_css`,
        solutionJs: sql`excluded.solution_js`,
        isPremium: sql`excluded.is_premium`,
        orderIndex: sql`excluded.order_index`,
      },
    })
    .returning({ slug: uiBattleChallenges.slug });
  console.log(`[seed] ${insertedUiBattles.length} UI Battle challenge(s) upserted`);

  console.log("[seed] Done.");
  await pool.end();
}

seed().catch((err) => {
  console.error("[seed] Fatal error:", err);
  pool.end();
  process.exit(1);
});
