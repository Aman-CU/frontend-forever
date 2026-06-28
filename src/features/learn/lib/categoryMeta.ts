import {
  Atom,
  FileCode2,
  Gauge,
  Globe,
  Lock,
  Network,
  Paintbrush,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ConceptCategory } from "@/lib/constants";

export type ColorKey =
  | "accent"
  | "info"
  | "premium"
  | "success"
  | "streak"
  | "xp";

export type CategoryMeta = {
  label: string;
  description: string;
  icon: LucideIcon;
  colorKey: ColorKey;
  badge?: string;
  badgeStyle?: { bg: string; text: string };
};

export const CATEGORY_META: Record<ConceptCategory, CategoryMeta> = {
  "javascript-runtime": {
    label: "JavaScript Runtime",
    description: "Event loop, closures, promises & async patterns",
    icon: Zap,
    colorKey: "xp",
    badge: "JS",
    badgeStyle: { bg: "bg-js-badge-bg", text: "text-js-badge-text" },
  },
  "browser-internals": {
    label: "Browser Internals",
    description: "DOM, CSSOM, rendering pipeline & web APIs",
    icon: Globe,
    colorKey: "info",
  },
  react: {
    label: "React",
    description: "Rendering, reconciliation, hooks & patterns",
    icon: Atom,
    colorKey: "premium",
  },
  css: {
    label: "CSS",
    description: "Specificity, layout, animations & modern CSS",
    icon: Paintbrush,
    colorKey: "success",
  },
  typescript: {
    label: "TypeScript",
    description: "Types, generics, utility types & advanced patterns",
    icon: FileCode2,
    colorKey: "info",
    badge: "TS",
    badgeStyle: { bg: "bg-info", text: "text-accent-foreground" },
  },
  accessibility: {
    label: "Accessibility",
    description: "ARIA, keyboard nav, screen readers & WCAG",
    icon: Lock,
    colorKey: "xp",
  },
  performance: {
    label: "Performance",
    description: "Core Web Vitals, optimization & profiling",
    icon: Gauge,
    colorKey: "accent",
  },
  "system-design": {
    label: "System Design",
    description: "Scalable frontend architecture & design patterns",
    icon: Network,
    colorKey: "premium",
  },
};

export type ColorClasses = {
  iconBg: string;
  iconText: string;
  cardBorder: string;
};

export const COLOR_CLASSES: Record<ColorKey, ColorClasses> = {
  accent: {
    iconBg: "bg-accent-muted",
    iconText: "text-accent",
    cardBorder: "hover:border-accent",
  },
  info: {
    iconBg: "bg-info-muted",
    iconText: "text-info",
    cardBorder: "hover:border-info",
  },
  premium: {
    iconBg: "bg-premium-light",
    iconText: "text-premium",
    cardBorder: "hover:border-premium",
  },
  success: {
    iconBg: "bg-success-muted",
    iconText: "text-success",
    cardBorder: "hover:border-success",
  },
  streak: {
    iconBg: "bg-streak-light",
    iconText: "text-streak",
    cardBorder: "hover:border-streak",
  },
  xp: {
    iconBg: "bg-xp-light",
    iconText: "text-xp",
    cardBorder: "hover:border-xp",
  },
};
