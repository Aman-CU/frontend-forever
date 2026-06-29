"use client";

import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";

import type { CodeColor, CodeLine } from "../types";

type CodePanelProps = {
  code: CodeLine[];
  activeLines: number[];
};

const COLOR_CLASS: Record<CodeColor, string> = {
  fn: "text-accent",
  str: "text-success",
  num: "text-warning",
  plain: "text-text-primary",
};

export function CodePanel({ code, activeLines }: CodePanelProps) {
  const prefersReducedMotion = useSafeReducedMotion();

  return (
    <div className="h-full overflow-x-auto rounded-lg border border-border bg-surface-secondary p-3 font-mono text-[13px] leading-5">
      {code.map((line, index) => {
        const lineNumber = index + 1;
        const isActive = activeLines.includes(lineNumber);

        return (
          <div
            key={lineNumber}
            className={cn(
              "-mx-2 flex items-center gap-1.5 rounded-r px-2 transition-colors duration-300",
              isActive && "border-l-2 border-accent bg-accent/10",
            )}
          >
            <span className="flex size-3 shrink-0 items-center justify-center" aria-hidden="true">
              {isActive && (
                <span className="relative flex size-1.5">
                  {!prefersReducedMotion && (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
                  )}
                  <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
                </span>
              )}
            </span>
            {Array.from({ length: line.indent ?? 0 }, (_, level) => (
              <span key={level} className="w-4 shrink-0" />
            ))}
            <span>
              {line.tokens.map((token, tokenIndex) => (
                <span
                  key={tokenIndex}
                  className={COLOR_CLASS[token.color ?? "plain"]}
                >
                  {token.text}
                </span>
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
}
