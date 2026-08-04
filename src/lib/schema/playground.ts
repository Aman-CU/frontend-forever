import { sql } from "drizzle-orm";
import { pgTable, text, integer, boolean, timestamp, uuid, check } from "drizzle-orm/pg-core";

import { CHALLENGE_DIFFICULTIES } from "@/lib/constants";

// Every table below is .enableRLS()'d — this has no bearing on the app itself
// (the app's DATABASE_URL role has BYPASSRLS); it exists purely to block
// Supabase's auto-generated PostgREST API from reading/writing these tables
// via the anon/authenticated roles. See security.md's RLS section.

// ── ui_battle_challenges ─────────────────────────────────────────────────────
// Feature 52's Playground → UI Battles. A CSSBattle-style recreate-the-target
// challenge: vanilla HTML/CSS/JS only (no React runtime in the editor), no
// scoring in v1 — the editor renders the user's live output next to the
// target rendered live too (Feature 53: both sides are real srcDoc iframes,
// not a static image vs. a live pane), compared visually (Slide & Compare /
// Diff toggle), not pixel-diffed. targetImageUrl/targetWidth/targetHeight
// remain for the list page's thumbnail (a one-time screenshot of the target
// source, so the thumbnail and the live target pane are the same content,
// not two separately-authored assets). No user-submission/progress table
// yet — nothing to grade against.
//
// solutionHtml/solutionCss/solutionJs (Feature 53 follow-up): a genuinely
// separate asset from targetHtml/Css/Js, not a re-gate of the same content.
// The target is always shipped to every viewer (it's the live comparison
// pane every user needs, free or paid), so gating it would be security
// theater — the source is already in the page's HTML. The official solution
// is real, server-side-gated premium content: stripped to "" before the page
// ever serializes props to the client when the viewer isn't premium, same
// "never client-side only" pattern as ConceptInterview/QuestionCard's answer
// redaction. Gate is the viewer's own premium status (profiles.isPremium),
// independent of this row's own isPremium flag (that one's still the
// cosmetic Feature-38 seam for the whole challenge/card).

export const uiBattleChallenges = pgTable(
  "ui_battle_challenges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    difficulty: text("difficulty").notNull(),
    targetImageUrl: text("target_image_url").notNull(),
    targetWidth: integer("target_width").notNull(),
    targetHeight: integer("target_height").notNull(),
    targetHtml: text("target_html").notNull().default(""),
    targetCss: text("target_css").notNull().default(""),
    targetJs: text("target_js").notNull().default(""),
    starterHtml: text("starter_html").notNull().default(""),
    starterCss: text("starter_css").notNull().default(""),
    starterJs: text("starter_js").notNull().default(""),
    solutionHtml: text("solution_html").notNull().default(""),
    solutionCss: text("solution_css").notNull().default(""),
    solutionJs: text("solution_js").notNull().default(""),
    isPremium: boolean("is_premium").notNull().default(false),
    // Feature 38: a small hand-picked flagship set of free (Easy, non-premium)
    // challenges also gets a free solution — everything else's solution stays
    // gated on the viewer's own premium status regardless of the challenge's
    // own isPremium. Meaningless (ignored) on a challenge where isPremium is
    // true — the whole challenge is locked before solution visibility is ever
    // considered.
    isSolutionFree: boolean("is_solution_free").notNull().default(false),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check(
      "ui_battle_challenges_difficulty_check",
      sql`${table.difficulty} IN (${sql.join(
        CHALLENGE_DIFFICULTIES.map((d) => sql.raw(`'${d}'`)),
        sql`, `,
      )})`,
    ),
  ],
).enableRLS();
