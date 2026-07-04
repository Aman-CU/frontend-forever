// Barrel re-export — split into src/features/learn/lib/queries/* (code-standards.md's
// 200-line file rule; this module had grown to 360 lines) by concern: concepts
// (catalog/summary/detail), tabState (the 5 per-tab completion checks + premium),
// challenge, interview (questions + ratings), build. Every existing import of
// "@/features/learn/lib/queries" keeps working unchanged.
export * from "./queries/concepts";
export * from "./queries/tabState";
export * from "./queries/challenge";
export * from "./queries/interview";
export * from "./queries/build";
