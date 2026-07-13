"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";

import { CodeEditor } from "@/components/shared/CodeEditor";
import { SolutionPanel } from "@/components/shared/SolutionPanel";
import { TestResultsPanel } from "@/components/shared/TestResultsPanel";
import { YoutubeLogo } from "@/components/shared/YoutubeLogo";
import { ChallengeDescription } from "@/features/practice/components/ChallengeDescription";
import { HintsPanel } from "@/features/practice/components/HintsPanel";
import { EditorTabs, type EditorTab } from "@/features/practice/components/editor/EditorTabs";
import { DiscussionThread } from "@/features/practice/components/editor/DiscussionThread";
import { useChallengeGrading } from "@/features/practice/sandbox/useChallengeGrading";
import type { ChallengeDetail } from "@/features/practice/lib/queries";
import type { DiscussionPost } from "@/features/practice/lib/discussionQueries";
import type { ChallengeStatus } from "@/lib/constants";

const REVEAL_AFTER_ATTEMPTS = 3;

type Props = {
  challenge: ChallengeDetail;
  isLoggedIn: boolean;
  initialHasPassed: boolean;
  discussionPosts: DiscussionPost[];
};

export function ChallengeEditorWorkspace({
  challenge,
  isLoggedIn,
  initialHasPassed,
  discussionPosts,
}: Props) {
  const router = useRouter();
  const grading = useChallengeGrading(challenge.category, challenge.slug);

  const [activeTab, setActiveTab] = useState<EditorTab>("description");
  const [code, setCode] = useState(challenge.starterCode);
  const [attempts, setAttempts] = useState(0);
  const [hasPassed, setHasPassed] = useState(initialHasPassed);
  const [saveError, setSaveError] = useState(false);

  const passed =
    !!grading.result &&
    !grading.result.error &&
    grading.result.results.length > 0 &&
    grading.result.results.every((r) => r.passed);
  const showPassedPill = hasPassed && !passed && grading.result === null;
  const solutionUnlocked = hasPassed || passed || attempts >= REVEAL_AFTER_ATTEMPTS;
  // TypeScript grading runs the real compiler server-side, gated behind auth
  // (security.md — CPU-heavy enough it can't be open to logged-out traffic).
  // Every other category grades entirely client-side and works logged out.
  const requiresAuthToGrade = challenge.category === "typescript" && !isLoggedIn;

  async function submitAttempt(status: ChallengeStatus) {
    if (!isLoggedIn) return;
    try {
      const res = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.id, status, code }),
      });
      if (!res.ok) {
        // The run result already rendered locally, but the attempt/XP write
        // didn't land — surface it rather than silently losing it, since
        // the user would otherwise believe it was saved.
        setSaveError(true);
        return;
      }
      setSaveError(false);
      const data = (await res.json()) as { firstPass?: boolean };
      if (data.firstPass) {
        setHasPassed(true);
        // Refreshes server-rendered data on this route (in particular
        // AppNavbar's XP/streak) so it doesn't stay stale until the next
        // full navigation — same pattern as ConceptChallenge.
        router.refresh();
      }
    } catch {
      setSaveError(true);
    }
  }

  async function handleRun() {
    if (!grading.hasTests || grading.status === "running" || requiresAuthToGrade) return;
    const outcome = await grading.run(code);
    if (!outcome) return;

    // A grading-infra error (compiler/sandbox failure) is not the same as a
    // genuine wrong-answer attempt — it shouldn't count toward the
    // REVEAL_AFTER_ATTEMPTS unlock or get written as a "failed" submission.
    if (outcome.error) return;

    const didPass = outcome.results.length > 0 && outcome.results.every((r) => r.passed);
    if (didPass) {
      await submitAttempt("passed");
    } else {
      setAttempts((count) => count + 1);
      await submitAttempt("failed");
    }
  }

  const isTypeScript = challenge.category === "typescript";

  return (
    // Even 50/50 split, per the BFE reference — an earlier editor-weighted
    // (1fr:1.4fr) pass narrowed the description column enough that its own
    // 5-tab EditorTabs bar started horizontally scrolling, which read as
    // broken, not "serious." The right column stays sticky so it doesn't
    // scroll away while a long description scrolls past it.
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
      {/* Left panel — tabbed, not all-visible-at-once */}
      <div className="min-w-0">
        <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div
          id={`editor-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`editor-tab-${activeTab}`}
          tabIndex={0}
          className="mt-4 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {activeTab === "description" && <ChallengeDescription markdown={challenge.description} />}

          {activeTab === "hints" &&
            (challenge.hints.length === 0 ? (
              <p className="text-sm text-text-muted">No hints for this challenge.</p>
            ) : (
              <HintsPanel hints={challenge.hints} />
            ))}

          {activeTab === "testCases" && (
            <TestResultsPanel testCases={challenge.testCases} result={null} status="idle" />
          )}

          {activeTab === "solution" && (
            <SolutionPanel
              solutionCode={challenge.solutionCode}
              unlocked={solutionUnlocked}
              lockedReason={`Solution unlocks after you pass, or after ${REVEAL_AFTER_ATTEMPTS} attempts.`}
            />
          )}

          {activeTab === "discussion" && (
            <DiscussionThread
              challengeId={challenge.id}
              posts={discussionPosts}
              isLoggedIn={isLoggedIn}
            />
          )}
        </div>
      </div>

      {/* Right panel — editor + run + live results. Sticky on desktop so it
          reads as a persistent workspace, not a column that scrolls away. */}
      <div className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-18">
        {/* CodeEditor is always the first element here — no badge, pill, or
            link is ever allowed to sit above it, so its top edge stays flush
            with EditorTabs on the left instead of drifting down depending on
            pass-state/video-url (that drift was the reported bug: a solved
            challenge added a status pill above the editor that a fresh one
            didn't have, so the editor's position wasn't even consistent
            across challenges, let alone aligned with the left column). */}
        <CodeEditor
          value={code}
          onChange={setCode}
          language={isTypeScript ? "typescript" : "javascript"}
          height={480}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRun}
            disabled={grading.status === "running" || !grading.hasTests || requiresAuthToGrade}
            className="inline-flex items-center gap-2 rounded-lg bg-accent-dark px-5 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-darker disabled:opacity-70"
          >
            {grading.status === "running" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Play className="h-4 w-4" aria-hidden />
            )}
            {grading.status === "running" ? "Running…" : "Run Tests"}
          </button>
          <button
            type="button"
            onClick={() => setCode(challenge.starterCode)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset
          </button>

          {challenge.videoUrl && (
            <a
              href={challenge.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
            >
              <YoutubeLogo className="h-4 w-4 text-error" />
              Video walkthrough
            </a>
          )}

          {saveError && (
            <span className="text-xs text-error">
              Couldn&apos;t save your result — run again to retry.
            </span>
          )}

          {passed ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-success-muted px-3 py-1.5 text-xs font-medium text-success">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              All tests passing
            </span>
          ) : (
            showPassedPill && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-secondary">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden />
                Solved — run again any time
              </span>
            )
          )}

          {requiresAuthToGrade ? (
            <span className="text-xs text-text-muted">Log in to run TypeScript tests.</span>
          ) : (
            attempts > 0 &&
            !passed && (
              <span className="text-xs text-text-muted">
                {attempts} failed {attempts === 1 ? "attempt" : "attempts"}
              </span>
            )
          )}
        </div>

        {grading.hasTests ? (
          <TestResultsPanel testCases={challenge.testCases} result={grading.result} status={grading.status} />
        ) : (
          <p className="text-sm text-text-muted">Automated tests for this challenge are coming soon.</p>
        )}
      </div>
    </div>
  );
}
