import type { RoadmapSeed, RoadmapNodeSeed } from "./types";
import type { ConceptCategory } from "../../src/lib/constants";
import { CONCEPTS } from "./concepts";

// Skill-based roadmaps (JavaScript/CSS/React/TypeScript) map 1:1 onto a
// CONCEPT_CATEGORIES value — every node is that category's existing Learn
// concept, already fully authored (Features 41/43/44/45), laid out as a
// single linear chain in the category's own difficulty-ordered sequence.
// Cheap by design: no new lesson content, just structure + a learn-concept
// link per node (see build-plan.md's Phase 7 rescoping note).
function linearSkillNodes(category: ConceptCategory): RoadmapNodeSeed[] {
  const inCategory = CONCEPTS.filter((c) => c.category === category).sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );
  return inCategory.map((c, i) => ({
    slug: c.slug,
    title: c.title,
    description: c.description,
    positionX: 480,
    positionY: 80 + i * 150,
    orderIndex: i + 1,
    links: [{ linkType: "learn-concept", conceptSlug: c.slug }],
  }));
}

// The "Frontend Developer" role roadmap — roadmap.sh-breadth topical
// coverage, mixing internal FF Learn links (where a matching concept
// exists) with external article/video links (where it doesn't). This file
// seeds a real, verified pilot slice (2 sections, proving both link types
// end-to-end) rather than fake placeholder rows; the full topic run across
// every section (Git, package managers, build tools, testing, framework
// choice, etc.) is Feature 35's dedicated content-authoring pass — see
// build-plan.md, Feature 35.
const FRONTEND_DEVELOPER_NODES: RoadmapNodeSeed[] = [
  {
    slug: "internet-and-web-basics",
    title: "Internet & Web Basics",
    nodeType: "section",
    positionX: 120,
    positionY: 80,
    orderIndex: 1,
  },
  {
    slug: "how-the-internet-works",
    title: "How the Internet Works",
    description:
      "What actually happens between a browser request and a server response — computers, cables, and protocols working together.",
    parentSlug: "internet-and-web-basics",
    positionX: 120,
    positionY: 220,
    orderIndex: 1,
    links: [
      {
        linkType: "external-article",
        externalTitle: "How does the Internet work? — MDN",
        externalUrl:
          "https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work",
      },
    ],
  },
  {
    slug: "domain-names-and-hosting",
    title: "Domain Names & Hosting",
    description:
      "How a human-readable domain name resolves to a server, and what it means to host a site.",
    parentSlug: "internet-and-web-basics",
    positionX: 120,
    positionY: 360,
    orderIndex: 2,
    links: [
      {
        linkType: "external-article",
        externalTitle: "Domain — MDN Glossary",
        externalUrl: "https://developer.mozilla.org/en-US/docs/Glossary/Domain",
      },
    ],
  },
  {
    slug: "how-the-web-works",
    title: "How the Web Works",
    description:
      "What happens when a browser loads a page — DNS lookups, HTTP requests, rendering — end to end.",
    parentSlug: "internet-and-web-basics",
    positionX: 120,
    positionY: 500,
    orderIndex: 3,
    links: [
      {
        linkType: "external-article",
        externalTitle: "How the Web works — MDN",
        externalUrl:
          "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works",
      },
    ],
  },
  {
    slug: "html-and-css-fundamentals",
    title: "HTML & CSS Fundamentals",
    nodeType: "section",
    positionX: 480,
    positionY: 80,
    orderIndex: 2,
  },
  {
    slug: "fd-the-box-model",
    title: "The Box Model",
    description: "Every element on the page is a box — margin, border, padding, content.",
    parentSlug: "html-and-css-fundamentals",
    positionX: 480,
    positionY: 220,
    orderIndex: 1,
    links: [{ linkType: "learn-concept", conceptSlug: "the-box-model" }],
  },
  {
    slug: "fd-the-cascade-inheritance",
    title: "The Cascade & Inheritance",
    description: "How competing styles get resolved, and which properties inherit by default.",
    parentSlug: "html-and-css-fundamentals",
    positionX: 480,
    positionY: 360,
    orderIndex: 2,
    links: [{ linkType: "learn-concept", conceptSlug: "the-cascade-inheritance" }],
  },
  {
    slug: "fd-css-specificity",
    title: "CSS Specificity",
    description: "The scoring system that decides which of several matching rules wins.",
    parentSlug: "html-and-css-fundamentals",
    positionX: 480,
    positionY: 500,
    orderIndex: 3,
    links: [{ linkType: "learn-concept", conceptSlug: "css-specificity" }],
  },
  {
    slug: "fd-flexbox-vs-grid",
    title: "Flexbox vs. Grid",
    description: "Two layout systems, and how to tell which one a given layout problem needs.",
    parentSlug: "html-and-css-fundamentals",
    positionX: 480,
    positionY: 640,
    orderIndex: 4,
    links: [{ linkType: "learn-concept", conceptSlug: "flexbox-vs-grid" }],
  },
];

export const ROADMAPS: RoadmapSeed[] = [
  {
    slug: "frontend-developer",
    title: "Frontend Developer Roadmap",
    description:
      "Step-by-step guide to becoming a job-ready frontend developer — from how the internet works to modern frameworks, tooling, and interview prep.",
    roadmapType: "role",
    orderIndex: 1,
    nodes: FRONTEND_DEVELOPER_NODES,
  },

  {
    slug: "javascript",
    title: "JavaScript Roadmap",
    description:
      "A structured path through JavaScript's core runtime — hoisting, closures, the event loop, and everything in between.",
    roadmapType: "skill",
    orderIndex: 2,
    nodes: linearSkillNodes("javascript-runtime"),
  },

  {
    slug: "css",
    title: "CSS Roadmap",
    description:
      "From the box model to animation performance — a difficulty-ordered path through modern CSS.",
    roadmapType: "skill",
    orderIndex: 3,
    nodes: linearSkillNodes("css"),
  },

  {
    slug: "react",
    title: "React Roadmap",
    description:
      "Rendering, hooks, composition, and performance — a structured path through React as it's actually used today.",
    roadmapType: "skill",
    orderIndex: 4,
    nodes: linearSkillNodes("react"),
  },

  {
    slug: "typescript",
    title: "TypeScript Roadmap",
    description:
      "From basic types to branded types — a structured path through TypeScript for frontend engineers.",
    roadmapType: "skill",
    orderIndex: 5,
    nodes: linearSkillNodes("typescript"),
  },
];
