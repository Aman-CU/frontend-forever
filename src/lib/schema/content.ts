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
} from "drizzle-orm/pg-core";
import {
  CONCEPT_CATEGORIES,
  CONCEPT_DIFFICULTIES,
  CHALLENGE_DIFFICULTIES,
  INTERVIEW_COLLECTIONS,
} from "@/lib/constants";

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
);

// ── challenges ────────────────────────────────────────────────────────────────

export const challenges = pgTable(
  "challenges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // nullable — some challenges are standalone, not linked to a concept
    conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "set null" }),
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
    isPremium: boolean("is_premium").notNull().default(false),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("challenges_concept_id_idx").on(table.conceptId),
    index("challenges_difficulty_idx").on(table.difficulty),
    check(
      "challenges_difficulty_check",
      sql`${table.difficulty} IN (${sql.join(
        CHALLENGE_DIFFICULTIES.map((d) => sql.raw(`'${d}'`)),
        sql`, `,
      )})`,
    ),
  ],
);

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
);

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
);

// ── roadmaps ──────────────────────────────────────────────────────────────────

export const roadmaps = pgTable("roadmaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  isPremium: boolean("is_premium").notNull().default(false),
  orderIndex: integer("order_index").notNull().default(0),
});

// ── roadmap_steps ─────────────────────────────────────────────────────────────

export const roadmapSteps = pgTable(
  "roadmap_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roadmapId: uuid("roadmap_id")
      .notNull()
      .references(() => roadmaps.id, { onDelete: "cascade" }),
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    orderIndex: integer("order_index").notNull().default(0),
    isOptional: boolean("is_optional").notNull().default(false),
  },
  (table) => [
    index("roadmap_steps_roadmap_id_idx").on(table.roadmapId),
    unique("roadmap_steps_roadmap_order_unique").on(table.roadmapId, table.orderIndex),
  ],
);

// ── relations ─────────────────────────────────────────────────────────────────

export const conceptsRelations = relations(concepts, ({ many }) => ({
  challenges: many(challenges),
  interviewQuestions: many(interviewQuestions),
  projectBriefs: many(projectBriefs),
  roadmapSteps: many(roadmapSteps),
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
  steps: many(roadmapSteps),
}));

export const roadmapStepsRelations = relations(roadmapSteps, ({ one }) => ({
  roadmap: one(roadmaps, {
    fields: [roadmapSteps.roadmapId],
    references: [roadmaps.id],
  }),
  concept: one(concepts, {
    fields: [roadmapSteps.conceptId],
    references: [concepts.id],
  }),
}));
