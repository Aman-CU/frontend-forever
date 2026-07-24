import type {
  ConceptCategory,
  ConceptDifficulty,
  ChallengeDifficulty,
  InterviewCollection,
  CollectionQuestionCollection,
  StudyPlanSlug,
  StudyPlanItemType,
} from "../../src/lib/constants";
import type { PracticeCategory } from "../../src/features/practice/lib/practiceCategories";

export type ConceptSeed = {
  slug: string;
  title: string;
  description: string;
  category: ConceptCategory;
  difficulty: ConceptDifficulty;
  // Omit for a free concept (the default) — same optional-if-free convention as
  // ChallengeSeed/ProjectBriefSeed's isPremium.
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

// Feature 31's collection_questions table — distinct from InterviewQuestionSeed
// above (which targets the older, concept-linked interview_questions table).
// No conceptSlug: these are standalone Q&A, not tied to a Learn concept.
export type CollectionQuestionSeed = {
  collection: CollectionQuestionCollection;
  slug: string;
  question: string;
  answer: string;
  difficulty: ChallengeDifficulty;
  companies?: string[];
  isFf75?: boolean;
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

// Feature 53's Playground → UI Battles. targetHtml/targetCss/targetJs render
// live in the editor's compare pane; targetImageUrl is a one-time screenshot
// of that same target render, used only for the list page's thumbnail.
export type UiBattleChallengeSeed = {
  slug: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  targetImageUrl: string;
  targetWidth: number;
  targetHeight: number;
  targetHtml: string;
  targetCss: string;
  targetJs?: string;
  starterHtml: string;
  starterCss: string;
  starterJs?: string;
  // The official recreation — genuinely separate from targetHtml/Css/Js (see
  // schema/playground.ts's header comment on why gating the target itself
  // would be security theater). Optional only for a challenge with no
  // authored solution yet; omitted defaults to "" via the column default.
  solutionHtml?: string;
  solutionCss?: string;
  solutionJs?: string;
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

// Feature 51's Lightning Prep. No conceptSlug/challengeSlug-style resolution
// step — href is written directly since items point at a mix of concept
// pages, Practice category pages, FF Collection/System-Design/Company-Guides
// index pages, and Playbook chapters, several of which have no DB row to
// resolve an id from (Playbook/System Design content is filesystem-only).
export type StudyPlanItemSeed = {
  groupLabel: string;
  itemType: StudyPlanItemType;
  // Only set for "concept" ("category/slug") and "playbook-chapter"
  // ("playbookSlug/chapterSlug") — the two itemTypes with a live per-user
  // completion source (see studyPlanQueries.ts). Omitted for every other type.
  refId?: string;
  href: string;
  title: string;
  description: string;
  // Premium-style "★ Q.01–Q.10" range pill — the subset of this item's
  // linked list page to work through that day. Omitted where there's no
  // numbered list to point into (system-design-guide, playbook-chapter, etc).
  rangeLabel?: string;
};

export type StudyPlanSeed = {
  slug: StudyPlanSlug;
  title: string;
  durationLabel: string;
  hoursCommitment: string;
  description: string;
  isPremium?: boolean;
  orderIndex: number;
  items: StudyPlanItemSeed[];
};
