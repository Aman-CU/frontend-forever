import { relations } from "drizzle-orm";
import { pgTable, text, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// `id` is `text`, not a Postgres `uuid` column, even though the value is always
// a uuid string — it must match `user.id`'s type (text) for the FK to be valid,
// same pattern as `session.userId`/`account.userId` in auth-schema.ts.
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
  premiumExpiresAt: timestamp("premium_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(user, {
    fields: [profiles.id],
    references: [user.id],
  }),
}));
