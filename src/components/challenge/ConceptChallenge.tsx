"use client";

import { useRef, useState } from "react";

import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";

import { ChallengeDescription } from "@/features/practice/components/ChallengeDescription";
import { ChallengeEditor } from "@/features/practice/components/ChallengeEditor";
import { ChallengePrompt } from "@/features/practice/components/ChallengePrompt";
import {
  ChallengeEmptyState,
  ChallengePremiumLocked,
} from "@/features/practice/components/ChallengeStates";
import { ChallengePlayground } from "@/features/practice/components/ChallengePlayground";
import { HintsPanel } from "@/features/practice/components/HintsPanel";
import { SolutionPanel } from "@/features/practice/components/SolutionPanel";
import { TestResultsPanel } from "@/features/practice/components/TestResultsPanel";
import { getTestSpec, useSandbox } from "@/features/practice/sandbox";
import type { ChallengeData } from "@/features/learn/lib/queries";

const REVEAL_AFTER_ATTEMPTS = 3;

type Props = {
  challenge: ChallengeData | null;
  conceptId: string;
  isLoggedIn: boolean;
  initialCompleted: boolean;
  // Premium gate seam for Feature 38 — true when the challenge is premium and the
  // user isn't. Always false today (no challenge is premium yet).
  isPremiumLocked: boolean;
};

// components/-layer host: owns the editor state, sandbox run, attempt count,
// solution gating, and the completion POST. Lives here (not features/learn) so it
// can import features/practice — a feature importing another feature is forbidden.
export function ConceptChallenge({
  challenge,
  conceptId,
  isLoggedIn,
  initialCompleted,
  isPremiumLocked,
}: Props) {
  if (!challenge) return <ChallengeEmptyState />;
  if (isPremiumLocked) return <ChallengePremiumLocked />;
  return (
    <ChallengeWorkspace
      challenge={challenge}
      conceptId={conceptId}
      isLoggedIn={isLoggedIn}
      initialCompleted={initialCompleted}
    />
  );
}

function ChallengeWorkspace({
  challenge,
  conceptId,
  isLoggedIn,
  initialCompleted,
}: {
  challenge: ChallengeData;
  conceptId: string;
  isLoggedIn: boolean;
  initialCompleted: boolean;
}) {
  const tests = getTestSpec(challenge.slug);
  const { status, result, run } = useSandbox();
  const [code, setCode] = useState(challenge.starterCode);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(initialCompleted);
  // Fire-once guard for the completion POST, mirroring ConceptSimulator.
  const hasPostedRef = useRef(initialCompleted);

  // `passed` reflects the CURRENT run only — never historical completion — so the
  // green banner can't contradict a failing result panel below it.
  const passed =
    !!result && !result.error && result.results.length > 0 && result.results.every((r) => r.passed);
  // Show the "already completed" pill only before the user runs again this
  // session; once there's a fresh result, the results panel speaks for itself.
  const showCompletedPill = completed && !passed && result === null;
  const solutionUnlocked = completed || passed || attempts >= REVEAL_AFTER_ATTEMPTS;

  async function handleRun() {
    if (!tests || status === "running") return;
    const outcome = await run(code, tests);
    if (!outcome) return;

    const didPass =
      !outcome.error && outcome.results.length > 0 && outcome.results.every((r) => r.passed);
    if (didPass) {
      await postCompletion();
    } else {
      setAttempts((count) => count + 1);
    }
  }

  async function postCompletion() {
    // Logged-out users see the pass state but nothing is written (and they aren't
    // bounced to login mid-challenge — same contract as the Simulate tab).
    if (!isLoggedIn || hasPostedRef.current) return;
    hasPostedRef.current = true;
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptId, tab: "challenge" }),
      });
      if (!res.ok) {
        hasPostedRef.current = false; // allow a retry on the next passing run
        return;
      }
      setCompleted(true);
    } catch {
      hasPostedRef.current = false;
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <ChallengePrompt title={challenge.title} difficulty={challenge.difficulty} />

      <ChallengeDescription markdown={challenge.description} />

      <ChallengePlayground slug={challenge.slug} code={code} />

      {passed ? (
        <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-success-muted px-3 py-1.5 text-sm font-medium text-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          All tests passing — challenge complete
        </div>
      ) : showCompletedPill ? (
        <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-surface-secondary px-3 py-1.5 text-sm font-medium text-text-secondary">
          <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
          You&apos;ve completed this challenge — run again any time
        </div>
      ) : null}

      <ChallengeEditor value={code} onChange={setCode} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleRun}
          disabled={status === "running" || !tests}
          className="inline-flex items-center gap-2 rounded-lg bg-accent-dark px-5 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-darker disabled:opacity-70"
        >
          {status === "running" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Play className="h-4 w-4" aria-hidden />
          )}
          {status === "running" ? "Running…" : "Run Tests"}
        </button>
        <button
          type="button"
          onClick={() => setCode(challenge.starterCode)}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Reset
        </button>
        {attempts > 0 && !passed && (
          <span className="text-xs text-text-muted">
            {attempts} failed {attempts === 1 ? "attempt" : "attempts"}
          </span>
        )}
      </div>

      {tests ? (
        <TestResultsPanel testCases={challenge.testCases} result={result} status={status} />
      ) : (
        <p className="text-sm text-text-muted">
          Automated tests for this challenge are coming soon.
        </p>
      )}

      <HintsPanel hints={challenge.hints} />

      <SolutionPanel
        solutionCode={challenge.solutionCode}
        unlocked={solutionUnlocked}
        lockedReason={`Solution unlocks after you pass, or after ${REVEAL_AFTER_ATTEMPTS} attempts.`}
      />
    </div>
  );
}
