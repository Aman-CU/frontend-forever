export function QAMiniVisual() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-surface p-5 shadow-md">
      <p className="text-sm font-medium text-text-primary">
        What&apos;s the difference between let and var?
      </p>
      <p className="text-xs text-text-secondary">
        let is block-scoped; var is function-scoped and hoisted.
      </p>
      <span className="self-start rounded-full bg-surface-secondary px-3 py-1 text-xs text-text-muted">
        2 of 6 answered
      </span>
    </div>
  );
}
