import "server-only";
import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import type { PlaybookSlug } from "@/lib/constants";

// Feature 50's content lives as MDX files in the repo, one directory per
// playbook — same architecture as lib/systemDesignGuides.ts (Feature 49),
// appropriate for long-form structured content, no DB table.
const PLAYBOOK_ROOT = path.join(process.cwd(), "content", "interview-prep", "playbook");

export type PlaybookChapterFrontmatter = {
  title: string;
  slug: string;
  playbookSlug: PlaybookSlug;
  orderIndex: number;
  // Answer-first summary sentence — shown on the index page and used for
  // <meta description>/JSON-LD, same GEO/SEO rule as Features 31/49.
  summary: string;
  datePublished: string;
  dateModified: string;
};

export type PlaybookChapter = {
  frontmatter: PlaybookChapterFrontmatter;
  content: string;
};

// playbookSlug/chapterSlug both come from the URL — resolve and confirm the
// final path stays inside PLAYBOOK_ROOT so a crafted slug can't escape it,
// same guard as lib/mdx.ts's getConceptContent / systemDesignGuides.ts.
function resolveChapterPath(playbookSlug: string, chapterSlug: string): string | null {
  const baseDir = path.resolve(PLAYBOOK_ROOT);
  const filePath = path.resolve(baseDir, playbookSlug, `${chapterSlug}.mdx`);
  if (!filePath.startsWith(baseDir + path.sep)) return null;
  return filePath;
}

export function getPlaybookChapter(
  playbookSlug: string,
  chapterSlug: string,
): PlaybookChapter | null {
  const filePath = resolveChapterPath(playbookSlug, chapterSlug);
  if (!filePath || !fs.existsSync(filePath)) return null;

  const source = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(source);
  return { frontmatter: data as PlaybookChapterFrontmatter, content };
}

export function getAllChaptersForPlaybook(playbookSlug: string): PlaybookChapter[] {
  const baseDir = path.resolve(PLAYBOOK_ROOT);
  const dir = path.resolve(baseDir, playbookSlug);
  if (!dir.startsWith(baseDir + path.sep) || !fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const source = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data, content } = matter(source);
      return { frontmatter: data as PlaybookChapterFrontmatter, content };
    })
    .sort((a, b) => a.frontmatter.orderIndex - b.frontmatter.orderIndex);
}

export type PlaybookChapterNavItem = { slug: string; title: string };

export function getAdjacentPlaybookChapters(
  playbookSlug: string,
  chapterSlug: string,
): { prev: PlaybookChapterNavItem | null; next: PlaybookChapterNavItem | null } {
  const all = getAllChaptersForPlaybook(playbookSlug);
  const index = all.findIndex((chapter) => chapter.frontmatter.slug === chapterSlug);
  if (index === -1) return { prev: null, next: null };

  const prev = index > 0 ? all[index - 1] : null;
  const next = index < all.length - 1 ? all[index + 1] : null;

  return {
    prev: prev ? { slug: prev.frontmatter.slug, title: prev.frontmatter.title } : null,
    next: next ? { slug: next.frontmatter.slug, title: next.frontmatter.title } : null,
  };
}
