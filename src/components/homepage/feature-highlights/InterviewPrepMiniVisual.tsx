import { Lock } from "lucide-react";

const COLLECTIONS = ["FF 75", "FF JavaScript", "FF React", "FF System Design"];

export function InterviewPrepMiniVisual() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-surface p-5 shadow-md">
      <div className="flex flex-wrap gap-2">
        {COLLECTIONS.map((collection) => (
          <span
            key={collection}
            className="rounded-full bg-premium-light px-2.5 py-1 text-xs font-medium text-premium"
          >
            {collection}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 rounded-lg bg-surface-secondary p-3">
        <span className="flex items-center gap-1 text-xs text-text-muted">
          <Lock className="size-3" aria-hidden="true" />
          Premium · Asked at Meta
        </span>
        <p className="text-sm font-medium text-text-primary">
          Design a debounced search box that cancels stale requests.
        </p>
      </div>
    </div>
  );
}
