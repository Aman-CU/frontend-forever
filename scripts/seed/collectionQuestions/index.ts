import type { CollectionQuestionSeed } from "../types";
import { FF_JAVASCRIPT_COLLECTION_QUESTIONS } from "./ffJavascript";
import { FF_REACT_COLLECTION_QUESTIONS } from "./ffReact";
import { FF_NEXTJS_COLLECTION_QUESTIONS } from "./ffNextjs";

// Collection order here is cosmetic — orderIndex on each question (not array
// position) drives real per-collection ordering; onConflictDoUpdate is keyed
// on slug, unlike interview_questions' (collection, orderIndex) key, so
// re-running this never risks upserting onto the wrong row on reorder.
export const COLLECTION_QUESTIONS: CollectionQuestionSeed[] = [
  ...FF_JAVASCRIPT_COLLECTION_QUESTIONS,
  ...FF_REACT_COLLECTION_QUESTIONS,
  ...FF_NEXTJS_COLLECTION_QUESTIONS,
];
