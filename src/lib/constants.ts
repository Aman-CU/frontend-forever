// Canonical value sets for text-as-enum columns.
// Every API route, Server Action, and schema CHECK constraint uses these —
// never inline the strings directly.

export const CONCEPT_TABS = [
  "understand",
  "simulate",
  "challenge",
  "interview",
  "build",
] as const;
export type ConceptTab = (typeof CONCEPT_TABS)[number];

export const CONCEPT_CATEGORIES = [
  "javascript-runtime",
  "browser-internals",
  "react",
  "css",
  "typescript",
  "accessibility",
  "performance",
  "system-design",
] as const;
export type ConceptCategory = (typeof CONCEPT_CATEGORIES)[number];

export const CONCEPT_DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export type ConceptDifficulty = (typeof CONCEPT_DIFFICULTIES)[number];

export const CHALLENGE_DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type ChallengeDifficulty = (typeof CHALLENGE_DIFFICULTIES)[number];

export const INTERVIEW_COLLECTIONS = [
  "ff-75",
  "ff-javascript",
  "ff-react",
  "ff-system-design",
] as const;
export type InterviewCollection = (typeof INTERVIEW_COLLECTIONS)[number];

// Feature 30/31's own standalone Q&A content (collection_questions table) —
// distinct from INTERVIEW_COLLECTIONS above, which belongs to the older,
// concept-scoped interview_questions table already live on Learn's Interview
// tabs. "ff-75" isn't a value here — it's the isFf75 flag on this table
// instead (see build-plan.md, Feature 31). "ff-system-design" isn't here
// either — its content lives on a different page template (Feature 49),
// not in this table at all.
export const COLLECTION_QUESTION_COLLECTIONS = ["ff-javascript", "ff-react", "ff-nextjs"] as const;
export type CollectionQuestionCollection = (typeof COLLECTION_QUESTION_COLLECTIONS)[number];

// Feature 50's 5 Playbook slugs (build-plan.md, Phase 6). Content is
// filesystem MDX (lib/playbookGuides.ts), not a DB table — this constant
// exists purely to CHECK-constrain playbook_reads.playbook_slug below.
export const PLAYBOOK_SLUGS = [
  "frontend-interview-playbook",
  "react-interview-playbook",
  "behavioural-interview-playbook",
  "frontend-system-design-playbook",
  "frontend-resume-playbook",
  "build-in-public-playbook",
] as const;
export type PlaybookSlug = (typeof PLAYBOOK_SLUGS)[number];

export const XP_EVENT_TYPES = [
  "concept_understand",
  "concept_simulate",
  "concept_challenge",
  "concept_interview",
  "concept_build",
  "concept_completed",
  "challenge_solved",
  "interview_answered",
  "streak_bonus",
] as const;
export type XPEventType = (typeof XP_EVENT_TYPES)[number];

export const CHALLENGE_STATUSES = ["passed", "failed"] as const;
export type ChallengeStatus = (typeof CHALLENGE_STATUSES)[number];

// Feature 51's 3 Study Plans (build-plan.md, Phase 6). Content (the actual
// day/week itinerary) is real DB rows (study_plans/study_plan_items) — unlike
// Playbook/System Design, this isn't filesystem content, since a plan is a
// curated sequence of links rather than long-form prose.
export const STUDY_PLAN_SLUGS = ["1-week", "1-month", "3-months"] as const;
export type StudyPlanSlug = (typeof STUDY_PLAN_SLUGS)[number];

// What kind of content a study_plan_items row points at — used only to pick
// which existing table (if any) to check for a live per-user completion
// checkmark. Not a foreign key: "playbook-chapter"/"system-design-guide"
// content lives on the filesystem with no DB row to reference, and
// "collection"/"ff75"/"company-guide" items point at a whole browse page,
// not one row. See study_plan_items.ref_id for the parseable slug composite.
export const STUDY_PLAN_ITEM_TYPES = [
  "concept",
  "practice-category",
  "collection",
  "playbook-chapter",
  "system-design-guide",
  "review-session",
  "company-guide",
] as const;
export type StudyPlanItemType = (typeof STUDY_PLAN_ITEM_TYPES)[number];

// XP System (context/architecture.md → XP System table). Every tab-completion
// POST to /api/progress reads its reward from here — never inline an XP amount.
export const TAB_XP_REWARDS: Record<ConceptTab, number> = {
  understand: 10,
  simulate: 15,
  challenge: 25,
  interview: 20,
  build: 30,
};

export const TAB_XP_EVENT_TYPE: Record<ConceptTab, XPEventType> = {
  understand: "concept_understand",
  simulate: "concept_simulate",
  challenge: "concept_challenge",
  interview: "concept_interview",
  build: "concept_build",
};

export const CONCEPT_COMPLETED_BONUS_XP = 50;
export const STREAK_BONUS_XP = 5;
// Awarded once, on a user's first-ever passing submission for a given
// Practice challenge (Feature 29). Deliberately below TAB_XP_REWARDS.challenge
// (25) — Practice has ~620 standalone challenges vs. ~76 Learn concepts, so
// paying the same rate would let grinding badly out-earn the Learn track.
export const CHALLENGE_SOLVED_XP = 10;

// Awarded on every rating made inside Feature 32's dedicated spaced-repetition
// review session (features/interview-prep/spaced-repetition) — not gated to
// a first answer, since repeat review is the point of spaced repetition.
// Ratings made from Learn's Interview tab (Feature 25, /api/interview-rating)
// deliberately do NOT award this — that tab already has its own separate
// 20 XP tab-completion reward (TAB_XP_REWARDS.interview), so awarding this too
// would double-reward the same rating action two different ways.
export const INTERVIEW_ANSWERED_XP = 10;

// Feature 34/35's rescoped Roadmaps (build-plan.md, Phase 7). "role" is a
// full job-role path (e.g. Frontend Developer) mixing internal + external
// links; "skill" is a single-technology deep dive that maps onto one of
// CONCEPT_CATEGORIES and is almost entirely internal-linked. Drives the
// Role-based / Skill-based grouping on the /roadmaps list page, same visual
// split as roadmap.sh's own homepage.
export const ROADMAP_TYPES = ["role", "skill"] as const;
export type RoadmapType = (typeof ROADMAP_TYPES)[number];

// A roadmap_node is either a non-clickable grouping header ("section") or a
// real topic box on the canvas ("topic"). Sections have no links of their own.
export const ROADMAP_NODE_TYPES = ["section", "topic"] as const;
export type RoadmapNodeType = (typeof ROADMAP_NODE_TYPES)[number];

// What a roadmap_node_links row points at. Practice/Interview content is
// mostly standalone (challenges.conceptId and collection_questions have no
// reliable concept link — see content.ts), so these are hand-curated per
// node rather than derived from a shared concept_id.
// Feature 36's Leaderboard filter tabs. "all-time" ranks by profiles.xp
// directly; "week"/"month" rank by a live sum over xp_events scoped to the
// current UTC calendar week (Monday start) / calendar month — see
// features/leaderboard/lib/dateRanges.ts.
export const LEADERBOARD_RANGES = ["all-time", "week", "month"] as const;
export type LeaderboardRange = (typeof LEADERBOARD_RANGES)[number];

export const ROADMAP_NODE_LINK_TYPES = [
  "learn-concept",
  "practice-challenge",
  "interview-question",
  "external-video",
  "external-article",
  // A same-site FF page with no dedicated DB row to link against —
  // Playbook chapters, System Design guides, Study Plans, UI Battles, and
  // Experiments are filesystem/registry content, not concepts/challenges/
  // collection_questions. Reuses external_title/external_url (no new
  // columns needed); "internal" only in the sense of staying on-site
  // (no target="_blank", unlike external-video/external-article).
  "internal-page",
] as const;
export type RoadmapNodeLinkType = (typeof ROADMAP_NODE_LINK_TYPES)[number];
