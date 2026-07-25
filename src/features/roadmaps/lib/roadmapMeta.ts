import { Briefcase } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ConceptCategory } from "@/lib/constants";
import { CATEGORY_META, type ColorKey } from "@/features/learn/lib/categoryMeta";

export type RoadmapMeta = {
  icon: LucideIcon;
  colorKey: ColorKey;
  badge?: string;
  badgeStyle?: { bg: string; text: string };
};

// Skill-based roadmap slugs map onto the matching Learn category, reusing
// its existing icon/color/badge rather than inventing a second palette for
// the same technology. Role-based roadmaps (currently just
// "frontend-developer") fall through to the default below.
const SKILL_ROADMAP_CATEGORY: Record<string, ConceptCategory> = {
  javascript: "javascript-runtime",
  css: "css",
  react: "react",
  typescript: "typescript",
};

const DEFAULT_ROLE_META: RoadmapMeta = { icon: Briefcase, colorKey: "accent" };

export function getRoadmapMeta(slug: string): RoadmapMeta {
  const category = SKILL_ROADMAP_CATEGORY[slug];
  if (!category) return DEFAULT_ROLE_META;

  const { icon, colorKey, badge, badgeStyle } = CATEGORY_META[category];
  return { icon, colorKey, badge, badgeStyle };
}
