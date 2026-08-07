"use client";

import { useRef, useState } from "react";

import { useRouter } from "next/navigation";
import { Loader2, Play, RotateCcw } from "lucide-react";

import { CodeEditor } from "@/components/shared/CodeEditor";
import { Markdown } from "@/components/shared/Markdown";
import { SolutionPanel } from "@/components/shared/SolutionPanel";
import { TestResultsPanel } from "@/components/shared/TestResultsPanel";
import { PremiumLocked } from "@/components/shared/PremiumLocked";
import { BuildEmptyState } from "@/features/build/components/BuildStates";
import { MarkBuildCompleteButton } from "@/features/build/components/MarkBuildCompleteButton";
import { getBuildTestSpec } from "@/features/build/data/testSpecs";
import { useSandbox } from "@/hooks/useSandbox";
import type { ProjectBriefData } from "@/features/learn/lib/queries";

type Props = {
  projectBrief: ProjectBriefData | null;
  conceptId: string;
  isLoggedIn: boolean;
  initialCompleted: boolean;
  // Server-side premium gate — true when the project is premium and the user
  // isn't (see page.tsx, mirrors ConceptChallenge's isPremiumLocked).
  isPremiumLocked: boolean;
};

// components/-layer host: owns the editor state, sandbox run, and the
// completion POST. Lives here (not features/learn or features/build) so it can
// import features/build — a feature importing another feature is forbidden.
// Mirrors ConceptChallenge/ConceptInterview's components/ -> features/ bridge.
export function ConceptBuild({
  projectBrief,
  conceptId,
  isLoggedIn,
  initialCompleted,
  isPremiumLocked,
}: Props) {
  if (!projectBrief) return <BuildEmptyState />;
  if (isPremiumLocked)
    return (
      <PremiumLocked
        title="Premium build project"
        description="Upgrade to Premium to unlock this build project."
        isLoggedIn={isLoggedIn}
      />
    );
  return (
    <BuildWorkspace
      projectBrief={projectBrief}
      conceptId={conceptId}
      isLoggedIn={isLoggedIn}
      initialCompleted={initialCompleted}
    />
  );
}

function BuildWorkspace({
  projectBrief,
  conceptId,
  isLoggedIn,
  initialCompleted,
}: {
  projectBrief: ProjectBriefData;
  conceptId: string;
  isLoggedIn: boolean;
  initialCompleted: boolean;
}) {
  const router = useRouter();
  const tests = getBuildTestSpec(projectBrief.slug);
  const { status, result, run } = useSandbox();
  const [code, setCode] = useState(projectBrief.starterCode);
  const [completed, setCompleted] = useState(initialCompleted);
  // Fire-once guard for the completion POST, mirroring ConceptChallenge.
  const hasPostedRef = useRef(initialCompleted);

  async function handleRun() {
    if (!tests || status === "running") return;
    await run(code, tests);
  }

  async function handleMarkComplete() {
    // Logged-out users can still mark it complete locally but nothing is
    // written (and they aren't bounced to login mid-tab) — same contract as
    // the Simulate/Challenge/Interview tabs.
    if (!isLoggedIn || hasPostedRef.current) {
      setCompleted(true);
      return;
    }
    hasPostedRef.current = true;
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptId, tab: "build" }),
      });
      if (!res.ok) {
        hasPostedRef.current = false;
        return;
      }
      setCompleted(true);
      // Refreshes server-rendered data on this route (in particular AppNavbar's
      // XP/streak) so it doesn't stay stale until the next full navigation.
      router.refresh();
    } catch {
      hasPostedRef.current = false;
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-bold text-text-primary">{projectBrief.title}</h2>

      <Markdown markdown={projectBrief.description} />

      <CodeEditor value={code} onChange={setCode} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleRun}
          disabled={status === "running" || !tests}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary disabled:opacity-70"
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
          onClick={() => setCode(projectBrief.starterCode)}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Reset
        </button>
      </div>

      {tests ? (
        <TestResultsPanel testCases={projectBrief.testCases} result={result} status={status} />
      ) : (
        <p className="text-sm text-text-muted">Automated tests for this project are coming soon.</p>
      )}

      {/* Always unlocked (no attempt-count gate the way Challenge has) — Build
          has nothing equivalent to track attempts against, and Mark Build
          Complete is self-reported, so there's no "prove you tried" gate to
          enforce before showing the solution. */}
      <SolutionPanel solutionCode={projectBrief.solutionCode} unlocked />

      <MarkBuildCompleteButton completed={completed} onComplete={handleMarkComplete} />
    </div>
  );
}
