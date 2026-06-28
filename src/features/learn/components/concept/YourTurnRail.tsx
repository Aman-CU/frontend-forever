import { CheckCircle2, Lightbulb, Play } from "lucide-react";

import { cn } from "@/lib/utils";

// Static placeholder content for the shell. Feature 22+ wires the real quiz and
// per-concept data; this just establishes the right-rail visual structure.
const QUIZ_OPTIONS = ["Promise.then()", "setTimeout callback", "console.log('end')"];

type OrderStatus = "done" | "active" | "pending";
const EXECUTION_ORDER: { label: string; status: OrderStatus }[] = [
  { label: "console.log('start')", status: "done" },
  { label: "setTimeout()", status: "done" },
  { label: "console.log('end')", status: "done" },
  { label: "Promise.then()", status: "active" },
  { label: "setTimeout callback", status: "pending" },
];

const RELATED_TOPICS = [
  { label: "Call Stack", className: "bg-accent-muted text-accent" },
  { label: "Microtasks", className: "bg-info-muted text-info" },
  { label: "Tasks", className: "bg-success-muted text-success" },
  { label: "Web APIs", className: "bg-premium-light text-premium" },
  { label: "Async Behavior", className: "bg-streak-light text-streak" },
];

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-surface p-5">{children}</div>;
}

export function YourTurnRail() {
  return (
    <div className="flex flex-col gap-5">
      {/* Quiz */}
      <Card>
        <h2 className="text-base font-semibold text-text-primary">Your Turn</h2>
        <p className="mt-3 text-sm font-medium text-text-primary">What executes next?</p>
        <p className="text-xs text-text-muted">Predict before continuing.</p>

        <div className="mt-3 flex flex-col gap-2">
          {QUIZ_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-left text-sm text-text-secondary transition-colors hover:border-accent hover:bg-surface-secondary"
            >
              <span className="h-4 w-4 shrink-0 rounded border border-border" aria-hidden />
              <span className="font-mono text-xs">{option}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled
          className="mt-3 w-full rounded-lg bg-surface-secondary py-2.5 text-sm font-medium text-text-muted"
        >
          Submit Answer
        </button>

        <p className="mt-3 flex items-start gap-2 text-xs text-text-muted">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-streak" aria-hidden />
          Think it through! Microtasks have higher priority than tasks.
        </p>
      </Card>

      {/* Execution order */}
      <Card>
        <h2 className="text-base font-semibold text-text-primary">Execution Order</h2>
        <ol className="mt-3 flex flex-col gap-2">
          {EXECUTION_ORDER.map((item, index) => (
            <li
              key={item.label}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm",
                item.status === "active"
                  ? "bg-surface-secondary font-medium text-text-primary"
                  : "text-text-secondary",
              )}
            >
              <span className="w-4 shrink-0 text-center text-xs text-text-muted">{index + 1}</span>
              <span className="flex-1 truncate font-mono text-xs">{item.label}</span>
              {item.status === "done" && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-label="Done" />
              )}
              {item.status === "active" && (
                <Play className="h-3.5 w-3.5 shrink-0 fill-text-primary text-text-primary" aria-label="Current" />
              )}
            </li>
          ))}
        </ol>
      </Card>

      {/* Related topics */}
      <Card>
        <h2 className="text-base font-semibold text-text-primary">Related Topics</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {RELATED_TOPICS.map((topic) => (
            <span
              key={topic.label}
              className={cn("rounded-md px-2.5 py-1 text-xs font-medium", topic.className)}
            >
              {topic.label}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
