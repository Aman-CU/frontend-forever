// Better-Auth's user/session/account/verification tables are generated into
// auth-schema.ts by `npx auth@latest generate` (see Feature 14 in build-plan.md).
// App tables (Feature 18) get added here the same way, one file per table group.
export * from "./auth-schema";
// `profiles` pulled forward from Feature 18 — see Feature 16 in build-plan.md.
export * from "./profiles";
