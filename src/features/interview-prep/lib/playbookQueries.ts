import { cache } from "react";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { playbookReads } from "@/lib/schema";
import { PLAYBOOK_SLUGS, type PlaybookSlug } from "@/lib/constants";
import { getAllChaptersForPlaybook } from "@/lib/playbookGuides";

export type PlaybookProgress = {
  playbookSlug: PlaybookSlug;
  chapterCount: number;
  readCount: number;
};

// Real chapter counts (filesystem, no DB row for the guides themselves) +
// real per-user read counts — same "honest, not mocked" precedent as
// getCollectionSummaries. Genuinely zero for logged-out visitors and for
// any playbook a user hasn't opened yet.
export const getPlaybookProgress = cache(
  async (userId: string | null): Promise<PlaybookProgress[]> => {
    const readCountByPlaybook = new Map<string, number>();

    if (userId) {
      const rows = await db
        .select({ playbookSlug: playbookReads.playbookSlug })
        .from(playbookReads)
        .where(eq(playbookReads.userId, userId));
      for (const row of rows) {
        readCountByPlaybook.set(row.playbookSlug, (readCountByPlaybook.get(row.playbookSlug) ?? 0) + 1);
      }
    }

    return PLAYBOOK_SLUGS.map((slug) => ({
      playbookSlug: slug,
      chapterCount: getAllChaptersForPlaybook(slug).length,
      readCount: readCountByPlaybook.get(slug) ?? 0,
    }));
  },
);

// The set of chapter slugs a user has already read within one playbook —
// drives both the index page's per-chapter checkmark and the chapter
// reader's initial "Mark as Read" button state.
export const getReadChapterSlugs = cache(
  async (userId: string | null, playbookSlug: string): Promise<Set<string>> => {
    if (!userId) return new Set();

    const rows = await db
      .select({ chapterSlug: playbookReads.chapterSlug })
      .from(playbookReads)
      .where(and(eq(playbookReads.userId, userId), eq(playbookReads.playbookSlug, playbookSlug)));

    return new Set(rows.map((row) => row.chapterSlug));
  },
);
