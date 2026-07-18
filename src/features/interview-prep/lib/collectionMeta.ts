import { Atom, Layers, Network, Sparkles, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// The 5 rows on Get Started + the 5 sidebar entries under "FF Collections".
// Only 3 of these ("ff-javascript" | "ff-react" | "ff-nextjs") are real
// `collection` values on the collection_questions table — "ff-75" is that
// table's isFf75 flag, and "ff-system-design" has no row in it at all (its
// content is Feature 49's separate MDX guides). This type covers the IA,
// not the DB column.
export type InterviewPrepCollectionKey =
  | "ff-75"
  | "ff-javascript"
  | "ff-react"
  | "ff-nextjs"
  | "ff-system-design";

export type CollectionMeta = {
  label: string;
  description: string;
  icon: LucideIcon;
};

// Deliberately monochrome — no per-collection colorKey. GreatFrontEnd's own
// Dashboard renders every row/card icon as a plain gray square, not a
// colorful one per item; matching that instead of Learn/Practice's colorful
// CATEGORY_META treatment (user preference, 2026-07-14).
export const COLLECTION_META: Record<InterviewPrepCollectionKey, CollectionMeta> = {
  "ff-75": {
    label: "FF 75",
    description: "The 75 most important, most-frequently-asked questions — curated across JavaScript, React, and Next.js.",
    icon: Sparkles,
  },
  "ff-javascript": {
    label: "FF JavaScript",
    description: "Core JavaScript interview questions — closures, async patterns, the event loop, and more.",
    icon: Zap,
  },
  "ff-react": {
    label: "FF React",
    description: "React interview questions — hooks, rendering, component patterns, and performance.",
    icon: Atom,
  },
  "ff-nextjs": {
    label: "FF Next.js",
    description: "Next.js interview questions — rendering strategies, routing, and the App Router.",
    icon: Layers,
  },
  "ff-system-design": {
    label: "FF Frontend System Design",
    description: "Frontend system design practice — rich, guided walkthroughs of real interview prompts.",
    icon: Network,
  },
};
