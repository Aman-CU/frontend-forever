import { CheckCircle2, Code2 } from "lucide-react";

export function ChallengeEditorMiniVisual() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-surface p-5 shadow-md">
      <div className="flex items-center gap-1 text-xs">
        <span className="rounded-t-md bg-surface-secondary px-3 py-1.5 font-medium text-text-primary">
          VirtualList.tsx
        </span>
        <span className="rounded-t-md px-3 py-1.5 text-text-muted">useVirtualizer.ts</span>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-surface-secondary p-3 font-mono text-xs text-text-secondary">
        {"function VirtualList({ items }) {\n  // render only the visible rows\n}"}
      </pre>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-success">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          10,000 rows · 60fps
        </span>
        <span className="flex items-center gap-1 text-info">
          <Code2 className="size-4" aria-hidden="true" />
          Live editor
        </span>
      </div>
    </div>
  );
}
