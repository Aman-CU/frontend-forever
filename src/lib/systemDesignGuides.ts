import "server-only";
import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import type { ChallengeDifficulty } from "@/lib/constants";

// Feature 49's content lives as MDX files in the repo, not DB rows — same
// architecture as lib/mdx.ts's concept guides, appropriate for long-form
// structured content with diagrams (build-plan.md, Feature 49 spec).
const GUIDES_DIR = path.join(process.cwd(), "content", "interview-prep", "system-design");

export type SystemDesignGuideFrontmatter = {
  title: string;
  slug: string;
  // Draft section grouping from build-plan.md, to finalize once the full
  // topic list exists — currently just whatever string each guide's
  // frontmatter declares, grouped dynamically on the list page.
  section: string;
  difficulty: ChallengeDifficulty;
  // The answer-first summary sentence shown on the list page and used for
  // <meta description>/JSON-LD — same GEO/SEO rule as Feature 31.
  summary: string;
  orderIndex: number;
  datePublished: string;
  dateModified: string;
  companies?: string[];
};

export type SystemDesignGuide = {
  frontmatter: SystemDesignGuideFrontmatter;
  content: string;
};

// slug comes from the URL — resolve and confirm the path stays inside
// GUIDES_DIR so a crafted slug (e.g. "../../etc/passwd") can't escape it,
// same guard as lib/mdx.ts's getConceptContent.
function resolveGuidePath(slug: string): string | null {
  const baseDir = path.resolve(GUIDES_DIR);
  const filePath = path.resolve(baseDir, `${slug}.mdx`);
  if (!filePath.startsWith(baseDir + path.sep)) return null;
  return filePath;
}

export function getSystemDesignGuide(slug: string): SystemDesignGuide | null {
  const filePath = resolveGuidePath(slug);
  if (!filePath || !fs.existsSync(filePath)) return null;

  const source = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(source);
  return { frontmatter: data as SystemDesignGuideFrontmatter, content };
}

export function getAllSystemDesignGuides(): SystemDesignGuide[] {
  if (!fs.existsSync(GUIDES_DIR)) return [];

  return fs
    .readdirSync(GUIDES_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const source = fs.readFileSync(path.join(GUIDES_DIR, file), "utf-8");
      const { data, content } = matter(source);
      return { frontmatter: data as SystemDesignGuideFrontmatter, content };
    })
    .sort((a, b) => a.frontmatter.orderIndex - b.frontmatter.orderIndex);
}

export type SystemDesignGuideNavItem = { slug: string; title: string };

export function getAdjacentSystemDesignGuides(slug: string): {
  prev: SystemDesignGuideNavItem | null;
  next: SystemDesignGuideNavItem | null;
} {
  const all = getAllSystemDesignGuides();
  const index = all.findIndex((guide) => guide.frontmatter.slug === slug);
  if (index === -1) return { prev: null, next: null };

  const prev = index > 0 ? all[index - 1] : null;
  const next = index < all.length - 1 ? all[index + 1] : null;

  return {
    prev: prev ? { slug: prev.frontmatter.slug, title: prev.frontmatter.title } : null,
    next: next ? { slug: next.frontmatter.slug, title: next.frontmatter.title } : null,
  };
}
