export type ChangelogEntry = {
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
};

// Real, dated entries — each traces back to an actual merged PR (see `git log
// --merges`), written in user-facing language rather than this project's
// internal dev-log tone (progress-tracker.md). Newest first. Internal-only
// merges (auth/DB/Redis setup, data-layer hardening, chore/docs syncs) are
// deliberately left out — nothing for a user to see changed from those.
export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    date: "2026-07-29",
    title: "Streaks, a real Dashboard, and a redesigned Settings",
    description:
      "A GitHub-style activity calendar and milestone celebrations for your daily streak, a new Dashboard with your level, weekly rank, and activity at a glance, and Settings rebuilt as a proper overlay.",
  },
  {
    date: "2026-07-27",
    title: "Leaderboard",
    description: "See how your XP stacks up against everyone else, weekly, monthly, or all-time.",
  },
  {
    date: "2026-07-27",
    title: "Roadmap detail pages",
    description: "Visual, step-by-step flow diagrams for each learning roadmap.",
  },
  {
    date: "2026-07-26",
    title: "Roadmaps",
    description: "Structured, ordered paths through the curriculum for a handful of common goals.",
  },
  {
    date: "2026-07-25",
    title: "Playground: Experiments gallery",
    description: "A gallery of small, self-contained front-end experiments to poke at and learn from.",
  },
  {
    date: "2026-07-24",
    title: "Playground: UI Battles",
    description: "Recreate real UI components from a design brief in a live 3-pane code editor.",
  },
  {
    date: "2026-07-22",
    title: "Lightning Prep",
    description: "A fast-paced rapid-fire mode for drilling interview questions under time pressure.",
  },
  {
    date: "2026-07-20",
    title: "Interview Prep Playbook",
    description: "Long-form written guides for interview strategy, negotiation, and process.",
  },
  {
    date: "2026-07-19",
    title: "FF System Design guides",
    description: "27 original system design write-ups, from fundamentals through real-world case studies.",
  },
  {
    date: "2026-07-17",
    title: "Spaced repetition review",
    description: "A Review Queue that resurfaces interview questions right when you're about to forget them.",
  },
  {
    date: "2026-07-15",
    title: "FF Interview Collections",
    description: "Curated JavaScript, React, and Next.js interview question sets, organized by topic.",
  },
  {
    date: "2026-07-14",
    title: "Interview Prep hub",
    description: "A home base for every interview-prep collection, playbook, and guide in one place.",
  },
  {
    date: "2026-07-13",
    title: "Practice challenge editor",
    description: "A real code editor for practice challenges, with test running and a discussion tab.",
  },
  {
    date: "2026-07-12",
    title: "Practice Hub",
    description: "Coding challenges organized by topic and difficulty, with your progress tracked.",
  },
  {
    date: "2026-07-10",
    title: "System Design concepts",
    description: "A full concept category dedicated to system design fundamentals.",
  },
  {
    date: "2026-07-08",
    title: "Accessibility & Performance concepts",
    description: "Two more concept categories: writing accessible UI, and making it fast.",
  },
  {
    date: "2026-07-06",
    title: "React, CSS & TypeScript concepts",
    description: "Three more concept categories added to the curriculum.",
  },
  {
    date: "2026-07-06",
    title: "JavaScript Runtime & Browser Internals concepts",
    description: "The first two concept categories: how JavaScript actually runs, and what the browser is doing underneath it all.",
  },
  {
    date: "2026-07-05",
    title: "XP & progress tracking",
    description: "Every concept, challenge, and question you complete now earns real XP and tracks your progress.",
  },
  {
    date: "2026-07-02",
    title: "Learn page: Build & Interview tabs",
    description: "Two more tabs on every concept page: a hands-on build exercise, and real interview questions.",
  },
  {
    date: "2026-06-30",
    title: "Learn page: Challenge tab",
    description: "A short coding challenge attached to every concept, right where you're learning it.",
  },
  {
    date: "2026-06-29",
    title: "Learn page: Understand & Simulate tabs",
    description: "In-depth explanations plus interactive simulators built into every concept page.",
  },
  {
    date: "2026-06-28",
    title: "Learn",
    description: "The Learn section launches: browse every concept category and open a concept page.",
  },
  {
    date: "2026-06-23",
    title: "Accounts & login",
    description: "Sign in with Google or GitHub — your progress, streak, and XP are now yours to keep.",
  },
  {
    date: "2026-06-21",
    title: "Interactive simulators",
    description:
      "Four visual simulators for the event loop, React rendering, the browser pipeline, and CSS specificity.",
  },
  {
    date: "2026-06-17",
    title: "Frontend Forever launches",
    description: "The homepage, design system, and the very first version of the site go live.",
  },
];
