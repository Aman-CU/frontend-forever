"use client";

import { useState } from "react";
import { Check, Copy, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { CodeEditor } from "@/components/shared/CodeEditor";
import type { ExperimentSource } from "@/lib/experimentSource";

type Props = {
  sources: ExperimentSource[];
  // Premium gate — the source is stripped server-side (never sent to a
  // non-premium client), so by the time this renders locked, `sources` is
  // already empty. Same "never client-side only" pattern as BattleSolutionPanel.
  isLocked: boolean;
};

// Read-only view of an experiment's real source (read off disk server-side, see
// lib/experimentSource.ts). Reuses the shared Monaco CodeEditor in readOnly mode
// rather than a hand-rolled <pre> highlighter — a .tsx file (JSX, hooks) needs
// real language-aware highlighting the minimal Markdown.tsx tokenizer can't give,
// and this keeps the code view visually identical to the editor the rest of the
// product uses. File tabs appear only when an experiment has more than one file.
export function ExperimentCodeView({ sources, isLocked }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (isLocked) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-surface-secondary/40 px-4 py-3 text-sm text-text-muted">
        <Lock className="h-4 w-4 shrink-0" aria-hidden />
        <span>Upgrade to Premium to view the source code for this experiment.</span>
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface-secondary/40 px-4 py-6 text-center text-sm text-text-muted">
        Source for this experiment isn&apos;t available.
      </div>
    );
  }

  const active = sources[Math.min(activeIndex, sources.length - 1)];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(active.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can fail (permissions / non-secure context) — the code is
      // still fully visible and selectable, so no fallback is needed.
    }
  }

  return (
    <section
      className="overflow-hidden rounded-lg border border-border"
      aria-label="Experiment source code"
    >
      <header className="flex items-center justify-between gap-1 border-b border-border bg-surface px-2 py-1.5">
        <div className="flex items-center gap-1 overflow-x-auto">
          {sources.map((source, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={source.label}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1.5 font-mono text-xs transition-colors",
                  isActive
                    ? "bg-surface-secondary text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {source.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${active.label}`}
          title={`Copy ${active.label}`}
          className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-success" aria-hidden />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" aria-hidden />
              Copy
            </>
          )}
        </button>
      </header>
      <CodeEditor
        value={active.code}
        onChange={() => {}}
        language={active.language}
        path={`experiment-source/${active.label}`}
        height={420}
        readOnly
      />
    </section>
  );
}
