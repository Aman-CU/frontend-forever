import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  real,
  index,
  unique,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { XP_EVENT_TYPES, CHALLENGE_STATUSES, PLAYBOOK_SLUGS } from "@/lib/constants";
import { profiles } from "./profiles";
import {
  concepts,
  challenges,
  interviewQuestions,
  collectionQuestions,
  roadmapNodes,
} from "./content";

// Every table below is .enableRLS()'d — this has no bearing on the app itself
// (the app's DATABASE_URL role has BYPASSRLS); it exists purely to block
// Supabase's auto-generated PostgREST API from reading/writing these tables
// via the anon/authenticated roles. See security.md's RLS section.

// ── user_concept_progress ─────────────────────────────────────────────────────

export const userConceptProgress = pgTable(
  "user_concept_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    understandCompleted: boolean("understand_completed").notNull().default(false),
    simulateCompleted: boolean("simulate_completed").notNull().default(false),
    challengeCompleted: boolean("challenge_completed").notNull().default(false),
    interviewCompleted: boolean("interview_completed").notNull().default(false),
    buildCompleted: boolean("build_completed").notNull().default(false),
    fullyCompleted: boolean("fully_completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("ucp_user_concept_unique").on(table.userId, table.conceptId),
    index("ucp_user_id_idx").on(table.userId),
  ],
).enableRLS();

// ── xp_events ─────────────────────────────────────────────────────────────────

export const xpEvents = pgTable(
  "xp_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    // nullable — not every event is tied to a single concept/challenge/question
    conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "set null" }),
    challengeId: uuid("challenge_id").references(() => challenges.id, {
      onDelete: "set null",
    }),
    questionId: uuid("question_id").references(() => interviewQuestions.id, {
      onDelete: "set null",
    }),
    eventType: text("event_type").notNull(),
    xpAmount: integer("xp_amount").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("xp_events_user_id_idx").on(table.userId),
    index("xp_events_created_at_idx").on(table.createdAt),
    // Feature 36's Leaderboard: getUserRank's Week/Month path filters by
    // both userId and createdAt in one query (a user's own range-scoped XP
    // sum) — the composite serves that directly, rather than relying on the
    // planner to bitmap-AND the two single-column indexes above.
    index("xp_events_user_id_created_at_idx").on(table.userId, table.createdAt),
    check(
      "xp_events_event_type_check",
      sql`${table.eventType} IN (${sql.join(
        XP_EVENT_TYPES.map((t) => sql.raw(`'${t}'`)),
        sql`, `,
      )})`,
    ),
  ],
).enableRLS();

// ── user_challenge_submissions ────────────────────────────────────────────────
// No unique constraint — multiple submissions per (user, challenge) are expected.

export const userChallengeSubmissions = pgTable(
  "user_challenge_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    challengeId: uuid("challenge_id")
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    code: text("code").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("ucs_user_id_idx").on(table.userId),
    index("ucs_challenge_id_idx").on(table.challengeId),
    check(
      "ucs_status_check",
      sql`${table.status} IN (${sql.join(
        CHALLENGE_STATUSES.map((s) => sql.raw(`'${s}'`)),
        sql`, `,
      )})`,
    ),
  ],
).enableRLS();

// ── challenge_discussion_posts ────────────────────────────────────────────────
// Feature 29's Discussion tab — one unified table for both freeform comments
// and shared solutions (a post with a non-null `code` reads as a shared
// solution; a post with none is a plain comment). Flat, one-level replies
// only: parentId is null for a top-level post, or points at a top-level
// post's id for a reply — app code never lets a reply itself be replied to,
// so parentId never chains more than one level deep. Open to every viewer,
// logged in or not, solved or not (no spoiler gate — user decision).

export const challengeDiscussionPosts = pgTable(
  "challenge_discussion_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    challengeId: uuid("challenge_id")
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"),
    title: text("title"),
    body: text("body").notNull(),
    code: text("code"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("cdp_challenge_id_idx").on(table.challengeId),
    index("cdp_parent_id_idx").on(table.parentId),
  ],
).enableRLS();

// ── user_interview_reviews ────────────────────────────────────────────────────

export const userInterviewReviews = pgTable(
  "user_interview_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => interviewQuestions.id, { onDelete: "cascade" }),
    // SM-2 algorithm fields
    easeFactor: real("ease_factor").notNull().default(2.5),
    intervalDays: integer("interval_days").notNull().default(1),
    repetitions: integer("repetitions").notNull().default(0),
    quality: integer("quality").notNull().default(0),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
  },
  (table) => [
    unique("uir_user_question_unique").on(table.userId, table.questionId),
    index("uir_user_id_idx").on(table.userId),
    index("uir_next_review_idx").on(table.nextReviewAt),
  ],
).enableRLS();

// ── bookmarks ─────────────────────────────────────────────────────────────────
// Each row targets exactly one entity (concept, question, or challenge).
// Partial unique indexes enforce one bookmark per (user, entity).

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "cascade" }),
    questionId: uuid("question_id").references(() => interviewQuestions.id, {
      onDelete: "cascade",
    }),
    challengeId: uuid("challenge_id").references(() => challenges.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("bookmarks_user_id_idx").on(table.userId),
    uniqueIndex("bookmarks_user_concept_unique")
      .on(table.userId, table.conceptId)
      .where(sql`${table.conceptId} IS NOT NULL`),
    uniqueIndex("bookmarks_user_question_unique")
      .on(table.userId, table.questionId)
      .where(sql`${table.questionId} IS NOT NULL`),
    uniqueIndex("bookmarks_user_challenge_unique")
      .on(table.userId, table.challengeId)
      .where(sql`${table.challengeId} IS NOT NULL`),
    check(
      "bookmarks_exactly_one_target_check",
      sql`(${table.conceptId} IS NOT NULL)::int + (${table.questionId} IS NOT NULL)::int + (${table.challengeId} IS NOT NULL)::int = 1`,
    ),
  ],
).enableRLS();

// ── playbook_reads ────────────────────────────────────────────────────────────
// Feature 50's per-chapter read-tracking, written by an explicit "Mark as
// Read" button (same precedent as understand_completed's own button, not an
// auto-mark-on-visit). Content itself is filesystem MDX (lib/playbookGuides.ts,
// no DB table for the guides), so this only tracks the (user, chapter) read
// state that drives the "X/N articles read" progress bar. chapterSlug is
// only unique within a playbook, not globally, hence the 3-column unique.

export const playbookReads = pgTable(
  "playbook_reads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    playbookSlug: text("playbook_slug").notNull(),
    chapterSlug: text("chapter_slug").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("playbook_reads_user_chapter_unique").on(
      table.userId,
      table.playbookSlug,
      table.chapterSlug,
    ),
    index("playbook_reads_user_id_idx").on(table.userId),
    check(
      "playbook_reads_playbook_slug_check",
      sql`${table.playbookSlug} IN (${sql.join(
        PLAYBOOK_SLUGS.map((s) => sql.raw(`'${s}'`)),
        sql`, `,
      )})`,
    ),
  ],
).enableRLS();

// ── user_collection_question_progress ─────────────────────────────────────────
// FF Collections' (FF 75/JavaScript/React/Next.js) per-question "I've already
// read this" tracker — self-reported, no grading, no XP (matching
// playbook_reads' precedent above, not user_concept_progress's XP-earning
// one). Unlike playbook_reads, this toggles both ways (tick and untick), so
// row presence alone means "completed" — the API route inserts on tick and
// deletes on untick, rather than writing a boolean column.

export const userCollectionQuestionProgress = pgTable(
  "user_collection_question_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => collectionQuestions.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("user_collection_question_progress_user_question_unique").on(
      table.userId,
      table.questionId,
    ),
    index("user_collection_question_progress_user_id_idx").on(table.userId),
  ],
).enableRLS();

// ── user_roadmap_node_progress ────────────────────────────────────────────────
// Feature 35's manual "Mark as done" toggle — but only ever written for
// external-link roadmap_nodes (Learn-linked nodes derive their completed
// state from user_concept_progress instead, since that's real signal and
// this table would just duplicate it). Same insert-on-tick/delete-on-untick
// shape as user_collection_question_progress above: row presence means
// done. No XP — Feature 32's spaced-repetition XP-farming bug is exactly the
// class of mistake this is avoiding by not attaching a reward to a
// self-reported, unverifiable-completion action.

export const userRoadmapNodeProgress = pgTable(
  "user_roadmap_node_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    nodeId: uuid("node_id")
      .notNull()
      .references(() => roadmapNodes.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("user_roadmap_node_progress_user_node_unique").on(table.userId, table.nodeId),
    index("user_roadmap_node_progress_user_id_idx").on(table.userId),
  ],
).enableRLS();

// ── relations ─────────────────────────────────────────────────────────────────

export const userConceptProgressRelations = relations(userConceptProgress, ({ one }) => ({
  profile: one(profiles, {
    fields: [userConceptProgress.userId],
    references: [profiles.id],
  }),
  concept: one(concepts, {
    fields: [userConceptProgress.conceptId],
    references: [concepts.id],
  }),
}));

export const xpEventsRelations = relations(xpEvents, ({ one }) => ({
  profile: one(profiles, {
    fields: [xpEvents.userId],
    references: [profiles.id],
  }),
  concept: one(concepts, {
    fields: [xpEvents.conceptId],
    references: [concepts.id],
  }),
  challenge: one(challenges, {
    fields: [xpEvents.challengeId],
    references: [challenges.id],
  }),
  question: one(interviewQuestions, {
    fields: [xpEvents.questionId],
    references: [interviewQuestions.id],
  }),
}));

export const userChallengeSubmissionsRelations = relations(
  userChallengeSubmissions,
  ({ one }) => ({
    profile: one(profiles, {
      fields: [userChallengeSubmissions.userId],
      references: [profiles.id],
    }),
    challenge: one(challenges, {
      fields: [userChallengeSubmissions.challengeId],
      references: [challenges.id],
    }),
  }),
);

export const challengeDiscussionPostsRelations = relations(
  challengeDiscussionPosts,
  ({ one }) => ({
    profile: one(profiles, {
      fields: [challengeDiscussionPosts.userId],
      references: [profiles.id],
    }),
    challenge: one(challenges, {
      fields: [challengeDiscussionPosts.challengeId],
      references: [challenges.id],
    }),
  }),
);

export const userInterviewReviewsRelations = relations(userInterviewReviews, ({ one }) => ({
  profile: one(profiles, {
    fields: [userInterviewReviews.userId],
    references: [profiles.id],
  }),
  question: one(interviewQuestions, {
    fields: [userInterviewReviews.questionId],
    references: [interviewQuestions.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  profile: one(profiles, {
    fields: [bookmarks.userId],
    references: [profiles.id],
  }),
  concept: one(concepts, {
    fields: [bookmarks.conceptId],
    references: [concepts.id],
  }),
  question: one(interviewQuestions, {
    fields: [bookmarks.questionId],
    references: [interviewQuestions.id],
  }),
  challenge: one(challenges, {
    fields: [bookmarks.challengeId],
    references: [challenges.id],
  }),
}));

export const playbookReadsRelations = relations(playbookReads, ({ one }) => ({
  profile: one(profiles, {
    fields: [playbookReads.userId],
    references: [profiles.id],
  }),
}));

export const userRoadmapNodeProgressRelations = relations(userRoadmapNodeProgress, ({ one }) => ({
  profile: one(profiles, {
    fields: [userRoadmapNodeProgress.userId],
    references: [profiles.id],
  }),
  node: one(roadmapNodes, {
    fields: [userRoadmapNodeProgress.nodeId],
    references: [roadmapNodes.id],
  }),
}));
