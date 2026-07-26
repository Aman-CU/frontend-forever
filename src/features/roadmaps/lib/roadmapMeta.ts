import type { ComponentType } from "react";
import { Code2 } from "lucide-react";

import { JavascriptIcon } from "@/components/shared/devicons/JavascriptIcon";
import { Css3Icon } from "@/components/shared/devicons/Css3Icon";
import { ReactIcon } from "@/components/shared/devicons/ReactIcon";
import { TypescriptIcon } from "@/components/shared/devicons/TypescriptIcon";

export type RoadmapMeta = {
  icon: ComponentType<{ className?: string }>;
};

// Real devicon.dev marks (see components/shared/devicons/*), not generic
// lucide icons — direct user request, so every roadmap card icon is
// instantly recognizable as its actual technology rather than an
// approximation (Zap for JS, Atom for React, etc.). Each skill roadmap
// slug maps onto its matching language/framework mark. "frontend-developer"
// (a role, not one technology — the HTML5 devicon tried here first read as
// "this is an HTML roadmap," which it isn't) uses lucide's Code2 (the "</>"
// glyph) instead, same fallback for any future roadmap slug with no
// specific devicon of its own — a generic "code" symbol reads correctly for
// a role, where a specific language/framework mark would overclaim.
const ROADMAP_ICON: Record<string, ComponentType<{ className?: string }>> = {
  javascript: JavascriptIcon,
  css: Css3Icon,
  react: ReactIcon,
  typescript: TypescriptIcon,
};

const DEFAULT_ICON = Code2;

export function getRoadmapMeta(slug: string): RoadmapMeta {
  return { icon: ROADMAP_ICON[slug] ?? DEFAULT_ICON };
}
