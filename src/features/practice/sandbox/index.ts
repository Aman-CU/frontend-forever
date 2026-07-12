// The run engine itself (useSandbox, runInSandbox, the shared types) now lives
// in lib/sandbox + hooks/ — promoted so features/build (Feature 26) can use it
// too without a features/ → features/ import. Re-exported here so existing
// Practice call sites don't need to change their import path.
export { useSandbox } from "@/hooks/useSandbox";
export type { SandboxStatus } from "@/hooks/useSandbox";
export { runInSandbox } from "@/lib/sandbox";
export type { SandboxTest, TestResult, SandboxRunResult } from "@/lib/sandbox";
export { getTestSpec } from "./testSpecs";
export { useChallengeGrading } from "./useChallengeGrading";
export { useLiveSandbox } from "./useLiveSandbox";
export { getLiveDriver } from "./liveDrivers";
export { buildLiveDoc } from "./buildLiveDoc";
