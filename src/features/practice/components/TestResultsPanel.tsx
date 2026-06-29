"use client";

import { AlertTriangle, CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SandboxRunResult } from "@/features/practice/sandbox";
import type { SandboxStatus } from "@/features/practice/sandbox";

export type ChallengeTestCase = { input: string; expected: string; label: string };

type Props = {
  testCases: ChallengeTestCase[];
  result: SandboxRunResult | null;
  status: SandboxStatus;
};

export function TestResultsPanel({ testCases, result, status }: Props) {
  const running = status === "running";
  const passedCount = result?.results.filter((r) => r.passed).length ?? 0;
  const total = testCases.length;

  return (
    <section className="rounded-lg border border-border bg-surface" aria-label="Test results">
      <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h3 className="text-sm font-semibold text-text-primary">Tests</h3>
        {result && !result.error && (
          <span
            className={cn(
              "text-xs font-medium",
              passedCount === total ? "text-success" : "text-text-secondary",
            )}
          >
            {passedCount}/{total} passing
          </span>
        )}
      </header>

      {result?.error && (
        <div className="flex items-start gap-2 border-b border-border bg-error-muted/40 px-4 py-2.5 text-xs text-error">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{result.error}</span>
        </div>
      )}

      <ul className="divide-y divide-border">
        {testCases.map((testCase, index) => {
          const outcome =
            result?.results.find((r) => r.label === testCase.label) ?? result?.results[index];
          return (
            <li key={testCase.label} className="flex items-start gap-3 px-4 py-3">
              <StatusIcon running={running} passed={outcome?.passed} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{testCase.label}</p>
                <p className="mt-0.5 font-mono text-xs text-text-muted">
                  {testCase.input} → {testCase.expected}
                </p>
                {outcome && !outcome.passed && outcome.error && (
                  <p className="mt-1 text-xs text-error">{outcome.error}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function StatusIcon({ running, passed }: { running: boolean; passed?: boolean }) {
  if (running) {
    return <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-accent" aria-label="Running" />;
  }
  if (passed === true) {
    return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-label="Passed" />;
  }
  if (passed === false) {
    return <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" aria-label="Failed" />;
  }
  return <Circle className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-label="Not run" />;
}
