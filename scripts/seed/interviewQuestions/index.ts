import type { InterviewQuestionSeed } from "../types";
import { FF_75_QUESTIONS } from "./ff75";
import { FF_JAVASCRIPT_QUESTIONS } from "./ffJavascript";
import { FF_REACT_QUESTIONS } from "./ffReact";
import { FF_SYSTEM_DESIGN_QUESTIONS } from "./ffSystemDesign";

// Collection order here is cosmetic — orderIndex on each question (not
// array position) drives real ordering; onConflictDoUpdate is keyed on
// (collection, orderIndex), not on this array's shape.
export const INTERVIEW_QUESTIONS: InterviewQuestionSeed[] = [
  ...FF_75_QUESTIONS,
  ...FF_JAVASCRIPT_QUESTIONS,
  ...FF_REACT_QUESTIONS,
  ...FF_SYSTEM_DESIGN_QUESTIONS,
];
