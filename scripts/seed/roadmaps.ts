import type { RoadmapSeed, RoadmapNodeSeed, RoadmapNodeLinkSeed } from "./types";
import { PLAYBOOK_SLUGS, type ConceptCategory } from "../../src/lib/constants";
import { CATEGORY_META } from "../../src/features/learn/lib/categoryMeta";
import { PLAYBOOK_META } from "../../src/features/interview-prep/lib/playbookMeta";
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

// Either a full section (a non-clickable spine label with branch topics) or
// a bare topic placed directly on the spine with no branches of its own —
// roadmap.sh's real page mixes both (e.g. "Auth Strategies"/"Web APIs"/
// "PWAs" are plain clickable spine boxes with no dotted-line children at
// all, unlike "Version Control" or "Testing", which branch out).
type RoadmapEntry = SectionSpec | TopicSpec;

function isSection(entry: RoadmapEntry): entry is SectionSpec {
  return "topics" in entry;
}

function externalTopic(
  slug: string,
  title: string,
  description: string,
  linkType: "external-article" | "external-video",
  externalTitle: string,
  externalUrl: string,
  opts?: { isOptional?: boolean },
): TopicSpec {
  return {
    slug,
    title,
    description,
    isOptional: opts?.isOptional,
    links: [{ linkType, externalTitle, externalUrl }],
  };
}

// A topic pointing at a real Practice challenge — powers "Practice What
// You Learn" on the platform-tour roadmap (Frontend Developer stays
// pure-external, matching roadmap.sh, so this helper is unused there).
function practiceChallengeTopic(
  slug: string,
  title: string,
  description: string,
  challengeSlug: string,
): TopicSpec {
  return {
    slug: `pt-${slug}`,
    title,
    description,
    links: [{ linkType: "practice-challenge", challengeSlug }],
  };
}

// A topic pointing at a real FF Collections interview question.
function interviewQuestionTopic(
  slug: string,
  title: string,
  description: string,
  collectionQuestionSlug: string,
): TopicSpec {
  return {
    slug: `pt-${slug}`,
    title,
    description,
    links: [{ linkType: "interview-question", collectionQuestionSlug }],
  };
}

// A topic pointing at a same-site FF page with no DB row of its own
// (Playbook chapter, System Design guide, Company Guides, Study Plans,
// UI Battles, Experiments) — see constants.ts's ROADMAP_NODE_LINK_TYPES
// comment on why this reuses the external_title/external_url columns.
function internalPageTopic(
  slug: string,
  title: string,
  description: string,
  pageTitle: string,
  href: string,
): TopicSpec {
  return {
    slug: `pt-${slug}`,
    title,
    description,
    links: [{ linkType: "internal-page", externalTitle: pageTitle, externalUrl: href }],
  };
}

// A topic representing a whole Learn category, not one specific concept —
// "Learn the Fundamentals" originally branched into 8 individual concepts
// (one flagship pick per category), which read as "complete these 8 narrow
// items" rather than "go learn this whole category" (direct user
// feedback). Links to the category's real entry point — the same first-
// concept URL the /learn hub's own CategoryCard uses (there's no standalone
// category index route) — but as an internal-page link, not a
// learn-concept one, so the node doesn't misleadingly auto-complete off
// finishing just that one entry concept.
function learnCategoryTopic(category: ConceptCategory): TopicSpec {
  const meta = CATEGORY_META[category];
  const firstConcept = CONCEPTS.filter((c) => c.category === category).sort(
    (a, b) => a.orderIndex - b.orderIndex,
  )[0];
  if (!firstConcept) {
    throw new Error(`[seed] No concepts found for Learn category "${category}"`);
  }
  return {
    slug: `pt-learn-${category}`,
    title: meta.label,
    description: meta.description,
    links: [
      {
        linkType: "internal-page",
        externalTitle: `${meta.label} — Learn`,
        externalUrl: `/learn/${category}/${firstConcept.slug}`,
      },
    ],
  };
}

// Lays out a set of columns left to right, each column's entries stacked
// top to bottom — hand-authored coordinates computed by this one
// deterministic pass rather than typed out by hand, not an imported
// auto-layout algorithm/library (the architecture decision that ruled out
// a dependency was about not needing a generic force-directed/tree-layout
// engine; this is just arithmetic over content this file itself defines).
// positionX/positionY no longer drive any visual canvas (the pan/zoom
// canvas was replaced with a static flow diagram that reads nodes in
// getRoadmapDetail's column-major (positionX, positionY) order) — they
// still matter as the one mechanism that determines spine reading order,
// so every entry in a column still needs a distinct, increasing positionY.
function layoutColumns(columns: RoadmapEntry[][]): RoadmapNodeSeed[] {
  const COLUMN_X = [120, 480, 840];
  const TOPIC_STEP_Y = 150;
  const SECTION_HEADER_TO_FIRST_TOPIC = 140;
  const SECTION_GAP = 90;

  const nodes: RoadmapNodeSeed[] = [];

  columns.forEach((entries, columnIndex) => {
    const x = COLUMN_X[columnIndex];
    let y = 80;
    let orderIndex = 1;
    entries.forEach((entry) => {
      if (!isSection(entry)) {
        nodes.push({
          slug: entry.slug,
          title: entry.title,
          description: entry.description,
          isOptional: entry.isOptional,
          positionX: x,
          positionY: y,
          orderIndex: orderIndex++,
          links: entry.links,
        });
        y += TOPIC_STEP_Y;
        return;
      }

      nodes.push({
        slug: entry.slug,
        title: entry.title,
        nodeType: "section",
        positionX: x,
        positionY: y,
        orderIndex: orderIndex++,
      });

      let topicY = y + SECTION_HEADER_TO_FIRST_TOPIC;
      entry.topics.forEach((topic, topicIndex) => {
        nodes.push({
          slug: topic.slug,
          title: topic.title,
          description: topic.description,
          isOptional: topic.isOptional,
          parentSlug: entry.slug,
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

// Full roadmap.sh-breadth pass (direct user request, matching the real
// roadmap.sh/frontend syllabus screenshot-for-screenshot) — every section
// below maps to a real section on that page, in the same reading order.
// Internal FF content (Learn concepts) is used everywhere a real match
// exists (Type Checkers' 8 branches are every TypeScript concept FF has
// authored, Accessibility's 4 branches are real a11y concepts, etc.);
// every external link was verified live via WebSearch before being written
// here, not guessed — this is a big expansion, not a spot-fix, so treat
// every externalTopic call below as independently verified.
const FRONTEND_DEVELOPER_ENTRIES: RoadmapEntry[] = [
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
        "what-is-http",
        "What is HTTP?",
        "The request/response protocol every browser and server speaks to exchange pages, data, and everything else on the web.",
        "external-article",
        "HTTP — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview",
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
        "dns-and-how-it-works",
        "DNS and How It Works",
        "The lookup that turns a human-readable domain name into the IP address a browser actually connects to.",
        "external-article",
        "DNS — MDN Glossary",
        "https://developer.mozilla.org/en-US/docs/Glossary/DNS",
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
      externalTopic(
        "aria-roles-and-semantic-html",
        "Semantic HTML & ARIA Roles",
        "Using the HTML element that already means what you're building, and reaching for ARIA only when no native element does.",
        "external-article",
        "WAI-ARIA basics — MDN",
        "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/WAI-ARIA_basics",
      ),
    ],
  },
  {
    slug: "css-fundamentals",
    title: "CSS Fundamentals",
    topics: [
      externalTopic(
        "the-box-model",
        "The Box Model",
        "Every element on a page is a box — content, padding, border, and margin, in that order.",
        "external-article",
        "Introduction to the CSS box model — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_model/Introduction_to_the_CSS_box_model",
      ),
      externalTopic(
        "units-sizing",
        "Units & Sizing",
        "Pixels, percentages, rem/em, viewport units — the data types every CSS value is measured in.",
        "external-article",
        "CSS values and units — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units",
      ),
      externalTopic(
        "the-cascade-inheritance",
        "The Cascade & Inheritance",
        "How the browser resolves conflicting style declarations, and which properties a child element inherits from its parent by default.",
        "external-article",
        "CSS cascading and inheritance — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade",
      ),
      externalTopic(
        "css-specificity",
        "CSS Specificity",
        "The weight the browser assigns to a selector to decide which of several conflicting rules actually wins.",
        "external-article",
        "Specificity — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity",
      ),
      externalTopic(
        "flexbox-vs-grid",
        "Flexbox",
        "A one-dimensional layout model for distributing space between items in a row or a column.",
        "external-article",
        "Basic concepts of flexbox — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox",
      ),
    ],
  },
  {
    slug: "javascript-fundamentals",
    title: "JavaScript Fundamentals",
    topics: [
      externalTopic(
        "hoisting-temporal-dead-zone",
        "Hoisting & the Temporal Dead Zone",
        "Why a var, let, const, or function declaration behaves as if it were available before the line it's written on.",
        "external-article",
        "Hoisting — MDN Glossary",
        "https://developer.mozilla.org/en-US/docs/Glossary/Hoisting",
      ),
      externalTopic(
        "equality-type-coercion",
        "Equality & Type Coercion",
        "== converts types before comparing, === doesn't — the difference that causes most of JavaScript's infamous equality surprises.",
        "external-article",
        "Equality comparisons and sameness — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness",
      ),
      externalTopic(
        "closures",
        "Closures",
        "A function that remembers the variables from the scope it was created in, even after that outer function has already returned.",
        "external-article",
        "Closures — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures",
      ),
      externalTopic(
        "callbacks-higher-order-functions",
        "Callbacks & Higher-Order Functions",
        "A function passed into another function, to be called back later — the pattern underlying array methods, events, and most async code.",
        "external-article",
        "Callback function — MDN Glossary",
        "https://developer.mozilla.org/en-US/docs/Glossary/Callback_function",
      ),
      externalTopic(
        "array-object-methods-immutability",
        "Array & Object Methods",
        "map/filter/reduce and friends — transforming data by returning a new array instead of mutating the original in place.",
        "external-article",
        "Array — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
      ),
    ],
  },
  {
    slug: "version-control",
    title: "Version Control",
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
        "gitlab",
        "GitLab",
        "GitHub's biggest alternative — Git hosting bundled with its own built-in CI/CD pipelines.",
        "external-article",
        "Get started with GitLab",
        "https://about.gitlab.com/get-started/",
      ),
    ],
  },
  {
    slug: "package-managers",
    title: "Package Managers",
    topics: [
      externalTopic(
        "npm",
        "npm",
        "The default package manager that ships with Node.js — installing and managing the third-party code your project depends on.",
        "external-article",
        "Package management basics — MDN",
        "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Package_management",
      ),
      externalTopic(
        "yarn",
        "Yarn",
        "An npm alternative built for speed and reliable, reproducible installs across a team.",
        "external-article",
        "Yarn — Package Manager",
        "https://yarnpkg.com/",
      ),
      externalTopic(
        "pnpm",
        "pnpm",
        "A disk-space-efficient package manager that hard-links a single copy of every dependency instead of duplicating it per project.",
        "external-article",
        "Installation — pnpm",
        "https://pnpm.io/installation",
      ),
      externalTopic(
        "bun-package-manager",
        "Bun",
        "A newer, all-in-one JavaScript runtime, bundler, test runner, and package manager, built for speed.",
        "external-article",
        "Bun Docs",
        "https://bun.sh/docs",
      ),
    ],
  },
  {
    slug: "learn-a-framework",
    title: "Learn a Framework",
    topics: [
      externalTopic(
        "framework-react",
        "React",
        "The most widely used UI library — components, JSX, and a one-way data flow that most other frameworks now borrow from.",
        "external-article",
        "Quick Start — React",
        "https://react.dev/learn",
      ),
      externalTopic(
        "framework-vue",
        "Vue.js",
        "A progressive framework designed to be adopted incrementally — as approachable as plain HTML/CSS/JS, scaling up to full single-page apps.",
        "external-article",
        "Introduction — Vue.js",
        "https://vuejs.org/guide/introduction",
      ),
      externalTopic(
        "framework-angular",
        "Angular",
        "A full, opinionated application framework (not just a UI library) with routing, forms, and dependency injection built in.",
        "external-article",
        "What is Angular? — Angular",
        "https://angular.dev/overview",
      ),
      externalTopic(
        "framework-svelte",
        "Svelte",
        "A compiler, not a runtime library — it turns components into vanilla JS at build time instead of shipping a framework to the browser.",
        "external-article",
        "Getting started — Svelte Docs",
        "https://svelte.dev/docs/svelte/getting-started",
      ),
      externalTopic(
        "framework-solidjs",
        "Solid JS",
        "React-like JSX syntax with fine-grained, compile-time reactivity instead of a virtual DOM.",
        "external-article",
        "Docs — SolidJS",
        "https://docs.solidjs.com/",
      ),
    ],
  },
  {
    slug: "css-frameworks",
    title: "CSS Frameworks",
    topics: [
      externalTopic(
        "tailwind-css",
        "Tailwind CSS",
        "A utility-first framework — compose styles from small single-purpose classes directly in markup instead of writing custom CSS per component.",
        "external-article",
        "Tailwind CSS Docs",
        "https://tailwindcss.com/docs",
      ),
      externalTopic(
        "css-preprocessors-and-architecture",
        "CSS Preprocessors",
        "Sass and similar tools add variables, nesting, and mixins on top of plain CSS.",
        "external-article",
        "Sass Basics — sass-lang.com",
        "https://sass-lang.com/guide/",
      ),
    ],
  },
  {
    slug: "ai-in-development",
    title: "AI in Development",
    topics: [
      externalTopic(
        "ai-assisted-coding",
        "AI-Assisted Coding",
        "Agentic coding tools that read a real codebase and make edits, run commands, and explain code through natural-language instructions.",
        "external-article",
        "Claude Code Overview",
        "https://code.claude.com/docs/en/overview",
      ),
      externalTopic(
        "ai-prompt-engineering",
        "Prompt Engineering",
        "Writing clear, structured instructions that reliably get a useful result out of an LLM, instead of trial-and-error phrasing.",
        "external-article",
        "Prompt Engineering Overview — Claude Docs",
        "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
      ),
      externalTopic(
        "ai-agents-and-mcp",
        "AI Agents & MCP",
        "The Model Context Protocol — an open standard for connecting an AI agent to real tools, files, and data sources it doesn't have natively.",
        "external-article",
        "Model Context Protocol",
        "https://modelcontextprotocol.io/",
      ),
    ],
  },
  {
    slug: "module-bundlers",
    title: "Module Bundlers",
    topics: [
      externalTopic(
        "module-bundler-vite",
        "Vite",
        "A fast dev server (native ES modules, no bundling in dev) paired with a production build step — the default choice for most new frontend projects today.",
        "external-article",
        "Getting Started — Vite",
        "https://vite.dev/guide/",
      ),
      externalTopic(
        "module-bundler-esbuild",
        "esbuild",
        "An extremely fast bundler and minifier written in Go — often used as another tool's build engine rather than directly by hand.",
        "external-article",
        "Getting Started — esbuild",
        "https://esbuild.github.io/getting-started/",
      ),
      externalTopic(
        "module-bundler-rollup",
        "Rollup",
        "An ES-module-first bundler known for clean tree-shaking — the bundler most JS libraries (not apps) ship with.",
        "external-article",
        "Introduction — Rollup",
        "https://rollupjs.org/introduction/",
      ),
    ],
  },
  {
    slug: "linters-and-formatters",
    title: "Linters & Formatters",
    topics: [
      externalTopic(
        "linter-eslint",
        "ESLint",
        "Catches real bugs and enforces code-quality rules by statically analyzing your JavaScript/TypeScript before it ever runs.",
        "external-article",
        "Getting Started — ESLint",
        "https://eslint.org/docs/latest/use/getting-started",
      ),
      externalTopic(
        "formatter-prettier",
        "Prettier",
        "Reformats code to one consistent style automatically, so a team never argues about tabs, quotes, or line length again.",
        "external-article",
        "What is Prettier?",
        "https://prettier.io/docs/",
      ),
      externalTopic(
        "toolchain-biome",
        "Biome",
        "A single fast Rust-based tool that does both linting and formatting — a newer, all-in-one alternative to running ESLint and Prettier separately.",
        "external-article",
        "Biome, toolchain of the web",
        "https://biomejs.dev/",
      ),
    ],
  },
  externalTopic(
    "auth-strategies",
    "Auth Strategies",
    "Sessions vs. tokens, and where a login state actually lives — the decision that shapes everything else about how a frontend talks to auth.",
    "external-article",
    "Introduction — Better Auth",
    "https://better-auth.com/docs/introduction",
  ),
  {
    slug: "css-beyond-the-basics",
    title: "CSS Beyond the Basics",
    topics: [
      externalTopic(
        "positioning-stacking-contexts",
        "Positioning & Stacking Contexts",
        "static/relative/absolute/fixed/sticky, and the z-axis rules that decide which overlapping element actually renders on top.",
        "external-article",
        "Stacking context — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context",
      ),
      externalTopic(
        "responsive-design-container-queries",
        "Responsive Design & Container Queries",
        "Media queries respond to the viewport; container queries let a component respond to the size of its own parent instead.",
        "external-article",
        "CSS container queries — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries",
      ),
      externalTopic(
        "custom-properties-theming",
        "Custom Properties & Theming",
        "CSS variables (--*) — define a value once, reuse it everywhere, and swap a whole theme by changing it in one place.",
        "external-article",
        "Using CSS custom properties (variables) — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties",
      ),
      externalTopic(
        "pseudo-classes-pseudo-elements-has",
        "Selectors: Pseudo-classes & Pseudo-elements",
        ":hover/:focus target a state an element is already in; ::before/::after insert content that isn't part of the real DOM.",
        "external-article",
        "Pseudo-classes and pseudo-elements — MDN",
        "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Pseudo_classes_and_elements",
      ),
      externalTopic(
        "animation-performance",
        "Animation Performance",
        "Animating transform/opacity stays on the compositor thread; animating layout-affecting properties forces the browser to repaint every frame.",
        "external-article",
        "Animations and performance — web.dev",
        "https://web.dev/articles/animations-and-performance",
        { isOptional: true },
      ),
    ],
  },
  {
    slug: "javascript-in-depth",
    title: "JavaScript In Depth",
    topics: [
      externalTopic(
        "this-binding-execution-context",
        "this Binding & Execution Context",
        "The value of `this` is decided by how a function is called, not where it's defined — the single rule behind most `this`-related bugs.",
        "external-article",
        "this — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this",
      ),
      externalTopic(
        "prototypal-inheritance",
        "Prototypal Inheritance",
        "Every JS object has a hidden link to another object it inherits properties from — the prototype chain, not classical class-based inheritance.",
        "external-article",
        "Object — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object",
      ),
      externalTopic(
        "esm-vs-commonjs",
        "Modules: ESM vs. CommonJS",
        "import/export is the standardized, statically-analyzable module system; require()/module.exports is Node's older, dynamic one.",
        "external-article",
        "JavaScript modules — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules",
      ),
      externalTopic(
        "event-loop",
        "Event Loop",
        "How single-threaded JavaScript still handles thousands of concurrent I/O operations without blocking.",
        "external-article",
        "Concurrency model and Event Loop — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop",
      ),
      externalTopic(
        "promises-async-await",
        "Promises & Async/Await",
        "A Promise represents a value that isn't ready yet; async/await is just cleaner syntax for working with one.",
        "external-article",
        "Using promises — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises",
      ),
      externalTopic(
        "debouncing-throttling",
        "Debouncing & Throttling",
        "Two different ways to limit how often a function runs in response to a rapid-fire event like scroll or keystroke.",
        "external-article",
        "Debouncing and Throttling Explained Through Examples — CSS-Tricks",
        "https://css-tricks.com/debouncing-throttling-explained-examples/",
        { isOptional: true },
      ),
    ],
  },
  {
    slug: "testing",
    title: "Testing",
    topics: [
      externalTopic(
        "testing-vitest",
        "Vitest",
        "A Vite-native test runner — reuses your app's real Vite config instead of needing a separate transform pipeline.",
        "external-article",
        "Getting Started — Vitest",
        "https://vitest.dev/guide/",
      ),
      externalTopic(
        "end-to-end-testing",
        "Playwright",
        "Automating a real browser to test your app the way a user actually experiences it.",
        "external-article",
        "Getting started — Playwright",
        "https://playwright.dev/docs/intro",
      ),
      externalTopic(
        "testing-cypress",
        "Cypress",
        "An end-to-end testing tool built around watching tests run live in a real browser, step by step, as you write them.",
        "external-article",
        "Cypress Documentation",
        "https://docs.cypress.io/",
      ),
      externalTopic(
        "unit-testing-fundamentals",
        "Jest",
        "Writing small, automated tests that catch regressions before they reach production.",
        "external-article",
        "Getting Started — Jest",
        "https://jestjs.io/docs/getting-started",
      ),
    ],
  },
  {
    slug: "web-apis",
    title: "Web APIs",
    topics: [
      externalTopic(
        "storage-apis",
        "Storage APIs",
        "localStorage and sessionStorage — storing key/value data directly in the browser, no server round-trip needed.",
        "external-article",
        "Web Storage API — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API",
      ),
      externalTopic(
        "web-workers-concurrency",
        "Web Workers",
        "Runs a script on a background thread, so heavy computation doesn't block the main thread the UI runs on.",
        "external-article",
        "Web Workers API — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API",
      ),
    ],
  },
  {
    slug: "web-security",
    title: "Web Security",
    topics: [
      externalTopic(
        "cors-same-origin-policy",
        "CORS & the Same-Origin Policy",
        "The browser default that blocks a page from reading a response from a different origin, and the headers a server sends to explicitly allow it.",
        "external-article",
        "Cross-Origin Resource Sharing (CORS) — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS",
      ),
      externalTopic(
        "web-security-https",
        "HTTPS",
        "Encrypts traffic between browser and server — the baseline every other web security guarantee (cookies, CORS, mixed content) assumes is already in place.",
        "external-article",
        "HTTP — MDN (see the HTTPS/TLS section)",
        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview",
      ),
      externalTopic(
        "web-security-fundamentals",
        "Web Security Fundamentals",
        "XSS, CSRF, and CSP — the three attack classes and the one response header (Content-Security-Policy) most commonly used to defend against them.",
        "external-article",
        "Web security — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/Security",
      ),
      externalTopic(
        "web-security-owasp-top-10",
        "OWASP Top 10 Risks",
        "The industry-standard list of the most critical, most common web application security risks, updated from real-world data.",
        "external-article",
        "OWASP Top Ten",
        "https://owasp.org/www-project-top-ten/",
      ),
    ],
  },
  {
    slug: "type-checkers",
    title: "Type Checkers",
    topics: [
      externalTopic(
        "basic-types-inference",
        "Basic Types",
        "TypeScript's primitive types, and how much of a variable's type it can infer without ever being told explicitly.",
        "external-article",
        "The Basics — TypeScript",
        "https://www.typescriptlang.org/docs/handbook/2/basic-types.html",
      ),
      externalTopic(
        "interfaces-vs-type-aliases",
        "Interfaces vs. Type Aliases",
        "Two different syntaxes for naming an object shape — almost interchangeable, but an interface can be extended later and a type alias can't.",
        "external-article",
        "Object Types — TypeScript",
        "https://www.typescriptlang.org/docs/handbook/2/objects.html",
      ),
      externalTopic(
        "generics",
        "Generics",
        "A type-level placeholder that lets one function or component work correctly across many concrete types, not just one.",
        "external-article",
        "Generics — TypeScript",
        "https://www.typescriptlang.org/docs/handbook/2/generics.html",
      ),
      externalTopic(
        "type-narrowing",
        "Type Narrowing",
        "typeof checks, `in`, and other guards that let TypeScript deduce a more specific type than the one a variable was declared with.",
        "external-article",
        "Narrowing — TypeScript",
        "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
      ),
    ],
  },
  {
    slug: "web-frameworks",
    title: "Web Frameworks",
    topics: [
      externalTopic(
        "web-framework-nextjs",
        "Next.js",
        "The most widely used React meta-framework — file-based routing, server rendering, and API routes on top of React.",
        "external-article",
        "Next.js Docs",
        "https://nextjs.org/docs",
      ),
      externalTopic(
        "web-framework-nuxt",
        "Nuxt.js",
        "Vue's equivalent to Next.js — a full-stack framework wrapping Vue with routing, SSR, and conventions of its own.",
        "external-article",
        "Nuxt: The Full-Stack Vue Framework",
        "https://nuxt.com/",
      ),
      externalTopic(
        "web-framework-sveltekit",
        "SvelteKit",
        "Svelte's official application framework — routing, SSR, and static-site output built around Svelte components.",
        "external-article",
        "Introduction — SvelteKit Docs",
        "https://svelte.dev/docs/kit",
      ),
      externalTopic(
        "web-framework-astro",
        "Astro",
        "A content-first meta-framework that ships zero JavaScript by default, hydrating only the individual components that actually need interactivity.",
        "external-article",
        "Getting started — Astro Docs",
        "https://docs.astro.build/en/getting-started/",
      ),
    ],
  },
  externalTopic(
    "streaming-ssr-hydration",
    "Streaming SSR & Hydration",
    "The server sends real HTML immediately, then the client attaches interactivity to it in the background instead of rendering everything from scratch.",
    "external-article",
    "Server-side rendering (SSR) — MDN Glossary",
    "https://developer.mozilla.org/en-US/docs/Glossary/SSR",
  ),
  externalTopic(
    "ssg-overview",
    "Static Site Generation (SSG)",
    "Pre-rendering every page to plain HTML at build time, so a server never has to render anything on-demand per request.",
    "external-article",
    "Static site generator (SSG) — MDN Glossary",
    "https://developer.mozilla.org/en-US/docs/Glossary/SSG",
  ),
  {
    slug: "deployment",
    title: "Deployment",
    topics: [
      externalTopic(
        "deploy-github-pages",
        "GitHub Pages",
        "Free static hosting straight out of a GitHub repository — no separate hosting account needed.",
        "external-article",
        "GitHub Pages documentation",
        "https://docs.github.com/en/pages",
      ),
      externalTopic(
        "deploy-vercel",
        "Vercel",
        "Git-connected deploys with automatic preview URLs per pull request — built by the team behind Next.js.",
        "external-article",
        "Vercel Documentation",
        "https://vercel.com/docs",
      ),
      externalTopic(
        "deploy-netlify",
        "Netlify",
        "Git-connected static hosting and serverless functions, one of the original platforms built specifically for frontend deploys.",
        "external-article",
        "Netlify Docs",
        "https://docs.netlify.com/",
      ),
      externalTopic(
        "deploy-cloudflare-pages",
        "Cloudflare Pages",
        "Static hosting deployed onto Cloudflare's global edge network, with serverless Functions for any dynamic pieces.",
        "external-article",
        "Cloudflare Pages docs",
        "https://developers.cloudflare.com/pages/",
      ),
    ],
  },
  {
    slug: "browser-internals",
    title: "Browser Internals",
    topics: [
      externalTopic(
        "dom-vs-bom",
        "DOM vs. BOM",
        "The DOM is the page's content as a tree of objects; the BOM (window, navigator, location) is everything else the browser exposes around it.",
        "external-article",
        "Document Object Model (DOM) — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model",
      ),
      externalTopic(
        "event-delegation-bubbling-capturing",
        "Event Delegation, Bubbling & Capturing",
        "An event fired on a child element travels back up through every ancestor — the mechanism that lets one listener on a parent handle clicks from any of its children.",
        "external-article",
        "Event bubbling — MDN",
        "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling",
      ),
      externalTopic(
        "browser-rendering-pipeline",
        "Browser Rendering Pipeline",
        "Parse → style → layout → paint → composite — the pipeline a browser runs every time it turns HTML/CSS into pixels on screen.",
        "external-article",
        "How browsers work — web.dev",
        "https://web.dev/articles/howbrowserswork",
      ),
    ],
  },
  externalTopic(
    "component-driven-architecture",
    "Design Systems",
    "A shared library of reusable components and design tokens — the thing that keeps a product's UI consistent as more than one person builds it.",
    "external-article",
    "Atomic Design — Brad Frost",
    "https://atomicdesign.bradfrost.com/",
  ),
  {
    slug: "performance",
    title: "Performance",
    topics: [
      externalTopic(
        "image-asset-optimization",
        "Image & Asset Optimization",
        "Serving an image at the right format, size, and compression level for how it's actually displayed, instead of shipping the original file as-is.",
        "external-article",
        "Image performance — web.dev",
        "https://web.dev/learn/performance/image-performance",
      ),
      externalTopic(
        "bundle-size-code-splitting",
        "Bundle Size & Code Splitting",
        "Splitting a JS bundle into smaller chunks loaded on demand, instead of shipping the entire app's code on the very first page load.",
        "external-article",
        "Reduce JavaScript payloads with code splitting — web.dev",
        "https://web.dev/articles/reduce-javascript-payloads-with-code-splitting",
      ),
      externalTopic(
        "core-web-vitals",
        "Core Web Vitals",
        "LCP, INP, and CLS — Google's three standardized metrics for a page's real-world loading speed, responsiveness, and visual stability.",
        "external-article",
        "Web Vitals — web.dev",
        "https://web.dev/articles/vitals",
      ),
      externalTopic(
        "profiling-with-devtools",
        "Profiling with DevTools",
        "Recording a real page interaction and reading the resulting flame chart to find exactly which function is actually slow.",
        "external-article",
        "Analyze runtime performance — Chrome DevTools",
        "https://developer.chrome.com/docs/devtools/performance",
      ),
      externalTopic(
        "performance-budgets",
        "Performance Budgets",
        "A hard limit on a metric like total page weight or load time, enforced in CI so a page can't quietly get slower over time.",
        "external-article",
        "Performance budgets 101 — web.dev",
        "https://web.dev/articles/performance-budgets-101",
        { isOptional: true },
      ),
    ],
  },
  {
    slug: "web-components",
    title: "Web Components",
    topics: [
      externalTopic(
        "web-components-overview",
        "Web Components Overview",
        "Custom elements, Shadow DOM, and HTML templates — the browser-native way to ship reusable, encapsulated UI with no framework at all.",
        "external-article",
        "Web Components — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/API/Web_components",
      ),
      externalTopic(
        "web-components-custom-elements",
        "Custom Elements",
        "Defining your own HTML tags, backed by a JavaScript class, that behave like any other native element.",
        "external-article",
        "Using custom elements — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements",
      ),
      externalTopic(
        "web-components-shadow-dom",
        "Shadow DOM",
        "Attaches a private DOM subtree to an element, so its internal markup and styles can't leak into or collide with the rest of the page.",
        "external-article",
        "Using shadow DOM — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM",
      ),
    ],
  },
  {
    slug: "graphql",
    title: "GraphQL",
    topics: [
      externalTopic(
        "graphql-overview",
        "Learn GraphQL",
        "A query language for APIs — a client asks for exactly the fields it needs in one request, instead of shaping requests around fixed REST endpoints.",
        "external-article",
        "Learn GraphQL",
        "https://graphql.org/learn/",
      ),
      externalTopic(
        "graphql-apollo-client",
        "Apollo Client",
        "The most widely used GraphQL client for the frontend — normalized caching, and framework bindings for React, Vue, and Angular.",
        "external-article",
        "Introduction to Apollo Client",
        "https://www.apollographql.com/docs/react",
      ),
    ],
  },
  {
    slug: "accessibility",
    title: "Accessibility",
    topics: [
      externalTopic(
        "color-contrast-visual-accessibility",
        "Color Contrast & Visual Accessibility",
        "Text needs enough contrast against its background to be readable by people with low vision or color blindness — WCAG sets the minimum ratios.",
        "external-article",
        "Contrast and Color Accessibility — WebAIM",
        "https://webaim.org/articles/contrast/evaluating",
      ),
      externalTopic(
        "keyboard-navigation-focus-management",
        "Keyboard Navigation & Focus Management",
        "Every interactive element needs to be reachable and operable with only a keyboard — no mouse assumed.",
        "external-article",
        "Keyboard-navigable JavaScript widgets — MDN",
        "https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets",
      ),
      externalTopic(
        "accessible-forms",
        "Accessible Forms",
        "A <label> tied to its input is the single most impactful accessibility fix a form can have — screen readers announce it, sighted users get a bigger click target.",
        "external-article",
        "HTML: A good basis for accessibility — MDN",
        "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML",
      ),
      externalTopic(
        "automated-a11y-testing",
        "Automated a11y Testing",
        "Tools like axe-core catch a real, meaningful chunk of accessibility issues automatically — but never all of them; manual testing still matters.",
        "external-article",
        "Axe-core Documentation — Deque",
        "https://www.deque.com/axe/core-documentation/",
      ),
    ],
  },
  externalTopic(
    "service-workers-caching-strategies",
    "PWAs",
    "A service worker running in the background is what lets a web app cache assets, work offline, and be installed to a home screen like a native app.",
    "external-article",
    "Service Worker API — MDN",
    "https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API",
  ),
  {
    slug: "desktop-apps",
    title: "Desktop Apps",
    topics: [
      externalTopic(
        "desktop-electron",
        "Electron",
        "Ships a full Chromium + Node.js runtime alongside your app, so any web app can become a cross-platform desktop app.",
        "external-article",
        "Introduction — Electron",
        "https://www.electronjs.org/docs/latest",
      ),
      externalTopic(
        "desktop-tauri",
        "Tauri",
        "Uses the OS's own native webview instead of bundling Chromium, producing a much smaller desktop binary than Electron's.",
        "external-article",
        "What is Tauri?",
        "https://v2.tauri.app/start/",
      ),
    ],
  },
  {
    slug: "mobile-apps",
    title: "Mobile Apps",
    topics: [
      externalTopic(
        "mobile-react-native",
        "React Native",
        "Write in React, render to real native iOS/Android UI components instead of a webview.",
        "external-article",
        "React Native Docs",
        "https://reactnative.dev/",
      ),
      externalTopic(
        "mobile-flutter",
        "Flutter",
        "Google's cross-platform toolkit — one Dart codebase compiles to native mobile, desktop, and web.",
        "external-article",
        "Flutter documentation",
        "https://docs.flutter.dev/",
      ),
      externalTopic(
        "mobile-ionic",
        "Ionic",
        "Cross-platform mobile apps built from regular web technology (HTML/CSS/JS) wrapped in a native shell.",
        "external-article",
        "Introduction to Ionic",
        "https://ionicframework.com/docs",
      ),
    ],
  },
];

// Single column, not the old 2/3-column canvas split — the flow diagram
// reads nodes in one continuous top-to-bottom spine now, and positionX/Y
// only need to produce a correct read order (via getRoadmapDetail's
// column-major sort), not real 2D canvas coordinates anymore.
const FRONTEND_DEVELOPER_NODES: RoadmapNodeSeed[] = layoutColumns([FRONTEND_DEVELOPER_ENTRIES]);

// ── Frontend Interview Cracking role roadmap ────────────────────────────────
// A second, deliberately different role roadmap from Frontend Developer
// above — that one is a pure roadmap.sh mirror (100% external links, no FF
// content at all, direct user request). This one is the opposite: a guided
// tour of Frontend Forever's own platform, linking to a real Learn concept,
// Practice challenge, or FF Collections question everywhere one exists, and
// a same-site page (via the "internal-page" link type) everywhere the
// content is real but has no DB row of its own (Playbook chapters, System
// Design guides, Company Guides, Study Plans, UI Battles, Experiments).
const FRONTEND_INTERVIEW_CRACKING_ENTRIES: RoadmapEntry[] = [
  {
    slug: "learn-the-fundamentals",
    title: "Learn the Fundamentals",
    topics: [
      learnCategoryTopic("javascript-runtime"),
      learnCategoryTopic("browser-internals"),
      learnCategoryTopic("react"),
      learnCategoryTopic("css"),
      learnCategoryTopic("typescript"),
      learnCategoryTopic("accessibility"),
      learnCategoryTopic("performance"),
      learnCategoryTopic("system-design"),
    ],
  },
  {
    slug: "practice-what-you-learn",
    title: "Practice What You Learn",
    topics: [
      practiceChallengeTopic(
        "practice-javascript",
        "JavaScript Coding Questions",
        "Real coding challenges, run in a live editor with real test cases — not multiple-choice trivia.",
        "improve-full-name-formatter",
      ),
      practiceChallengeTopic(
        "practice-react",
        "React Coding Questions",
        "Build and fix real React components under the same constraints an interview whiteboard round gives you.",
        "react-counter-app",
      ),
      practiceChallengeTopic(
        "practice-css",
        "CSS Questions",
        "The specific CSS quirks ('why is my box wider than I set it') that trip people up in real interviews.",
        "box-sizing-content-vs-border",
      ),
      practiceChallengeTopic(
        "practice-typescript",
        "TypeScript Puzzles",
        "Implement TypeScript's own utility types by hand — the fastest way to actually understand what they do.",
        "implement-partial",
      ),
      practiceChallengeTopic(
        "practice-system-design",
        "Front-End System Design Questions",
        "Component-level system design — state, data flow, and architecture, not distributed-systems trivia.",
        "nested-checkboxes-tree-state",
      ),
    ],
  },
  {
    slug: "ace-the-interview",
    title: "Ace the Interview",
    topics: [
      interviewQuestionTopic(
        "ff-javascript",
        "FF JavaScript Collection",
        "101 real JavaScript interview questions with full written answers, not just a question bank.",
        "what-is-the-event-loop",
      ),
      interviewQuestionTopic(
        "ff-react",
        "FF React Collection",
        "99 React-specific interview questions, kept current with how React is actually written today.",
        "usememo-when-to-use",
      ),
      interviewQuestionTopic(
        "ff-nextjs",
        "FF Next.js Collection",
        "99 Next.js interview questions covering the App Router, rendering strategies, and the Pages-Router history interviewers still ask about.",
        "incremental-static-regeneration",
      ),
      internalPageTopic(
        "company-guides",
        "Company Guides",
        "Real, company-tagged interview questions and challenges, organized by the company that actually asked them.",
        "Company Guides — Frontend Forever",
        "/interview-prep/company-guides",
      ),
      internalPageTopic(
        "study-plans",
        "Study Plans",
        "A day-by-day itinerary across Learn, Practice, and FF Collections for whoever has 1 week, 1 month, or 3 months before an interview.",
        "Study Plans — Frontend Forever",
        "/interview-prep/study-plans",
      ),
    ],
  },
  {
    // Was 3 branches, each a single specific system-design guide — same
    // narrow-item problem as the old Learn branches. There's also no
    // per-section deep link on the real index page (it's one page grouping
    // 28 guides under 5 dynamic section headings), so multiple branches
    // would just repeat the same URL. One branch, to the real index.
    slug: "master-system-design",
    title: "Master System Design",
    topics: [
      internalPageTopic(
        "system-design-guides",
        "Front-End System Design Guides",
        "28 real front-end system design problems — infinite-scroll feeds, real-time collaboration, media players, offline sync — worked through requirements to trade-offs, not abstract distributed-systems trivia.",
        "FF System Design — Frontend Forever",
        "/interview-prep/ff-system-design",
      ),
    ],
  },
  {
    // Was 2 branches into individual chapters of 2 of the 6 playbooks — now
    // one branch per playbook, linking each to its own index/chapter-list
    // page rather than one specific chapter, driven directly off the real
    // PLAYBOOK_SLUGS/PLAYBOOK_META so this can't drift from what the site
    // actually has.
    slug: "read-the-playbook",
    title: "Read the Playbook",
    topics: PLAYBOOK_SLUGS.map((playbookSlug) =>
      internalPageTopic(
        `playbook-${playbookSlug}`,
        PLAYBOOK_META[playbookSlug].label,
        PLAYBOOK_META[playbookSlug].description,
        `${PLAYBOOK_META[playbookSlug].label} — Playbook`,
        `/interview-prep/playbook/${playbookSlug}`,
      ),
    ),
  },
  {
    slug: "sharpen-your-skills-in-the-playground",
    title: "Sharpen Your Skills in the Playground",
    topics: [
      internalPageTopic(
        "playground-ui-battles",
        "UI Battles",
        "Recreate a real UI pixel-for-pixel from a screenshot, then compare your result against the official solution side by side.",
        "Login Card — UI Battles",
        "/playground/battles/login-card-recreate",
      ),
      internalPageTopic(
        "playground-experiments",
        "Experiments",
        "Playable, open-source visual demos — canvas, animation, and interaction experiments with real, readable source code.",
        "Particle Cursor Trail — Experiments",
        "/playground/experiments/particle-cursor-trail",
      ),
    ],
  },
];

const FRONTEND_INTERVIEW_CRACKING_NODES: RoadmapNodeSeed[] = layoutColumns([
  FRONTEND_INTERVIEW_CRACKING_ENTRIES,
]);

export const ROADMAPS: RoadmapSeed[] = [
  {
    // Slug kept as-is (renaming would orphan the old row — seed.ts upserts
    // roadmaps by slug and never prunes at the roadmap level, only within a
    // roadmap's own nodes) — only the display title changed, per direct
    // user request. orderIndex 1 puts this first in the role-based section,
    // ahead of Frontend Developer below.
    slug: "frontend-interview-cracking",
    title: "Frontend Forever Roadmap",
    description:
      "A guided tour of Frontend Forever itself — Learn concepts, real Practice challenges, FF Collections interview questions, System Design guides, the Playbook, and the Playground, in the order that actually gets you interview-ready.",
    roadmapType: "role",
    orderIndex: 1,
    nodes: FRONTEND_INTERVIEW_CRACKING_NODES,
  },

  {
    slug: "frontend-developer",
    title: "Frontend Developer Roadmap",
    description:
      "Step-by-step guide to becoming a job-ready frontend developer — from how the internet works to modern frameworks, tooling, and interview prep.",
    roadmapType: "role",
    orderIndex: 2,
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
