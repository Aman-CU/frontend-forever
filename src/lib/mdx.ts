import "server-only";
import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import type { ConceptCategory } from "@/lib/constants";

const CONCEPTS_DIR = path.join(process.cwd(), "content", "concepts");

// The 4 info-card fields shown at the bottom of the Understand tab. Authored in
// each concept's MDX frontmatter so the card structure stays identical across
// concepts (see Feature 22 decision).
export type ConceptFrontmatter = {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  order: number;
  whatsHappening: string;
  keyInsight: string;
  memoryHook: string;
  inRealLife: string;
};

export type ConceptContent = {
  frontmatter: ConceptFrontmatter;
  content: string;
};

// Reads a concept's MDX guide. Returns null when no file exists yet, so the
// Understand tab can show a "guide coming soon" state instead of throwing —
// only event-loop is authored in Feature 22.
export function getConceptContent(category: string, slug: string): ConceptContent | null {
  const filePath = path.join(CONCEPTS_DIR, category, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const source = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(source);
  return { frontmatter: data as ConceptFrontmatter, content };
}

// Walks every category subdirectory and returns { category, slug } pairs for the
// MDX files that exist — for future generateStaticParams (not wired yet).
export function getAllConceptSlugs(): { category: ConceptCategory; slug: string }[] {
  if (!fs.existsSync(CONCEPTS_DIR)) return [];

  return fs
    .readdirSync(CONCEPTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((dir) =>
      fs
        .readdirSync(path.join(CONCEPTS_DIR, dir.name))
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => ({
          category: dir.name as ConceptCategory,
          slug: file.replace(/\.mdx$/, ""),
        })),
    );
}
