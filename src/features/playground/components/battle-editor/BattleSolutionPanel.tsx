"use client";

import { useState } from "react";
import { Check, Copy, Lock, Unlock } from "lucide-react";

import { cn } from "@/lib/utils";
import { BATTLE_FILES, type BattleFile } from "./FileTabs";

const FILE_LABEL: Record<BattleFile, string> = {
  html: "index.html",
  css: "style.css",
  js: "script.js",
};

type Props = {
  solutionHtml: string;
  solutionCss: string;
  solutionJs: string;
  isLocked: boolean;
};

// Same visual language as the shared SolutionPanel (locked dashed note vs.
// reveal button vs. a read-only code block), but built locally rather than
// reusing that component directly — SolutionPanel's contract is a single
// `solutionCode` string (every existing Practice/Build challenge is one
// file); a Battle's solution is genuinely 3 files, a different shape, not
// just a config difference. `isLocked` here comes from the *viewer's* real
// premium status, checked and stripped server-side (page.tsx) — by the time
// this component sees empty strings, the real content was never sent to the
// client at all when locked.
export function BattleSolutionPanel({ solutionHtml, solutionCss, solutionJs, isLocked }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [activeFile, setActiveFile] = useState<BattleFile>("html");
  const [copied, setCopied] = useState(false);

  if (isLocked) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-surface-secondary/40 px-4 py-3 text-sm text-text-muted">
        <Lock className="h-4 w-4 shrink-0" aria-hidden />
        <span>Upgrade to Premium to view the official solution for this battle.</span>
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
        View official solution
      </button>
    );
  }

  const code = { html: solutionHtml, css: solutionCss, js: solutionJs }[activeFile];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail (permissions, non-secure context) — no
      // fallback needed here, the code is still fully visible/selectable.
    }
  }

  return (
    <section className="overflow-hidden rounded-lg border border-border" aria-label="Official solution">
      <header className="flex items-center justify-between gap-1 border-b border-border bg-surface px-2 py-1.5">
        <div className="flex items-center gap-1">
          {BATTLE_FILES.map((file) => {
            const isActive = file === activeFile;
            return (
              <button
                key={file}
                type="button"
                onClick={() => setActiveFile(file)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-mono transition-colors",
                  isActive
                    ? "bg-surface-secondary text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {FILE_LABEL[file]}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${FILE_LABEL[activeFile]}`}
          title={`Copy ${FILE_LABEL[activeFile]}`}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
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
      <pre className="max-h-96 overflow-auto bg-editor-surface p-4">
        <code className="font-mono text-xs leading-relaxed text-editor-foreground">{code}</code>
      </pre>
    </section>
  );
}
