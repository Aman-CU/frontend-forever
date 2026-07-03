"use client";

import { useState } from "react";

import { Lock, Unlock } from "lucide-react";

type Props = {
  solutionCode: string;
  unlocked: boolean;
  // Why the solution is still locked, shown when unlocked is false. Optional —
  // the Build tab always passes unlocked=true (no attempt-count gate the way
  // Challenge has), so it never needs a reason.
  lockedReason?: string;
};

// View Solution: the caller decides when it's unlocked (Challenge gates on
// passing or attempt count; Build has no attempt-tracking concept, so it's
// always unlocked once the project itself is visible) — this just renders
// locked vs. revealable state. Promoted here (Feature 26) from
// features/practice/components/ so features/build can reuse it too.
export function SolutionPanel({ solutionCode, unlocked, lockedReason }: Props) {
  const [revealed, setRevealed] = useState(false);

  if (!unlocked) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-surface-secondary/40 px-4 py-3 text-sm text-text-muted">
        <Lock className="h-4 w-4 shrink-0" aria-hidden />
        <span>{lockedReason}</span>
      </div>
    );
  }

  if (!revealed) {
    return (
      <button
        type="button"
        onClick={() => setRevealed(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
      >
        <Unlock className="h-4 w-4" aria-hidden />
        View solution
      </button>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-border" aria-label="Reference solution">
      <header className="border-b border-border bg-surface px-4 py-2.5">
        <h3 className="text-sm font-semibold text-text-primary">Reference solution</h3>
      </header>
      <pre className="overflow-x-auto bg-editor-surface p-4">
        <code className="font-mono text-xs leading-relaxed text-editor-foreground">{solutionCode}</code>
      </pre>
    </section>
  );
}
