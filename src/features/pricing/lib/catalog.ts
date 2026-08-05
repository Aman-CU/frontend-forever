import {
  BookOpen,
  Building2,
  CalendarCheck,
  Code2,
  Layers,
  LineChart,
  Network,
  RefreshCw,
  Repeat,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Feature 38 Stage 9 — what Premium actually contains, in numbers.
//
// Every figure below was counted against the live database / content tree on
// 2026-08-05, not estimated:
//   interview questions  select count(*) from collection_questions            -> 299
//                        (ff-javascript 101, ff-react 99, ff-nextjs 99)
//   FF 75                ...where is_ff75                                     -> 75 (all premium)
//   coding challenges    select count(*) from challenges                      -> 436
//   concepts             select count(*) from concepts                        -> 76
//   system design guides ls content/interview-prep/system-design/*.mdx        -> 28
//   playbooks/chapters   content/interview-prep/playbook/*/                   -> 6 / 38
//   study plans          select count(*) from study_plans                     -> 3
//   roadmaps             select count(*) from roadmaps                        -> 6
//   companies            COMPANIES in features/interview-prep/lib             -> 32
//   simulators           src/features/simulators/*                            -> 4
//
// FF 75 is not a fourth collection — it's an `is_ff75` flag overlaying the
// three, marking a curated 75-question subset. Every one of those 75 is
// premium, which makes it the single clearest thing Premium buys, so it leads
// the unlock list below.
//
// Counts are stated exactly rather than rounded up. Deliberately NOT claimed
// anywhere on this page: UI Battles — only 2 exist, and selling a catalogue
// of two would be overstating it.
export const CATALOG = {
  interviewQuestions: 299,
  ff75Questions: 75,
  codingChallenges: 436,
  concepts: 76,
  systemDesignGuides: 28,
  playbooks: 6,
  playbookChapters: 38,
  studyPlans: 3,
  roadmaps: 6,
  companies: 32,
  simulators: 4,
} as const;

// The shared "what your money unlocks" list. Identical on every plan card by
// design — one premium flag means every plan really does unlock the same
// thing, and pretending otherwise would be a tier ladder the gating layer
// can't enforce (see plans.ts).
export const PREMIUM_INCLUDES: string[] = [
  `The complete FF ${CATALOG.ff75Questions} — our curated set of the ${CATALOG.ff75Questions} questions worth knowing cold`,
  `All ${CATALOG.interviewQuestions} interview questions across FF JavaScript, React and Next.js`,
  `All ${CATALOG.codingChallenges} coding challenges with official solutions`,
  `Every locked concept's Simulate, Challenge, Interview and Build tabs`,
  `All ${CATALOG.systemDesignGuides} frontend system design guides`,
  `Company-tagged questions and filtering across ${CATALOG.companies} companies`,
  `All ${CATALOG.studyPlans} guided study plans — 1 week, 1 month and 3 months`,
  "The Build in Public & Open Source playbook, all chapters",
  "New premium content as it ships",
];

// The three subscription cards show these four rather than all eight.
//
// Every plan unlocks identical content, so printing the same eight bullets on
// four cards adds a screen and a half of scrolling (mobile went from ~8k to
// 12.4k pixels tall) while telling the reader nothing new by the second
// repeat. The Lifetime card above them carries the full itemised list, and
// each card links back to it — so nothing is hidden, it's just said once.
export const PREMIUM_INCLUDES_HIGHLIGHTS = PREMIUM_INCLUDES.slice(0, 4);

export const PREMIUM_INCLUDES_REMAINDER =
  PREMIUM_INCLUDES.length - PREMIUM_INCLUDES_HIGHLIGHTS.length;

export type PlatformFeature = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

// The "what you actually get" grid. Each entry describes something that
// genuinely exists in this codebase today — no roadmap items dressed up as
// shipped features.
export const PLATFORM_FEATURES: PlatformFeature[] = [
  {
    id: "simulators",
    title: "Concepts you can watch run",
    description: `${CATALOG.simulators} interactive simulators — event loop, React rendering, browser pipeline and CSS specificity — step through the behaviour instead of describing it.`,
    icon: Layers,
  },
  {
    id: "question-bank",
    title: "A question bank worth the name",
    description: `${CATALOG.interviewQuestions} written interview questions and ${CATALOG.codingChallenges} coding challenges, each with a real solution rather than a one-line answer key — including the curated FF ${CATALOG.ff75Questions}.`,
    icon: BookOpen,
  },
  {
    id: "workspace",
    title: "In-browser coding workspace",
    description:
      "Solve challenges in a real editor with instant test feedback, running in a sandboxed iframe. Nothing to install, nothing to configure.",
    icon: Code2,
  },
  {
    id: "system-design",
    title: "Frontend system design",
    description: `${CATALOG.systemDesignGuides} full guides — chat apps, autocomplete, feeds, dashboards — with the diagrams and trade-offs interviewers actually probe.`,
    icon: Network,
  },
  {
    id: "companies",
    title: "Company-tagged questions",
    description: `See which of the ${CATALOG.companies} companies we track have asked a question, and filter the whole catalogue down to the one you're interviewing at.`,
    icon: Building2,
  },
  {
    id: "study-plans",
    title: "Preparation plans that fit your timeline",
    description:
      "1 week, 1 month or 3 months — each a day-by-day itinerary through concepts, challenges and questions, not a reading list.",
    icon: CalendarCheck,
  },
  {
    id: "spaced-repetition",
    title: "Spaced repetition built in",
    description:
      "Questions you rate as shaky come back on a real SM-2 schedule, so revision targets what you're actually likely to forget.",
    icon: Repeat,
  },
  {
    id: "playbooks",
    title: "Interview playbooks",
    description: `${CATALOG.playbooks} playbooks across ${CATALOG.playbookChapters} chapters — resumes, behavioural rounds, system design and building in public.`,
    icon: LineChart,
  },
  {
    id: "updates",
    title: "Free continuous updates",
    description:
      "New questions, challenges and guides land regularly. While your access is active, everything new is already included.",
    icon: RefreshCw,
  },
];
