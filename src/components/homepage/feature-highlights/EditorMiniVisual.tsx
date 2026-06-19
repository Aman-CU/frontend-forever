import { Play, TerminalSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function EditorMiniVisual() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-surface p-5 shadow-md">
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <TerminalSquare className="size-4" aria-hidden="true" />
        <span>Counter.tsx</span>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-surface-secondary p-3 font-mono text-xs text-text-secondary">
        {"export function Counter() {\n  // your code here\n}"}
      </pre>
      <span className={cn(buttonVariants({ size: "sm" }), "self-start gap-1.5")}>
        <Play className="size-3.5" aria-hidden="true" />
        Run in Sandbox
      </span>
    </div>
  );
}
