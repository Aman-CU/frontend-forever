import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  jsonb,
  index,
  unique,
  check,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import {
  CONCEPT_CATEGORIES,
  CONCEPT_DIFFICULTIES,
  CHALLENGE_DIFFICULTIES,
  INTERVIEW_COLLECTIONS,
  COLLECTION_QUESTION_COLLECTIONS,
  STUDY_PLAN_SLUGS,
  STUDY_PLAN_ITEM_TYPES,
  ROADMAP_TYPES,
  ROADMAP_NODE_TYPES,
  ROADMAP_NODE_LINK_TYPES,
} from "@/lib/constants";

// Every table below is .enableRLS()'d — this has no bearing on the app itself
// (the app's DATABASE_URL role has BYPASSRLS); it exists purely to block
// Supabase's auto-generated PostgREST API from reading/writing these tables
// via the anon/authenticated roles. See security.md's RLS section.

// ── concepts ──────────────────────────────────────────────────────────────────

export const concepts = pgTable(
  "concepts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    difficulty: text("difficulty").notNull(),
    isPremium: boolean("is_premium").notNull().default(false),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("concepts_category_idx").on(table.category),
    check(
      "concepts_category_check",
      sql`${table.category} IN (${sql.join(
        CONCEPT_CATEGORIES.map((c) => sql.raw(`'${c}'`)),
        sql`, `,
      )})`,
    ),
    check(
      "concepts_difficulty_check",
      sql`${table.difficulty} IN (${sql.join(
        CONCEPT_DIFFICULTIES.map((d) => sql.raw(`'${d}'`)),
        sql`, `,
      )})`,
    ),
  ],
).enableRLS();

// ── challenges ────────────────────────────────────────────────────────────────

export const challenges = pgTable(
  "challenges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // nullable — some challenges are standalone, not linked to a concept
    conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "set null" }),
    // Practice's own topic tag (Feature 28) — set directly on standalone
    // Practice questions (no conceptId), since they don't inherit a category
    // via a concept join the way Learn's Challenge-tab challenges do.
    category: text("category"),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    difficulty: text("difficulty").notNull(),
    starterCode: text("starter_code").notNull().default(""),
    solutionCode: text("solution_code").notNull().default(""),
    // Array of { input: string; expected: string; label: string }
    testCases: jsonb("test_cases")
      .$type<{ input: string; expected: string; label: string }[]>()
      .notNull()
      .default([]),
    hints: text("hints").array().notNull().default([]),
    // Companies the challenge is attributed to (Practice's Company filter,
    // Feature 28) — same shape/precedent as interviewQuestions.companies below.
    companies: text("companies").array().notNull().default([]),
    // Admin/seed-curated YouTube walkthrough link (Feature 29's Solution tab).
    // Nullable — most challenges have no video yet; no user-submission path.
    videoUrl: text("video_url"),
    isPremium: boolean("is_premium").notNull().default(false),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("challenges_concept_id_idx").on(table.conceptId),
    index("challenges_difficulty_idx").on(table.difficulty),
    index("challenges_category_idx").on(table.category),
    check(
      "challenges_difficulty_check",
      sql`${table.difficulty} IN (${sql.join(
        CHALLENGE_DIFFICULTIES.map((d) => sql.raw(`'${d}'`)),
        sql`, `,
      )})`,
    ),
    // NULL passes any CHECK by SQL's three-valued logic, so this only
    // constrains rows that do set a category — no separate "OR IS NULL" needed.
    check(
      "challenges_category_check",
      sql`${table.category} IN (${sql.join(
        CONCEPT_CATEGORIES.map((c) => sql.raw(`'${c}'`)),
        sql`, `,
      )})`,
    ),
  ],
).enableRLS();

// ── interview_questions ───────────────────────────────────────────────────────

export const interviewQuestions = pgTable(
  "interview_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // nullable — some questions span multiple concepts
    conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "set null" }),
    collection: text("collection").notNull(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    difficulty: text("difficulty").notNull(),
    companies: text("companies").array().notNull().default([]),
    isPremium: boolean("is_premium").notNull().default(false),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("interview_questions_collection_idx").on(table.collection),
    index("interview_questions_concept_id_idx").on(table.conceptId),
    // Unique per (collection, order_index) — enables idempotent seeding and
    // ensures no two questions occupy the same slot within a collection.
    unique("interview_questions_collection_order_unique").on(
      table.collection,
      table.orderIndex,
    ),
    check(
      "interview_questions_collection_check",
      sql`${table.collection} IN (${sql.join(
        INTERVIEW_COLLECTIONS.map((c) => sql.raw(`'${c}'`)),
        sql`, `,
      )})`,
    ),
    check(
      "interview_questions_difficulty_check",
      sql`${table.difficulty} IN (${sql.join(
        CHALLENGE_DIFFICULTIES.map((d) => sql.raw(`'${d}'`)),
        sql`, `,
      )})`,
    ),
  ],
).enableRLS();

// ── collection_questions ──────────────────────────────────────────────────────
// Feature 30/31's Interview Prep collections (FF JavaScript/React/Next.js) —
// a new, dedicated table rather than a reuse of interview_questions above.
// interview_questions is concept-scoped (conceptId-linked, already live on
// Learn's Interview tabs); this feature's content is collection-scoped, not
// concept-scoped, and every attempt to force it into interview_questions'
// shape kept colliding with that table's existing "ff-75" collection value
// and concept-linking assumptions (see progress-tracker.md, Pre-Feature-30
// entry). "ff-75" isn't a collection value here — it's the isFf75 flag,
// since a question can't belong to two collections at once. "ff-system-design"
// isn't here at all — its content is long-form MDX guides (Feature 49), a
// different shape entirely.

export const collectionQuestions = pgTable(
  "collection_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collection: text("collection").notNull(),
    slug: text("slug").notNull().unique(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    difficulty: text("difficulty").notNull(),
    companies: text("companies").array().notNull().default([]),
    isFf75: boolean("is_ff75").notNull().default(false),
    isPremium: boolean("is_premium").notNull().default(false),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("collection_questions_collection_idx").on(table.collection),
    index("collection_questions_is_ff75_idx").on(table.isFf75),
    unique("collection_questions_collection_order_unique").on(
      table.collection,
      table.orderIndex,
    ),
    check(
      "collection_questions_collection_check",
      sql`${table.collection} IN (${sql.join(
        COLLECTION_QUESTION_COLLECTIONS.map((c) => sql.raw(`'${c}'`)),
        sql`, `,
      )})`,
    ),
    check(
      "collection_questions_difficulty_check",
      sql`${table.difficulty} IN (${sql.join(
        CHALLENGE_DIFFICULTIES.map((d) => sql.raw(`'${d}'`)),
        sql`, `,
      )})`,
    ),
  ],
).enableRLS();

// ── project_briefs ────────────────────────────────────────────────────────────
// Build tab content (Feature 26). Unlike challenges (nullable concept_id, some
// standalone), a project brief is always concept-linked — the Build tab only
// ever renders the one project tied to its concept. No hints/difficulty
// columns: build-plan.md's Build tab UI spec has no Hints panel and no
// difficulty badge (the concept's own difficulty already shows in the page
// header). solution_code *was* dropped for the same reason at first, then
// added back on explicit user request — someone stuck on the project needs
// somewhere to find the answer, same as Challenge's reference solution.

export const projectBriefs = pgTable(
  "project_briefs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    starterCode: text("starter_code").notNull().default(""),
    // Reference solution — always available once the project itself is visible
    // (no premium re-gate on top of the project-level one; no attempt-count
    // gate either, unlike Challenge's SolutionPanel, since Build has no
    // attempt-tracking concept — Mark Build Complete is self-reported).
    solutionCode: text("solution_code").notNull().default(""),
    // Array of { input, expected, label } — same shape as challenges.test_cases.
    // Informational only: Mark Build Complete is self-reported and never gated
    // on these passing (a real project's UI can't be exhaustively unit-tested).
    testCases: jsonb("test_cases")
      .$type<{ input: string; expected: string; label: string }[]>()
      .notNull()
      .default([]),
    isPremium: boolean("is_premium").notNull().default(false),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("project_briefs_concept_id_idx").on(table.conceptId)],
).enableRLS();

// ── roadmaps ──────────────────────────────────────────────────────────────────
// Rescoped pre-Feature-34 from a flat FF-concept-only sequence to a
// roadmap.sh-style node graph — see build-plan.md's Phase 7 rescoping note.
// roadmapType splits the /roadmaps list into Role-based (a full job-role
// path, e.g. "Frontend Developer", mixing internal FF links with external
// video/article links where FF has no lesson) vs Skill-based (a single
// technology deep dive that maps onto one CONCEPT_CATEGORIES value and is
// almost entirely internal-linked, e.g. "JavaScript", "CSS").

export const roadmaps = pgTable(
  "roadmaps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    roadmapType: text("roadmap_type").notNull().default("role"),
    isPremium: boolean("is_premium").notNull().default(false),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("roadmaps_roadmap_type_idx").on(table.roadmapType),
    check(
      "roadmaps_roadmap_type_check",
      sql`${table.roadmapType} IN (${sql.join(
        ROADMAP_TYPES.map((t) => sql.raw(`'${t}'`)),
        sql`, `,
      )})`,
    ),
  ],
).enableRLS();

// ── roadmap_nodes ─────────────────────────────────────────────────────────────
// One box on the canvas. parentId groups topics under a "section" header node
// (self-reference, one level deep — app code never nests a section under
// another section). positionX/Y are hand-authored canvas coordinates (same
// approach roadmap.sh's own source uses), not computed by a layout algorithm.
// A "section" node has no links of its own; only "topic" nodes do.

export const roadmapNodes = pgTable(
  "roadmap_nodes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roadmapId: uuid("roadmap_id")
      .notNull()
      .references(() => roadmaps.id, { onDelete: "cascade" }),
    // Self-referencing FK — callback form (AnyPgColumn) sidesteps the
    // temporal-dead-zone issue of referencing roadmapNodes.id before the
    // const it's defined in has finished initializing.
    parentId: uuid("parent_id").references((): AnyPgColumn => roadmapNodes.id, {
      onDelete: "cascade",
    }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    nodeType: text("node_type").notNull().default("topic"),
    isOptional: boolean("is_optional").notNull().default(false),
    positionX: integer("position_x").notNull().default(0),
    positionY: integer("position_y").notNull().default(0),
    orderIndex: integer("order_index").notNull().default(0),
  },
  (table) => [
    index("roadmap_nodes_roadmap_id_idx").on(table.roadmapId),
    index("roadmap_nodes_parent_id_idx").on(table.parentId),
    unique("roadmap_nodes_roadmap_slug_unique").on(table.roadmapId, table.slug),
    check(
      "roadmap_nodes_node_type_check",
      sql`${table.nodeType} IN (${sql.join(
        ROADMAP_NODE_TYPES.map((t) => sql.raw(`'${t}'`)),
        sql`, `,
      )})`,
    ),
  ],
).enableRLS();

// ── roadmap_node_links ────────────────────────────────────────────────────────
// What a topic node points at — deliberately many-per-node and mixed-type,
// not a single concept_id: a node like "Closures" can carry a Learn concept
// link, one or two Practice challenges, and a couple of FF Collections
// interview questions all at once (explicit user request — see build-plan.md).
// Exactly one of conceptId/challengeId/collectionQuestionId/externalUrl is
// set per row, chosen by linkType — enforced by a DB CHECK below, same
// "exactly one target" pattern as bookmarks_exactly_one_target_check.

export const roadmapNodeLinks = pgTable(
  "roadmap_node_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nodeId: uuid("node_id")
      .notNull()
      .references(() => roadmapNodes.id, { onDelete: "cascade" }),
    linkType: text("link_type").notNull(),
    conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "cascade" }),
    challengeId: uuid("challenge_id").references(() => challenges.id, { onDelete: "cascade" }),
    collectionQuestionId: uuid("collection_question_id").references(
      () => collectionQuestions.id,
      { onDelete: "cascade" },
    ),
    externalTitle: text("external_title"),
    externalUrl: text("external_url"),
    orderIndex: integer("order_index").notNull().default(0),
  },
  (table) => [
    index("roadmap_node_links_node_id_idx").on(table.nodeId),
    check(
      "roadmap_node_links_exactly_one_target_check",
      sql`(${table.conceptId} IS NOT NULL)::int + (${table.challengeId} IS NOT NULL)::int + (${table.collectionQuestionId} IS NOT NULL)::int + (${table.externalUrl} IS NOT NULL)::int = 1`,
    ),
    check(
      "roadmap_node_links_link_type_check",
      sql`${table.linkType} IN (${sql.join(
        ROADMAP_NODE_LINK_TYPES.map((t) => sql.raw(`'${t}'`)),
        sql`, `,
      )})`,
    ),
  ],
).enableRLS();

// ── study_plans ───────────────────────────────────────────────────────────────
// Feature 51's Lightning Prep. A plan is a curated itinerary across Learn,
// Practice, FF Collections, Playbook, and FF System Design — real DB rows
// (unlike Playbook/System Design's filesystem MDX), since the content here
// is a sequence of links + labels, not long-form prose.

export const studyPlans = pgTable(
  "study_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    durationLabel: text("duration_label").notNull(),
    hoursCommitment: text("hours_commitment").notNull(),
    description: text("description").notNull(),
    isPremium: boolean("is_premium").notNull().default(false),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check(
      "study_plans_slug_check",
      sql`${table.slug} IN (${sql.join(
        STUDY_PLAN_SLUGS.map((s) => sql.raw(`'${s}'`)),
        sql`, `,
      )})`,
    ),
  ],
).enableRLS();

// ── study_plan_items ─────────────────────────────────────────────────────────
// One itinerary entry. No foreign key to the content it points at — a day
// can bundle a whole collection ("FF 75 rapid review"), and Playbook/System
// Design content is filesystem-only with no row to reference — so items are
// hand-authored { groupLabel, href, title, description } entries instead.
// itemType + refId (a parseable slug composite, shape depends on itemType —
// e.g. "category/concept-slug" for "concept") exist only so the detail page
// can look up a live completion checkmark from that content's own real
// progress table where one exists (concept/challenge/playbook chapter);
// itemTypes with no per-user tracking (collection, system-design-guide,
// review-session, company-guide) simply render with no checkmark.

export const studyPlanItems = pgTable(
  "study_plan_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studyPlanId: uuid("study_plan_id")
      .notNull()
      .references(() => studyPlans.id, { onDelete: "cascade" }),
    groupLabel: text("group_label").notNull(),
    orderIndex: integer("order_index").notNull().default(0),
    itemType: text("item_type").notNull(),
    refId: text("ref_id"),
    href: text("href").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    // Premium-style "★ Q.01–Q.10" pill (StudyPlanItemRow) — the subset of a
    // linked collection/category to work through that day, so an item can
    // point at a whole 75-question collection without implying "do all 75
    // today." Nullable: only sensible on itemTypes with a numbered list page
    // (collection, practice-category); every other itemType leaves it null.
    rangeLabel: text("range_label"),
  },
  (table) => [
    index("study_plan_items_study_plan_id_idx").on(table.studyPlanId),
    unique("study_plan_items_plan_order_unique").on(table.studyPlanId, table.orderIndex),
    check(
      "study_plan_items_item_type_check",
      sql`${table.itemType} IN (${sql.join(
        STUDY_PLAN_ITEM_TYPES.map((t) => sql.raw(`'${t}'`)),
        sql`, `,
      )})`,
    ),
  ],
).enableRLS();

// ── relations ─────────────────────────────────────────────────────────────────

export const conceptsRelations = relations(concepts, ({ many }) => ({
  challenges: many(challenges),
  interviewQuestions: many(interviewQuestions),
  projectBriefs: many(projectBriefs),
  roadmapNodeLinks: many(roadmapNodeLinks),
}));

export const challengesRelations = relations(challenges, ({ one }) => ({
  concept: one(concepts, {
    fields: [challenges.conceptId],
    references: [concepts.id],
  }),
}));

export const projectBriefsRelations = relations(projectBriefs, ({ one }) => ({
  concept: one(concepts, {
    fields: [projectBriefs.conceptId],
    references: [concepts.id],
  }),
}));

export const interviewQuestionsRelations = relations(interviewQuestions, ({ one }) => ({
  concept: one(concepts, {
    fields: [interviewQuestions.conceptId],
    references: [concepts.id],
  }),
}));

export const roadmapsRelations = relations(roadmaps, ({ many }) => ({
  nodes: many(roadmapNodes),
}));

export const roadmapNodesRelations = relations(roadmapNodes, ({ one, many }) => ({
  roadmap: one(roadmaps, {
    fields: [roadmapNodes.roadmapId],
    references: [roadmaps.id],
  }),
  parent: one(roadmapNodes, {
    fields: [roadmapNodes.parentId],
    references: [roadmapNodes.id],
    relationName: "roadmapNodeChildren",
  }),
  children: many(roadmapNodes, { relationName: "roadmapNodeChildren" }),
  links: many(roadmapNodeLinks),
}));

export const roadmapNodeLinksRelations = relations(roadmapNodeLinks, ({ one }) => ({
  node: one(roadmapNodes, {
    fields: [roadmapNodeLinks.nodeId],
    references: [roadmapNodes.id],
  }),
  concept: one(concepts, {
    fields: [roadmapNodeLinks.conceptId],
    references: [concepts.id],
  }),
  challenge: one(challenges, {
    fields: [roadmapNodeLinks.challengeId],
    references: [challenges.id],
  }),
  collectionQuestion: one(collectionQuestions, {
    fields: [roadmapNodeLinks.collectionQuestionId],
    references: [collectionQuestions.id],
  }),
}));

export const studyPlansRelations = relations(studyPlans, ({ many }) => ({
  items: many(studyPlanItems),
}));

export const studyPlanItemsRelations = relations(studyPlanItems, ({ one }) => ({
  studyPlan: one(studyPlans, {
    fields: [studyPlanItems.studyPlanId],
    references: [studyPlans.id],
  }),
}));
