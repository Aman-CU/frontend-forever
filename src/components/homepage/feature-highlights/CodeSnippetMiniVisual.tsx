import { CheckCircle2, Code2, XCircle } from "lucide-react";

export function CodeSnippetMiniVisual() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-surface p-5 shadow-md">
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Code2 className="size-4" aria-hidden="true" />
        <span>debounce.js</span>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-surface-secondary p-3 font-mono text-xs text-text-secondary">
        {"function debounce(fn, delay) {\n  // your code here\n}"}
      </pre>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-success">
          <CheckCircle2 className="size-4" aria-hidden="true" />3 passed
        </span>
        <span className="flex items-center gap-1 text-error">
          <XCircle className="size-4" aria-hidden="true" />1 failed
        </span>
      </div>
    </div>
  );
}
