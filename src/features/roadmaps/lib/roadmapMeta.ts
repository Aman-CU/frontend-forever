import type { ComponentType } from "react";

import { JavascriptIcon } from "@/components/shared/devicons/JavascriptIcon";
import { Css3Icon } from "@/components/shared/devicons/Css3Icon";
import { ReactIcon } from "@/components/shared/devicons/ReactIcon";
import { TypescriptIcon } from "@/components/shared/devicons/TypescriptIcon";
import { Html5Icon } from "@/components/shared/devicons/Html5Icon";

export type RoadmapMeta = {
  icon: ComponentType<{ className?: string }>;
};

// Real devicon.dev marks (see components/shared/devicons/*), not generic
// lucide icons — direct user request, so every roadmap card icon is
// instantly recognizable as its actual technology rather than an
// approximation (Zap for JS, Atom for React, etc.). Each skill roadmap
// slug maps onto its matching language/framework mark; "frontend-developer"
// (a role, not one technology) uses HTML5 as the closest devicon has to a
// general "frontend" mark, same fallback for any future roadmap slug with
// no specific icon of its own.
const ROADMAP_ICON: Record<string, ComponentType<{ className?: string }>> = {
  javascript: JavascriptIcon,
  css: Css3Icon,
  react: ReactIcon,
  typescript: TypescriptIcon,
};

const DEFAULT_ICON = Html5Icon;

export function getRoadmapMeta(slug: string): RoadmapMeta {
  return { icon: ROADMAP_ICON[slug] ?? DEFAULT_ICON };
}
