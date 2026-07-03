import { CheckCircle2 } from "lucide-react";

type Props = {
  completed: boolean;
  onComplete: () => void;
};

// Self-reported completion — independent of test results (architect decision,
// Feature 26): a real project's UI can't be exhaustively unit-tested, so
// Mark Build Complete is a manual "I'm done" action, not gated on Run Tests.
export function MarkBuildCompleteButton({ completed, onComplete }: Props) {
  if (completed) {
    return (
      <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-success-muted px-3 py-1.5 text-sm font-medium text-success">
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        Build complete
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onComplete}
      className="inline-flex items-center gap-2 rounded-lg bg-accent-dark px-5 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-darker"
    >
      <CheckCircle2 className="h-4 w-4" aria-hidden />
      Mark Build Complete
    </button>
  );
}
