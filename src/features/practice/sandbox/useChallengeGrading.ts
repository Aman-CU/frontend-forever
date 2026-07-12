"use client";

import { useCallback, useRef, useState } from "react";

import { useSandbox } from "@/hooks/useSandbox";
import type { SandboxStatus } from "@/hooks/useSandbox";
import { getTestSpec } from "@/features/practice/sandbox/testSpecs";
import type { PracticeCategory } from "@/features/practice/lib/practiceCategories";
import type { SandboxRunResult, TestResult } from "@/lib/sandbox/types";

// Unifies Practice's two grading paths behind one {status, result, run, hasTests}
// contract (same shape as useSandbox itself), so the Editor page never branches
// on category beyond picking which grading path runs and which Monaco
// `language` to render. javascript-runtime/react/css/system-design execute in
// the existing browser sandbox; typescript has no runtime to execute against,
// so it POSTs to the existing /api/practice/grade-type-challenge route (real
// TypeScript Compiler API, server-side — see security.md's "Server-Side
// Compiler Execution" section).
export function useChallengeGrading(category: PracticeCategory, slug: string) {
  const sandbox = useSandbox();
  const [tsStatus, setTsStatus] = useState<SandboxStatus>("idle");
  const [tsResult, setTsResult] = useState<SandboxRunResult | null>(null);
  const tsRunningRef = useRef(false);

  const runTypeScript = useCallback(
    async (code: string): Promise<SandboxRunResult | null> => {
      if (tsRunningRef.current) return null;
      tsRunningRef.current = true;
      setTsStatus("running");
      setTsResult(null);
      let next: SandboxRunResult;
      try {
        const res = await fetch("/api/practice/grade-type-challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, code }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          next = { results: [], error: body?.error ?? "Could not grade submission." };
        } else {
          const data = (await res.json()) as { results: TestResult[] };
          next = { results: data.results, error: null };
        }
      } catch {
        next = { results: [], error: "Could not reach the grading service." };
      }
      setTsResult(next);
      tsRunningRef.current = false;
      setTsStatus("done");
      return next;
    },
    [slug],
  );

  // getTestSpec is a plain lookup, not a hook — safe to call conditionally.
  // The useCallback below it is NOT conditional: it always runs, regardless
  // of category, so hook call order stays identical across renders. Only the
  // final `if` (deciding which path's status/result/run to return) branches.
  const tests = getTestSpec(slug);
  const runSandbox = useCallback(
    (code: string) => (tests ? sandbox.run(code, tests) : Promise.resolve(null)),
    [tests, sandbox],
  );

  if (category === "typescript") {
    return {
      status: tsStatus,
      result: tsResult,
      hasTests: true,
      run: runTypeScript,
    };
  }

  return {
    status: sandbox.status,
    result: sandbox.result,
    hasTests: !!tests,
    run: runSandbox,
  };
}
