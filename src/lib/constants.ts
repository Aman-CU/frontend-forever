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
