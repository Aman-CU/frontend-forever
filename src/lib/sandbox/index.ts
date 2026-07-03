// The browser code-execution engine — a hidden, isolated iframe
// (`sandbox="allow-scripts"`, no `allow-same-origin`), postMessage only, per
// security.md → Code Execution Security. Content-free: no challenge/build data
// lives here, only the run mechanism. Shared by features/practice (Feature 24)
// and features/build (Feature 26) — promoted out of features/practice/sandbox/
// so a second feature could use it without a features/ → features/ import
// (same precedent as Feature 10 promoting simulator-chrome to components/shared/
// + hooks/ when a second simulator needed it).
export { runInSandbox } from "./runInSandbox";
export type { SandboxTest, TestResult, SandboxRunResult } from "./types";
