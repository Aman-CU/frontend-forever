import type { RoadmapSeed, RoadmapNodeSeed, RoadmapNodeLinkSeed } from "./types";
import type { ConceptCategory } from "../../src/lib/constants";
import { CONCEPTS } from "./concepts";

const CONCEPT_BY_SLUG = new Map(CONCEPTS.map((c) => [c.slug, c]));

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

// ── Frontend Developer role roadmap ─────────────────────────────────────────
// roadmap.sh-breadth topical coverage, mixing internal FF Learn links (where
// a matching concept already exists) with external article/video links
// (where it doesn't) — every external URL below was verified live via
// WebSearch before being written here, not guessed. Topical structure is
// inspired by roadmap.sh's own Frontend roadmap for coverage/ordering, but
// grouped and described originally, not copied.

type TopicSpec = {
  slug: string;
  title: string;
  description: string;
  isOptional?: boolean;
  links: RoadmapNodeLinkSeed[];
};

type SectionSpec = {
  slug: string;
  title: string;
  topics: TopicSpec[];
};

// A topic that reuses an existing Learn concept's own title/description —
// keeps the roadmap node's copy consistent with the concept page it links
// to, and avoids re-authoring 30+ blurbs by hand.
function conceptTopic(slug: string, opts?: { isOptional?: boolean }): TopicSpec {
  const concept = CONCEPT_BY_SLUG.get(slug);
  if (!concept) {
    throw new Error(`[seed] Frontend Developer roadmap references unknown concept slug "${slug}"`);
  }
  return {
    slug: `fd-${slug}`,
    title: concept.title,
    description: concept.description,
    isOptional: opts?.isOptional,
    links: [{ linkType: "learn-concept", conceptSlug: slug }],
  };
}

function externalTopic(
  slug: string,
  title: string,
  description: string,
  linkType: "external-article" | "external-video",
  externalTitle: string,
  externalUrl: string,
): TopicSpec {
  return {
    slug,
    title,
    description,
    links: [{ linkType, externalTitle, externalUrl }],
  };
}

// Lays out a set of section columns left to right, each column's sections
// stacked top to bottom — hand-authored coordinates computed by this one
// deterministic pass rather than typed out by hand (65 nodes), not an
// imported auto-layout algorithm/library (the architecture decision that
// ruled out a dependency was about not needing a generic force-directed/
// tree-layout engine; this is just arithmetic over content this file itself
// defines).
function layoutColumns(columns: SectionSpec[][]): RoadmapNodeSeed[] {
  const COLUMN_X = [120, 480, 840];
  const TOPIC_STEP_Y = 150;
  const SECTION_HEADER_TO_FIRST_TOPIC = 140;
  const SECTION_GAP = 90;

  const nodes: RoadmapNodeSeed[] = [];

  columns.forEach((sections, columnIndex) => {
    const x = COLUMN_X[columnIndex];
    let y = 80;
    sections.forEach((section, sectionIndex) => {
      nodes.push({
        slug: section.slug,
        title: section.title,
        nodeType: "section",
        positionX: x,
        positionY: y,
        orderIndex: sectionIndex + 1,
      });

      let topicY = y + SECTION_HEADER_TO_FIRST_TOPIC;
      section.topics.forEach((topic, topicIndex) => {
        nodes.push({
          slug: topic.slug,
          title: topic.title,
          description: topic.description,
          isOptional: topic.isOptional,
          parentSlug: section.slug,
          positionX: x,
          positionY: topicY,
          orderIndex: topicIndex + 1,
          links: topic.links,
        });
        topicY += TOPIC_STEP_Y;
      });

      y = topicY + SECTION_GAP;
    });
  });

  return nodes;
}

const COLUMN_A: SectionSpec[] = [
  {
    slug: "internet-and-web-basics",
    title: "Internet & Web Basics",
    topics: [
      externalTopic(
        "how-the-internet-works",
        "How the Internet Works",
        "What actually happens between a browser request and a server response — computers, cables, and protocols working together.",
        "external-article",
        "How does the Internet work? — MDN",
        "https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work",
      ),
      externalTopic(
        "domain-names-and-hosting",
        "Domain Names & Hosting",
        "How a human-readable domain name resolves to a server, and what it means to host a site.",
        "external-article",
        "Domain — MDN Glossary",
        "https://developer.mozilla.org/en-US/docs/Glossary/Domain",
      ),
      externalTopic(
        "how-the-web-works",
        "How the Web Works",
        "What happens when a browser loads a page — DNS lookups, HTTP requests, rendering — end to end.",
        "external-article",
        "How the Web works — MDN",
        "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works",
      ),
    ],
  },
  {
    slug: "css-fundamentals",
    title: "CSS Fundamentals",
    topics: [
      conceptTopic("the-box-model"),
      conceptTopic("units-sizing"),
      conceptTopic("the-cascade-inheritance"),
      conceptTopic("css-specificity"),
      conceptTopic("flexbox-vs-grid"),
    ],
  },
  {
    slug: "javascript-fundamentals",
    title: "JavaScript Fundamentals",
    topics: [
      conceptTopic("hoisting-temporal-dead-zone"),
      conceptTopic("equality-type-coercion"),
      conceptTopic("closures"),
      conceptTopic("callbacks-higher-order-functions"),
      conceptTopic("array-object-methods-immutability"),
    ],
  },
  {
    slug: "version-control-and-package-managers",
    title: "Version Control & Package Managers",
    topics: [
      externalTopic(
        "git-basics",
        "Git Basics",
        "Tracking changes to your code over time, and undoing mistakes without losing work.",
        "external-article",
        "gittutorial — git-scm.com",
        "https://git-scm.com/docs/gittutorial",
      ),
      externalTopic(
        "github-collaboration",
        "GitHub & Collaboration",
        "Hosting a Git repository and working with others through branches and pull requests.",
        "external-article",
        "Hello World — GitHub Docs",
        "https://docs.github.com/en/get-started/start-your-journey/hello-world",
      ),
      externalTopic(
        "npm-and-package-managers",
        "npm & Package Managers",
        "Installing and managing the third-party code your project depends on.",
        "external-article",
        "Package management basics — MDN",
        "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Package_management",
      ),
    ],
  },
  {
    slug: "react",
    title: "React",
    topics: [
      conceptTopic("jsx-virtual-dom"),
      conceptTopic("usestate-useeffect-fundamentals"),
      conceptTopic("controlled-vs-uncontrolled-forms"),
      conceptTopic("context-api-prop-drilling"),
      conceptTopic("react-rendering"),
      conceptTopic("custom-hooks-composition"),
    ],
  },
  {
    slug: "testing-and-deployment",
    title: "Testing & Deployment",
    topics: [
      externalTopic(
        "unit-testing-fundamentals",
        "Unit Testing",
        "Writing small, automated tests that catch regressions before they reach production.",
        "external-article",
        "Getting Started — Jest",
        "https://jestjs.io/docs/getting-started",
      ),
      externalTopic(
        "end-to-end-testing",
        "End-to-End Testing",
        "Automating a real browser to test your app the way a user actually experiences it.",
        "external-article",
        "Getting started — Playwright",
        "https://playwright.dev/docs/intro",
      ),
      externalTopic(
        "deploying-your-app",
        "Deploying Your App",
        "Getting a finished project from your machine onto the public internet.",
        "external-article",
        "Deploying our app — MDN",
        "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Deployment",
      ),
    ],
  },
];

const COLUMN_B: SectionSpec[] = [
  {
    slug: "html-and-semantic-markup",
    title: "HTML & Semantic Markup",
    topics: [
      externalTopic(
        "html-fundamentals",
        "HTML Fundamentals",
        "Structuring a web page's content with the right elements, not just the ones that happen to look right.",
        "external-article",
        "Structuring content with HTML — MDN",
        "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content",
      ),
      conceptTopic("aria-roles-and-semantic-html"),
    ],
  },
  {
    slug: "css-beyond-the-basics",
    title: "CSS Beyond the Basics",
    topics: [
      conceptTopic("positioning-stacking-contexts"),
      conceptTopic("responsive-design-container-queries"),
      conceptTopic("custom-properties-theming"),
      conceptTopic("pseudo-classes-pseudo-elements-has"),
      conceptTopic("animation-performance", { isOptional: true }),
    ],
  },
  {
    slug: "javascript-in-depth",
    title: "JavaScript In Depth",
    topics: [
      conceptTopic("this-binding-execution-context"),
      conceptTopic("prototypal-inheritance"),
      conceptTopic("esm-vs-commonjs"),
      conceptTopic("event-loop"),
      conceptTopic("promises-async-await"),
      conceptTopic("debouncing-throttling", { isOptional: true }),
    ],
  },
  {
    slug: "build-tools-and-css-architecture",
    title: "Build Tools & CSS Architecture",
    topics: [
      externalTopic(
        "module-bundlers-and-build-tools",
        "Module Bundlers & Build Tools",
        "Bundling, tree-shaking, and minifying your code so it's ready to ship to production.",
        "external-article",
        "Client-side tooling overview — MDN",
        "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Overview",
      ),
      externalTopic(
        "css-preprocessors-and-architecture",
        "CSS Preprocessors & Architecture",
        "Sass and similar tools add variables, nesting, and mixins on top of plain CSS.",
        "external-article",
        "Sass Basics — sass-lang.com",
        "https://sass-lang.com/guide/",
        ),
    ],
  },
  {
    slug: "typescript",
    title: "TypeScript",
    topics: [
      conceptTopic("basic-types-inference"),
      conceptTopic("interfaces-vs-type-aliases"),
      conceptTopic("generics"),
      conceptTopic("type-narrowing"),
    ],
  },
  {
    slug: "browser-internals-and-security",
    title: "Browser Internals & Security",
    topics: [
      conceptTopic("dom-vs-bom"),
      conceptTopic("event-delegation-bubbling-capturing"),
      conceptTopic("browser-rendering-pipeline"),
      conceptTopic("cors-same-origin-policy"),
      conceptTopic("web-security-fundamentals"),
    ],
  },
  {
    slug: "performance",
    title: "Performance",
    topics: [
      conceptTopic("image-asset-optimization"),
      conceptTopic("bundle-size-code-splitting"),
      conceptTopic("core-web-vitals"),
    ],
  },
];

const FRONTEND_DEVELOPER_NODES: RoadmapNodeSeed[] = layoutColumns([COLUMN_A, COLUMN_B]);

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
