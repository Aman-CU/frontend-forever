// Shared types for the browser code-execution sandbox.
//
// The sandbox runs user-submitted JavaScript inside a hidden, isolated iframe
// (`sandbox="allow-scripts"`, no `allow-same-origin`) and reports test results
// back to the parent via `postMessage` only. See security.md → Code Execution
// Security for the rules this engine implements.

export type SandboxTest = {
  label: string;
  // JS source executed inside the sandbox as an async function body. It can call
  // the user's top-level declarations (they become globals) plus the injected
  // `assert` / `assertEqual` / `eq` / `delay` helpers. Throw to fail the test.
  // Authored by us in testSpecs.ts — never sourced from user input.
  source: string;
};

export type TestResult = {
  label: string;
  passed: boolean;
  error?: string;
};

export type SandboxRunResult = {
  results: TestResult[];
  // Set when the run itself failed (timeout, harness crash, uncaught error)
  // independent of any individual test's pass/fail. null on a clean run.
  error: string | null;
};
