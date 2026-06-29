"use client";

import { useCallback, useRef, useState } from "react";

import { runInSandbox } from "./runInSandbox";
import type { SandboxRunResult, SandboxTest } from "./types";

export type SandboxStatus = "idle" | "running" | "done";

// Thin React wrapper around runInSandbox: tracks running state and the last
// result, and ignores re-entrant runs while one is already in flight.
export function useSandbox() {
  const [status, setStatus] = useState<SandboxStatus>("idle");
  const [result, setResult] = useState<SandboxRunResult | null>(null);
  const runningRef = useRef(false);

  const run = useCallback(
    async (code: string, tests: SandboxTest[]): Promise<SandboxRunResult | null> => {
      if (runningRef.current) return null;
      runningRef.current = true;
      setStatus("running");
      setResult(null);
      try {
        const next = await runInSandbox(code, tests);
        setResult(next);
        return next;
      } finally {
        runningRef.current = false;
        setStatus("done");
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
  }, []);

  return { status, result, run, reset };
}
