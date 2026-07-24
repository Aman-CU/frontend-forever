// Experiments are first-party, in-repo interactive components — NOT DB rows and
// NOT user-submitted, so there is no table and no query layer here (build-plan.md,
// Feature 54). This registry IS the source of truth: metadata for the gallery
// cards + the per-experiment detail page, plus the real on-disk source-file paths
// the "View Code" panel reads back (see lib/experimentSource.ts). The runnable
// component itself is mapped separately in clientRegistry.tsx, because a
// next/dynamic({ ssr: false }) import can only live in a Client Component — this
// file must stay server-safe (the list/detail pages are RSCs).

export type ExperimentSourceFile = {
  // Human label shown on the code-view tab (e.g. "ParticleCursorTrail.tsx").
  label: string;
  // Path relative to the experiments root (src/features/playground/experiments).
  // Resolved + traversal-guarded server-side before any read — see
  // lib/experimentSource.ts.
  path: string;
};

export type Experiment = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  // Static screenshot of the real running demo (public/experiments/<slug>.png),
  // used for the gallery card thumbnail AND the page's og:image so a shared
  // link unfurls with a real preview — same "one screenshot, two jobs" move as
  // UI Battles' targetImageUrl (Feature 53).
  thumbnail: string;
  sourceFiles: ExperimentSourceFile[];
};

export const EXPERIMENTS: Experiment[] = [
  {
    slug: "particle-cursor-trail",
    title: "Particle Cursor Trail",
    description:
      "A trailing field of particles that chases your cursor, fading and shrinking as it goes. Pure canvas and requestAnimationFrame — no libraries.",
    tags: ["Canvas", "Animation", "Vanilla JS"],
    thumbnail: "/experiments/particle-cursor-trail.png",
    sourceFiles: [
      {
        label: "ParticleCursorTrail.tsx",
        path: "particle-cursor-trail/ParticleCursorTrail.tsx",
      },
    ],
  },
];

export function getExperiment(slug: string): Experiment | undefined {
  return EXPERIMENTS.find((experiment) => experiment.slug === slug);
}
