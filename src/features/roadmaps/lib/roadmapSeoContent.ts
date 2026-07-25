// Per-roadmap SEO/GEO content — answer-first intro paragraph + FAQ, same
// authoring rule as Feature 31's collection questions (the first sentence
// must stand alone as a citable answer). Keyed by roadmap slug; a slug with
// no entry here just renders no intro/FAQ section, same graceful-omission
// pattern as everything else in this codebase.
export type RoadmapSeoContent = {
  intro: string;
  faqs: { question: string; answer: string }[];
};

export const ROADMAP_SEO_CONTENT: Record<string, RoadmapSeoContent> = {
  "frontend-developer": {
    intro:
      "Becoming a frontend developer means learning how the web works end to end, then specializing in HTML, CSS, and JavaScript to build the interfaces users actually interact with. This roadmap lays out that path in order, from internet fundamentals through to the tools and frameworks used on a real team.",
    faqs: [
      {
        question: "How long does it take to become a frontend developer?",
        answer:
          "Most self-taught learners reach a job-ready level in 6 to 12 months of consistent, focused practice — faster with prior programming experience, slower if you're learning alongside a full-time job. The roadmap above is ordered so each topic builds on the last, which matters more for retention than total hours logged.",
      },
      {
        question: "Do I need a computer science degree to become a frontend developer?",
        answer:
          "No. Frontend development is one of the more accessible paths into tech precisely because hiring tends to weigh a strong portfolio and demonstrated problem-solving over formal credentials. A CS degree helps with algorithms and computer-science fundamentals, but most day-to-day frontend work draws on HTML/CSS/JavaScript skill and product sense that a degree doesn't specifically teach.",
      },
      {
        question: "Should I learn a framework like React before JavaScript?",
        answer:
          "No — learn core JavaScript first. Every popular frontend framework is JavaScript underneath, and skipping straight to a framework tends to produce developers who can copy patterns but can't debug what's actually happening. This roadmap places JavaScript and CSS fundamentals ahead of any framework for that reason.",
      },
    ],
  },

  javascript: {
    intro:
      "JavaScript is the programming language that runs in every web browser, making pages interactive rather than static documents. This roadmap moves through its runtime model in difficulty order — from hoisting and closures up through generators and memory management — the same sequence Frontend Forever's own JavaScript Runtime concepts use.",
    faqs: [
      {
        question: "Is JavaScript hard to learn?",
        answer:
          "The basic syntax is approachable — most people can write simple JavaScript within a few days. What takes longer is its runtime model (closures, the event loop, asynchronous code), which behaves differently from most other languages and is where this roadmap spends most of its depth.",
      },
      {
        question: "Do I need to learn JavaScript before CSS, or the other way around?",
        answer:
          "Neither strictly depends on the other, so it's reasonable to learn them in parallel — CSS controls how a page looks, JavaScript controls how it behaves. Most learners find it easier to get comfortable with static HTML/CSS layout first, then layer JavaScript's interactivity and runtime concepts on top.",
      },
    ],
  },

  css: {
    intro:
      "CSS controls how a web page looks — layout, spacing, color, typography, and motion. This roadmap moves from the box model and the cascade, both foundational to everything else in CSS, through to modern layout systems and advanced selectors.",
    faqs: [
      {
        question: "Is CSS considered a programming language?",
        answer:
          "No — CSS is a declarative styling language, not a programming language. It has no variables in the traditional sense (though custom properties come close), no loops, and no conditionals; you describe what a page should look like, not the steps to compute it.",
      },
      {
        question: "Should I learn Flexbox or Grid first?",
        answer:
          "Flexbox first. It solves one-dimensional layout problems (a row or a column) and comes up constantly in everyday UI work, which makes it the more immediately useful skill. Grid handles two-dimensional layout and is worth learning right after — this roadmap places them back to back for that reason.",
      },
    ],
  },

  react: {
    intro:
      "React is a JavaScript library for building user interfaces out of reusable components. This roadmap starts with JSX and the virtual DOM, moves through the hooks that manage state and side effects, and finishes with the performance and architecture concerns that separate a working React app from a well-built one.",
    faqs: [
      {
        question: "Do I need to know JavaScript well before learning React?",
        answer:
          "Yes — React is JavaScript, not a separate language, so gaps in your JavaScript fundamentals (closures, array methods, async/await) will surface as confusing React bugs rather than obvious JavaScript ones. This platform's own JavaScript Roadmap is a reasonable prerequisite pass before this one.",
      },
      {
        question: "Is React still worth learning?",
        answer:
          "Yes — React remains the most widely used frontend framework in production, with the largest hiring demand and ecosystem of any single framework. Its core ideas (component composition, unidirectional data flow, hooks) also transfer directly to reading and understanding other frameworks.",
      },
    ],
  },

  typescript: {
    intro:
      "TypeScript adds a static type system on top of JavaScript, catching a category of bugs at compile time that JavaScript only surfaces at runtime. This roadmap starts with basic types and inference, then builds up through generics and utility types to the advanced type-level patterns used in real production codebases.",
    faqs: [
      {
        question: "Is TypeScript worth learning if I already know JavaScript?",
        answer:
          "Yes — TypeScript is a superset of JavaScript, so everything you already know still applies; you're adding a type layer, not learning a new language. Most mid-to-large frontend codebases use TypeScript today, and the type system catches real classes of bugs (wrong argument order, null/undefined access) before code ever runs.",
      },
      {
        question: "How long does it take to learn TypeScript if I know JavaScript?",
        answer:
          "The basics — annotating variables, functions, and interfaces — take most JavaScript developers a few days to become comfortable with. Generics and the more advanced type-level patterns (conditional types, mapped types) take longer to feel natural, which is why this roadmap places them last.",
      },
    ],
  },
};
