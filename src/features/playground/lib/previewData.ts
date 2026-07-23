import type { ChallengeDifficulty } from "@/lib/constants";

// Static teaser content for the Playground hub (Feature 52) — same precedent
// as Feature 30's original PlaybookPreview/StudyPlansPreview/CompanyGuidesPreview:
// the real tables/routes these preview rows point at don't exist yet (Battles'
// list/editor is Feature 53, Experiments' gallery is Feature 54), so there is
// nothing real to query. Swap each row for a real query once its own feature
// ships, same conversion Features 50/51 did for their own hub previews.

export type BattlePreviewItem = {
  slug: string;
  title: string;
  difficulty: ChallengeDifficulty;
};

export const BATTLE_PREVIEW_ITEMS: BattlePreviewItem[] = [
  { slug: "login-card-recreate", title: "Login Card", difficulty: "easy" },
  { slug: "pricing-table-clone", title: "Pricing Table", difficulty: "medium" },
  { slug: "profile-card-redo", title: "Profile Card", difficulty: "easy" },
  { slug: "notification-toast-stack", title: "Toast Stack", difficulty: "medium" },
  { slug: "stats-dashboard-widget", title: "Stats Widget", difficulty: "hard" },
];

export type ExperimentPreviewItem = {
  slug: string;
  title: string;
  description: string;
};

export const EXPERIMENT_PREVIEW_ITEMS: ExperimentPreviewItem[] = [
  {
    slug: "particle-cursor-trail",
    title: "Particle Cursor Trail",
    description: "A trailing particle field that follows your cursor.",
  },
  {
    slug: "3d-product-spin",
    title: "3D Product Spin",
    description: "Drag to spin a product render in three.js.",
  },
  {
    slug: "confetti-button",
    title: "Confetti Button",
    description: "A button that never gets old to press.",
  },
  {
    slug: "gesture-paint-canvas",
    title: "Gesture Paint Canvas",
    description: "Paint on canvas using hand tracking.",
  },
  {
    slug: "ascii-webcam-filter",
    title: "ASCII Webcam Filter",
    description: "Turns your live webcam feed into real-time ASCII art.",
  },
];
