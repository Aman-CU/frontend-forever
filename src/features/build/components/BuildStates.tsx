import { Hammer } from "lucide-react";

// Shown when a concept has no linked project brief yet (parallels the Challenge
// and Interview tabs' own "coming soon" empty states).
export function BuildEmptyState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/40 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary text-text-muted">
        <Hammer className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-text-primary">Build project coming soon</h2>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">
        This concept doesn&apos;t have a build project yet. Try the Understand and Challenge tabs
        in the meantime.
      </p>
    </div>
  );
}
