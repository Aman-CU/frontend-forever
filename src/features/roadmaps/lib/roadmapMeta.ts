import type { ComponentType } from "react";
import { Code2 } from "lucide-react";

import { JavascriptIcon } from "@/components/shared/devicons/JavascriptIcon";
import { Css3Icon } from "@/components/shared/devicons/Css3Icon";
import { ReactIcon } from "@/components/shared/devicons/ReactIcon";
import { TypescriptIcon } from "@/components/shared/devicons/TypescriptIcon";
import { FFLogoIcon } from "@/components/shared/FFLogoIcon";

export type RoadmapMeta = {
  icon: ComponentType<{ className?: string }>;
  // Full size+color className for the icon itself — most icons are real
  // devicon.dev marks that hardcode their own brand fill and ignore this
  // entirely, but the 2 that don't (Code2, FFLogoIcon) need a real value.
  iconClassName: string;
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
// "frontend-interview-cracking" (displayed as "Frontend Forever Roadmap")
// gets the FF wordmark itself, not a generic fallback — it's a tour of the
// platform, not one technology or role.
const ROADMAP_ICON: Record<string, ComponentType<{ className?: string }>> = {
  javascript: JavascriptIcon,
  css: Css3Icon,
  react: ReactIcon,
  typescript: TypescriptIcon,
  "frontend-interview-cracking": FFLogoIcon,
};

const DEFAULT_ICON = Code2;
const DEFAULT_ICON_CLASSNAME = "h-5 w-5 text-accent";

// FF's own wordmark reads as a brand mark, not a generic UI icon — direct
// user request to size it up slightly and give it the navbar's own
// `text-text-primary` treatment (near-black in light mode) instead of the
// teal `text-accent` every other fallback icon gets, so it doesn't read as
// just another colored category icon.
const ICON_CLASSNAME_OVERRIDES: Record<string, string> = {
  "frontend-interview-cracking": "h-6 w-6 text-text-primary",
};

export function getRoadmapMeta(slug: string): RoadmapMeta {
  return {
    icon: ROADMAP_ICON[slug] ?? DEFAULT_ICON,
    iconClassName: ICON_CLASSNAME_OVERRIDES[slug] ?? DEFAULT_ICON_CLASSNAME,
  };
}
