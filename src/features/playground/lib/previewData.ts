// Static teaser content for the Playground hub (Feature 52) — same precedent
// as Feature 30's original PlaybookPreview/StudyPlansPreview/CompanyGuidesPreview:
// the real table/route this preview row points at doesn't exist yet
// (Experiments' gallery is Feature 54), so there is nothing real to query yet.
// Battles' own preview row was converted to a real query in Feature 53 (see
// app/(app)/playground/page.tsx) — this file now only covers Experiments.

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
