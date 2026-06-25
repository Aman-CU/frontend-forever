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

export const XP_EVENT_TYPES = [
  "concept_understand",
  "concept_simulate",
  "concept_challenge",
  "concept_interview",
  "concept_build",
  "challenge_solved",
  "interview_answered",
  "streak_bonus",
] as const;
export type XPEventType = (typeof XP_EVENT_TYPES)[number];

export const CHALLENGE_STATUSES = ["passed", "failed"] as const;
export type ChallengeStatus = (typeof CHALLENGE_STATUSES)[number];
