import type { ChallengeSeed } from "../types";
import { CONCEPT_LINKED_CHALLENGES } from "./conceptLinked";
import { JAVASCRIPT_RUNTIME_CHALLENGES } from "./javascriptRuntime";
import { REACT_CHALLENGES } from "./react";
import { CSS_CHALLENGES } from "./css";
import { TYPESCRIPT_CHALLENGES } from "./typescript";
import { SYSTEM_DESIGN_CHALLENGES } from "./systemDesign";

// Bucket order here is cosmetic — orderIndex on each challenge (not
// array position) drives real ordering; onConflictDoUpdate is keyed on
// slug, not on this array's shape.
export const CHALLENGES: ChallengeSeed[] = [
  ...CONCEPT_LINKED_CHALLENGES,
  ...JAVASCRIPT_RUNTIME_CHALLENGES,
  ...REACT_CHALLENGES,
  ...CSS_CHALLENGES,
  ...TYPESCRIPT_CHALLENGES,
  ...SYSTEM_DESIGN_CHALLENGES,
];
