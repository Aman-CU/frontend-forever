import { COLLECTION_QUESTION_COLLECTIONS, type CollectionQuestionCollection } from "@/lib/constants";

// The 4 URL segments Feature 31 actually serves under /interview-prep/[collection].
// "ff-75" is a virtual collection (collection_questions.isFf75 = true across all
// 3 real collection values, not a literal column value) — kept separate from
// COLLECTION_QUESTION_COLLECTIONS so the DB-value type stays honest.
// "ff-system-design" is deliberately excluded: Feature 49 owns that URL with its
// own MDX-guide page template, not this feature's list/detail pages.
export const FF_75_KEY = "ff-75" as const;
export const INTERVIEW_PREP_ROUTE_COLLECTIONS = [FF_75_KEY, ...COLLECTION_QUESTION_COLLECTIONS] as const;
export type InterviewPrepRouteCollection = (typeof INTERVIEW_PREP_ROUTE_COLLECTIONS)[number];

export function isInterviewPrepRouteCollection(value: string): value is InterviewPrepRouteCollection {
  return (INTERVIEW_PREP_ROUTE_COLLECTIONS as readonly string[]).includes(value);
}

export function isRealCollectionValue(
  value: InterviewPrepRouteCollection,
): value is CollectionQuestionCollection {
  return value !== FF_75_KEY;
}
