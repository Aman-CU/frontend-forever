import { cache } from "react";
import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { challengeDiscussionPosts, profiles } from "@/lib/schema";

export type DiscussionAuthor = {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
};

export type DiscussionReply = {
  id: string;
  body: string;
  code: string | null;
  createdAt: string;
  author: DiscussionAuthor;
};

export type DiscussionPost = DiscussionReply & {
  title: string | null;
  replies: DiscussionReply[];
};

// Live, per-request dedupe — this is user-generated content, never
// unstable_cache'd (unlike the static challenge catalog). Flat, one-level
// replies only: a single query gets every post + reply for the challenge,
// then splits by parentId in memory (parentId null = top-level post).
export const getDiscussionPosts = cache(
  async (challengeId: string): Promise<DiscussionPost[]> => {
    const rows = await db
      .select({
        id: challengeDiscussionPosts.id,
        parentId: challengeDiscussionPosts.parentId,
        title: challengeDiscussionPosts.title,
        body: challengeDiscussionPosts.body,
        code: challengeDiscussionPosts.code,
        createdAt: challengeDiscussionPosts.createdAt,
        authorId: profiles.id,
        username: profiles.username,
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
      })
      .from(challengeDiscussionPosts)
      .innerJoin(profiles, eq(challengeDiscussionPosts.userId, profiles.id))
      .where(eq(challengeDiscussionPosts.challengeId, challengeId))
      .orderBy(desc(challengeDiscussionPosts.createdAt));

    const posts = new Map<string, DiscussionPost>();
    const repliesByParent = new Map<string, DiscussionReply[]>();

    for (const row of rows) {
      const author: DiscussionAuthor = {
        id: row.authorId,
        username: row.username,
        fullName: row.fullName,
        avatarUrl: row.avatarUrl,
      };
      const base: DiscussionReply = {
        id: row.id,
        body: row.body,
        code: row.code,
        createdAt: row.createdAt.toISOString(),
        author,
      };

      if (row.parentId === null) {
        posts.set(row.id, { ...base, title: row.title, replies: [] });
      } else {
        const list = repliesByParent.get(row.parentId) ?? [];
        list.push(base);
        repliesByParent.set(row.parentId, list);
      }
    }

    // Replies read oldest-first within a post (a conversation, not a feed);
    // top-level posts stay newest-first, matching the query's own ORDER BY.
    for (const [parentId, replies] of repliesByParent) {
      const post = posts.get(parentId);
      if (post) {
        post.replies = replies.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      }
    }

    return [...posts.values()];
  },
);
