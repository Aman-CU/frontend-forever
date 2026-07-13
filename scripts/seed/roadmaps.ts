import type { RoadmapSeed } from "./types";

export const ROADMAPS: RoadmapSeed[] = [
  {
    slug: "frontend-foundations",
    title: "Frontend Foundations",
    description:
      "Build a solid mental model of how browsers and JavaScript actually work — the concepts that underpin every frontend interview.",
    orderIndex: 1,
    steps: ["event-loop", "browser-rendering-pipeline", "css-specificity", "react-rendering"],
  },

  {
    slug: "react-expert-path",
    title: "React Expert Path",
    description:
      "Go deep on React, TypeScript, performance, and accessibility — the stack expected of a senior frontend engineer.",
    orderIndex: 2,
    steps: ["type-narrowing", "react-rendering", "core-web-vitals", "aria-roles-and-semantic-html"],
  }
];
