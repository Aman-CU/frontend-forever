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

// Either a full section (a non-clickable spine label with branch topics) or
// a bare topic placed directly on the spine with no branches of its own —
// roadmap.sh's real page mixes both (e.g. "Auth Strategies"/"Web APIs"/
// "PWAs" are plain clickable spine boxes with no dotted-line children at
// all, unlike "Version Control" or "Testing", which branch out).
type RoadmapEntry = SectionSpec | TopicSpec;

function isSection(entry: RoadmapEntry): entry is SectionSpec {
  return "topics" in entry;
}

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
      conceptTopic("the-network-stack"),
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
      conceptTopic("aria-roles-and-semantic-html"),
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
    slug: "react-fundamentals",
    title: "React Fundamentals",
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
    topics: [conceptTopic("storage-apis"), conceptTopic("web-workers-concurrency")],
  },
  {
    slug: "web-security",
    title: "Web Security",
    topics: [
      conceptTopic("cors-same-origin-policy"),
      externalTopic(
        "web-security-https",
        "HTTPS",
        "Encrypts traffic between browser and server — the baseline every other web security guarantee (cookies, CORS, mixed content) assumes is already in place.",
        "external-article",
        "HTTP — MDN (see the HTTPS/TLS section)",
        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview",
      ),
      conceptTopic("web-security-fundamentals"),
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
      conceptTopic("basic-types-inference"),
      conceptTopic("interfaces-vs-type-aliases"),
      conceptTopic("generics"),
      conceptTopic("utility-types"),
      conceptTopic("type-narrowing"),
      conceptTopic("discriminated-unions"),
      conceptTopic("conditional-mapped-types", { isOptional: true }),
      conceptTopic("template-literal-branded-types", { isOptional: true }),
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
  conceptTopic("streaming-ssr-hydration"),
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
      conceptTopic("dom-vs-bom"),
      conceptTopic("event-delegation-bubbling-capturing"),
      conceptTopic("browser-rendering-pipeline"),
    ],
  },
  conceptTopic("component-driven-architecture"),
  {
    slug: "performance",
    title: "Performance",
    topics: [
      conceptTopic("image-asset-optimization"),
      conceptTopic("bundle-size-code-splitting"),
      conceptTopic("core-web-vitals"),
      conceptTopic("profiling-with-devtools"),
      conceptTopic("performance-budgets", { isOptional: true }),
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
      conceptTopic("color-contrast-visual-accessibility"),
      conceptTopic("keyboard-navigation-focus-management"),
      conceptTopic("accessible-forms"),
      conceptTopic("automated-a11y-testing"),
    ],
  },
  conceptTopic("service-workers-caching-strategies"),
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
