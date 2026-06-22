"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";

type CodePanelProps = {
  activeLines: number[];
};

type CodeLineProps = {
  lineNumber: number;
  activeLines: number[];
  prefersReducedMotion: boolean;
  indent?: number;
  children?: ReactNode;
};

function CodeLine({
  lineNumber,
  activeLines,
  prefersReducedMotion,
  indent = 0,
  children,
}: CodeLineProps) {
  const isActive = activeLines.includes(lineNumber);

  return (
    <div
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
      {indent > 0 && <span className="w-4 shrink-0" />}
      <span>{children}</span>
    </div>
  );
}

export function CodePanel({ activeLines }: CodePanelProps) {
  const prefersReducedMotion = useSafeReducedMotion();

  return (
    <div className="h-full overflow-x-auto rounded-lg border border-border bg-surface-secondary p-3 font-mono text-[13px] leading-5">
      <CodeLine
        lineNumber={1}
        activeLines={activeLines}
        prefersReducedMotion={prefersReducedMotion}
      >
        <span className="text-accent">console.log</span>
        <span className="text-text-primary">(</span>
        <span className="text-success">&apos;start&apos;</span>
        <span className="text-text-primary">);</span>
      </CodeLine>
      <CodeLine
        lineNumber={2}
        activeLines={activeLines}
        prefersReducedMotion={prefersReducedMotion}
      />
      <CodeLine
        lineNumber={3}
        activeLines={activeLines}
        prefersReducedMotion={prefersReducedMotion}
      >
        <span className="text-accent">setTimeout</span>
        <span className="text-text-primary">(() =&gt; {"{"}</span>
      </CodeLine>
      <CodeLine
        lineNumber={4}
        activeLines={activeLines}
        prefersReducedMotion={prefersReducedMotion}
        indent={1}
      >
        <span className="text-accent">console.log</span>
        <span className="text-text-primary">(</span>
        <span className="text-success">&apos;timeout&apos;</span>
        <span className="text-text-primary">);</span>
      </CodeLine>
      <CodeLine
        lineNumber={5}
        activeLines={activeLines}
        prefersReducedMotion={prefersReducedMotion}
      >
        <span className="text-text-primary">{"}, "}</span>
        <span className="text-warning">0</span>
        <span className="text-text-primary">);</span>
      </CodeLine>
      <CodeLine
        lineNumber={6}
        activeLines={activeLines}
        prefersReducedMotion={prefersReducedMotion}
      />
      <CodeLine
        lineNumber={7}
        activeLines={activeLines}
        prefersReducedMotion={prefersReducedMotion}
      >
        <span className="text-accent">Promise.resolve</span>
        <span className="text-text-primary">().</span>
        <span className="text-accent">then</span>
        <span className="text-text-primary">(() =&gt; {"{"}</span>
      </CodeLine>
      <CodeLine
        lineNumber={8}
        activeLines={activeLines}
        prefersReducedMotion={prefersReducedMotion}
        indent={1}
      >
        <span className="text-accent">console.log</span>
        <span className="text-text-primary">(</span>
        <span className="text-success">&apos;promise&apos;</span>
        <span className="text-text-primary">);</span>
      </CodeLine>
      <CodeLine
        lineNumber={9}
        activeLines={activeLines}
        prefersReducedMotion={prefersReducedMotion}
      >
        <span className="text-text-primary">{"});"}</span>
      </CodeLine>
      <CodeLine
        lineNumber={10}
        activeLines={activeLines}
        prefersReducedMotion={prefersReducedMotion}
      />
      <CodeLine
        lineNumber={11}
        activeLines={activeLines}
        prefersReducedMotion={prefersReducedMotion}
      >
        <span className="text-accent">console.log</span>
        <span className="text-text-primary">(</span>
        <span className="text-success">&apos;end&apos;</span>
        <span className="text-text-primary">);</span>
      </CodeLine>
    </div>
  );
}
