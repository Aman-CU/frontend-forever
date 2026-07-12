import "server-only";
import ts from "typescript";

// The standard type-challenges harness: Equal does exact type comparison via
// a mutual-assignability trick over function contravariance (a plain
// `X extends Y ? true : false` isn't precise enough — it can't tell `any`
// apart from a real match, and doesn't handle union/optional edge cases the
// way this does). Expect only satisfies its constraint when passed the
// literal `true`, so a failing comparison surfaces as a real diagnostic on
// that exact line.
const HARNESS = `
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type NotEqual<X, Y> = Equal<X, Y> extends true ? false : true;
`;

const VIRTUAL_FILE = "solution.ts";
// A student is only ever writing a handful of type aliases — this is a
// generous ceiling against pathological input, not a realistic answer size.
export const MAX_CODE_LENGTH = 20_000;

const COMPILER_OPTIONS: ts.CompilerOptions = {
  strict: true,
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.ESNext,
  noEmit: true,
  skipLibCheck: true,
  lib: ["lib.es2020.d.ts"],
};

export type TypeChallengeTest = {
  label: string;
  // A type expression that must resolve to `true`, e.g. `Equal<MyPick<Todo, "title">, { title: string }>`.
  assertion: string;
};

export type TypeChallengeResult = {
  label: string;
  passed: boolean;
  error?: string;
};

// Real TypeScript type-checking, not a runtime simulation: the student's code
// and a per-test `Expect<...>` assertion (one per line, so a diagnostic's
// line number tells us exactly which assertion it belongs to) are compiled
// together as one in-memory file via the real Compiler API, and graded by
// whether each assertion's line produced a diagnostic.
export function gradeTypeChallenge(
  userCode: string,
  tests: TypeChallengeTest[],
): TypeChallengeResult[] {
  if (userCode.length > MAX_CODE_LENGTH) {
    return tests.map((t) => ({
      label: t.label,
      passed: false,
      error: "Submission is too long.",
    }));
  }

  const testBlockLines = tests.map((t, i) => `type __test${i} = Expect<${t.assertion}>;`);
  // Built from a known prefix, not located by searching for "__test0" in the
  // compiled source — student code can itself contain that literal (a
  // comment, a string), which would match before the real test block and
  // throw off every test's line mapping.
  const prefix = `${HARNESS}\n${userCode}\n`;
  const fullSource = `${prefix}${testBlockLines.join("\n")}\n`;

  const host = ts.createCompilerHost(COMPILER_OPTIONS);
  const originalGetSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersion, ...rest) => {
    if (fileName === VIRTUAL_FILE) {
      return ts.createSourceFile(fileName, fullSource, languageVersion, true);
    }
    return originalGetSourceFile(fileName, languageVersion, ...rest);
  };
  host.fileExists = (fileName) =>
    fileName === VIRTUAL_FILE ? true : ts.sys.fileExists(fileName);
  host.readFile = (fileName) =>
    fileName === VIRTUAL_FILE ? fullSource : ts.sys.readFile(fileName);

  let diagnostics: readonly ts.Diagnostic[];
  try {
    const program = ts.createProgram([VIRTUAL_FILE], COMPILER_OPTIONS, host);
    diagnostics = ts
      .getPreEmitDiagnostics(program)
      .filter((d) => d.file && d.file.fileName === VIRTUAL_FILE);
  } catch (error) {
    // The compiler itself has its own recursion-depth guards (a runaway
    // recursive type surfaces as a normal diagnostic, not a hang or a
    // thrown error) — this catch is a backstop for anything else
    // unexpected, not the primary defense.
    const message = error instanceof Error ? error.message : String(error);
    return tests.map((t) => ({ label: t.label, passed: false, error: message }));
  }

  const diagnosticsByLine = new Map<number, string[]>();
  diagnostics.forEach((d) => {
    if (!d.file || d.start === undefined) return;
    const { line } = d.file.getLineAndCharacterOfPosition(d.start);
    const message = ts.flattenDiagnosticMessageText(d.messageText, "\n");
    const existing = diagnosticsByLine.get(line);
    if (existing) existing.push(message);
    else diagnosticsByLine.set(line, [message]);
  });

  // The prefix always ends in "\n", so the number of newlines it contains is
  // exactly the 0-indexed line number where the test block starts.
  const firstTestLineIndex = (prefix.match(/\n/g) ?? []).length;

  return tests.map((t, i) => {
    const lineIndex = firstTestLineIndex + i;
    const errors = diagnosticsByLine.get(lineIndex);
    if (!errors || errors.length === 0) return { label: t.label, passed: true };
    return { label: t.label, passed: false, error: errors.join("; ") };
  });
}
