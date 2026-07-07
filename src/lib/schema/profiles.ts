import { relations } from "drizzle-orm";
import { pgTable, text, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import {
  userConceptProgress,
  xpEvents,
  userChallengeSubmissions,
  userInterviewReviews,
  bookmarks,
} from "./user-data";

// `id` is `text`, not a Postgres `uuid` column, even though the value is always
// a uuid string — it must match `user.id`'s type (text) for the FK to be valid,
// same pattern as `session.userId`/`account.userId` in auth-schema.ts.
//
// .enableRLS() has no bearing on the app itself (the app's DATABASE_URL role
// has BYPASSRLS); it exists purely to block Supabase's auto-generated
// PostgREST API from reading/writing this table via the anon/authenticated
// roles. See security.md's RLS section.
export const profiles = pgTable("profiles", {
  id: text("id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  username: text("username").notNull().unique(),
  fullName: text("full_name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  xp: integer("xp").notNull().default(0),
  streakCurrent: integer("streak_current").notNull().default(0),
  streakLongest: integer("streak_longest").notNull().default(0),
  streakLastActivity: date("streak_last_activity"),
  isPremium: boolean("is_premium").notNull().default(false),
  premiumExpiresAt: timestamp("premium_expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}).enableRLS();

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(user, {
    fields: [profiles.id],
    references: [user.id],
  }),
  conceptProgress: many(userConceptProgress),
  xpEvents: many(xpEvents),
  challengeSubmissions: many(userChallengeSubmissions),
  interviewReviews: many(userInterviewReviews),
  bookmarks: many(bookmarks),
}));
