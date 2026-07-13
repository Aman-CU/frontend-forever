import type {
  ConceptCategory,
  ConceptDifficulty,
  ChallengeDifficulty,
  InterviewCollection,
} from "../../src/lib/constants";
import type { PracticeCategory } from "../../src/features/practice/lib/practiceCategories";

export type ConceptSeed = {
  slug: string;
  title: string;
  description: string;
  category: ConceptCategory;
  difficulty: ConceptDifficulty;
  // Omit for a free concept (the default) — same optional-if-free convention as
  // ChallengeSeed/ProjectBriefSeed's isPremium. Needed so the onConflictDoUpdate
  // below has a real seed-controlled value to write instead of always falling
  // back to the column default on every reseed.
  isPremium?: boolean;
  orderIndex: number;
};

export type ChallengeSeed = {
  slug: string;
  // Concept this challenge belongs to (its Challenge tab renders this one).
  // Resolved to a concept_id at insert time; omit for standalone challenges.
  conceptSlug?: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  starterCode: string;
  solutionCode: string;
  testCases: { input: string; expected: string; label: string }[];
  hints: string[];
  // Companies the challenge is attributed to (Practice's Company filter,
  // Feature 28) — omitted entries default to [] via the column default.
  companies?: string[];
  // Practice's own topic tag (Feature 28 standalone rework) — set only on
  // challenges meant to appear in Practice; omitted (→ null) keeps a
  // concept-linked challenge purely a Learn Challenge-tab entry.
  category?: PracticeCategory;
  isPremium?: boolean;
  orderIndex: number;
};

export type InterviewQuestionSeed = {
  collection: InterviewCollection;
  // Optional link to a concept — powers the concept page's Interview tab, which
  // queries by concept_id. Unlinked questions (null) still appear in their
  // collection on the Interview Prep pages (Features 30-31).
  conceptSlug?: string;
  question: string;
  answer: string;
  difficulty: ChallengeDifficulty;
  companies: string[];
  isPremium?: boolean;
  orderIndex: number;
};

export type ProjectBriefSeed = {
  slug: string;
  // Build tab content is always concept-linked (unlike challenges, which can be
  // standalone) — every entry here must resolve to a real concept.
  conceptSlug: string;
  title: string;
  description: string;
  starterCode: string;
  solutionCode: string;
  testCases: { input: string; expected: string; label: string }[];
  isPremium?: boolean;
  orderIndex: number;
};

export type RoadmapSeed = {
  slug: string;
  title: string;
  description: string;
  orderIndex: number;
  steps: string[];
};
