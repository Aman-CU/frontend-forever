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
// scoring in v1 — the editor renders starter code as live output next to a
// static reference image, compared visually (Slide & Compare / Diff toggle),
// not pixel-diffed. targetWidth/targetHeight size both panes identically so
// the comparison lines up; not hardcoded to one dimension since challenges
// can vary. No user-submission/progress table yet — nothing to grade against.

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
    starterHtml: text("starter_html").notNull().default(""),
    starterCss: text("starter_css").notNull().default(""),
    starterJs: text("starter_js").notNull().default(""),
    isPremium: boolean("is_premium").notNull().default(false),
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
