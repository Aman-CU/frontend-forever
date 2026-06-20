import { Lock } from "lucide-react";

export function BrowserChromeBar() {
  return (
    <div className="flex items-center gap-4 border-b border-border-light bg-surface-secondary px-4 py-2.5">
      <div className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-error" />
        <span className="size-2.5 rounded-full bg-warning" />
        <span className="size-2.5 rounded-full bg-success" />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-surface px-10 py-1.5 text-xs text-text-secondary">
          <Lock className="size-3" />
          frontendforever.dev
        </span>
      </div>
    </div>
  );
}
