import {
  Check,
  Cpu,
  Layers,
  Lightbulb,
  ListOrdered,
  Lock,
  MoveRight,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ColumnTheme = "premium" | "success" | "info" | "streak";

type SimulatorItem = {
  code: string;
  status: string;
  state: "active" | "done";
};

type ExecutionStep = {
  step: number;
  code: string;
  theme: ColumnTheme;
};

const THEME_CLASSES: Record<
  ColumnTheme,
  { text: string; bg: string; dot: string }
> = {
  premium: { text: "text-premium", bg: "bg-premium-light", dot: "bg-premium" },
  success: { text: "text-success", bg: "bg-success-light", dot: "bg-success" },
  info: { text: "text-info", bg: "bg-info-light", dot: "bg-info" },
  streak: { text: "text-streak", bg: "bg-streak-light", dot: "bg-streak" },
};

// Hardcoded snapshot of the Event Loop scenario from build-plan.md (Feature
// 09) — this is a static visual only, no real state machine wires up until
// Feature 09 builds the interactive simulator.
const CALL_STACK_ITEMS: SimulatorItem[] = [
  { code: "console.log('start')", status: "Executing...", state: "active" },
  { code: "setTimeout(...)", status: "Executed", state: "done" },
  { code: "Promise.then(...)", status: "Executed", state: "done" },
  { code: "console.log('end')", status: "Executing...", state: "active" },
];

const WEB_API_ITEMS: SimulatorItem[] = [
  { code: "setTimeout(callback, 0)", status: "Timer started", state: "active" },
  { code: "Promise.then(callback)", status: "Promise resolved", state: "done" },
];

const MICROTASK_ITEMS: SimulatorItem[] = [
  { code: "Promise.then(...)", status: "Waiting...", state: "active" },
];

const TASK_QUEUE_ITEMS: SimulatorItem[] = [
  { code: "setTimeout(...)", status: "Waiting...", state: "active" },
];

const EXECUTION_ORDER: ExecutionStep[] = [
  { step: 1, code: "console.log('start')", theme: "premium" },
  { step: 2, code: "console.log('end')", theme: "premium" },
  { step: 3, code: "Promise.then(...)", theme: "info" },
  { step: 4, code: "setTimeout(...)", theme: "streak" },
];

export function HeroSimulatorPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-xl">
      <BrowserChromeBar />
      <PanelHeader />

      <div className="flex flex-col gap-4 p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SimulatorColumn
            title="Call Stack"
            icon={Layers}
            theme="premium"
            items={CALL_STACK_ITEMS}
          />
          <SimulatorColumn
            title="Web APIs"
            icon={Cpu}
            theme="success"
            items={WEB_API_ITEMS}
          />
          <SimulatorColumn
            title="Microtask Queue"
            icon={Zap}
            theme="info"
            items={MICROTASK_ITEMS}
          />
          <SimulatorColumn
            title="Task Queue"
            icon={ListOrdered}
            theme="streak"
            items={TASK_QUEUE_ITEMS}
          />
        </div>

        <CodePanel />
        <ExecutionOrderBar items={EXECUTION_ORDER} />
        <InsightCallout />
      </div>
    </div>
  );
}

function BrowserChromeBar() {
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

function PanelHeader() {
  return (
    <div className="flex items-center justify-between border-b border-border-light px-5 py-3.5">
      <div className="flex items-center gap-2">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-success" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Live Concept Engine
        </span>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-muted px-3 py-1 text-xs font-medium text-success">
        <span className="size-1.5 rounded-full bg-success" />
        Running
      </span>
    </div>
  );
}

function SimulatorColumn({
  title,
  icon: Icon,
  theme,
  items,
}: {
  title: string;
  icon: LucideIcon;
  theme: ColumnTheme;
  items: SimulatorItem[];
}) {
  const themeClasses = THEME_CLASSES[theme];

  return (
    <div className="flex min-h-[180px] flex-col gap-2 rounded-lg border border-border bg-surface p-4">
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide",
          themeClasses.text,
        )}
      >
        <Icon className="size-3.5" />
        {title}
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.code}
            className={cn("rounded-md px-3 py-2", themeClasses.bg)}
          >
            <div className="flex items-center justify-between gap-2">
              <p
                className={cn("truncate font-mono text-xs", themeClasses.text)}
              >
                {item.code}
              </p>
              {item.state === "done" ? (
                <Check className={cn("size-3 shrink-0", themeClasses.text)} />
              ) : (
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    themeClasses.dot,
                  )}
                />
              )}
            </div>
            <p className="mt-0.5 text-xs text-text-muted">{item.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CodeLine({
  indent = 0,
  children,
}: {
  indent?: number;
  children?: ReactNode;
}) {
  return (
    <div className="flex">
      {indent > 0 && (
        <span className="shrink-0" style={{ width: `${indent * 16}px` }} />
      )}
      <span>{children}</span>
    </div>
  );
}

function CodePanel() {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface-secondary p-4 font-mono text-[13px] leading-6">
      <CodeLine>
        <span className="text-accent">console.log</span>
        <span className="text-text-primary">(</span>
        <span className="text-success">&apos;start&apos;</span>
        <span className="text-text-primary">);</span>
      </CodeLine>
      <CodeLine />
      <CodeLine>
        <span className="text-accent">setTimeout</span>
        <span className="text-text-primary">(() =&gt; {"{"}</span>
      </CodeLine>
      <CodeLine indent={1}>
        <span className="text-accent">console.log</span>
        <span className="text-text-primary">(</span>
        <span className="text-success">&apos;timeout&apos;</span>
        <span className="text-text-primary">);</span>
      </CodeLine>
      <CodeLine>
        <span className="text-text-primary">{"}, "}</span>
        <span className="text-warning">0</span>
        <span className="text-text-primary">);</span>
      </CodeLine>
      <CodeLine />
      <CodeLine>
        <span className="text-accent">Promise.resolve</span>
        <span className="text-text-primary">().</span>
        <span className="text-accent">then</span>
        <span className="text-text-primary">(() =&gt; {"{"}</span>
      </CodeLine>
      <CodeLine indent={1}>
        <span className="text-accent">console.log</span>
        <span className="text-text-primary">(</span>
        <span className="text-success">&apos;promise&apos;</span>
        <span className="text-text-primary">);</span>
      </CodeLine>
      <CodeLine>
        <span className="text-text-primary">{"});"}</span>
      </CodeLine>
      <CodeLine />
      <CodeLine>
        <span className="text-accent">console.log</span>
        <span className="text-text-primary">(</span>
        <span className="text-success">&apos;end&apos;</span>
        <span className="text-text-primary">);</span>
      </CodeLine>
    </div>
  );
}

function ExecutionOrderBar({ items }: { items: ExecutionStep[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-secondary px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
        Execution Order
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <div key={item.step} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1">
              <span className="flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                {item.step}
              </span>
              <span
                className={cn(
                  "font-mono text-xs",
                  THEME_CLASSES[item.theme].text,
                )}
              >
                {item.code}
              </span>
            </div>
            {index < items.length - 1 && (
              <MoveRight className="size-3.5 text-text-muted" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightCallout() {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border-light bg-surface-secondary p-3">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
      <p className="text-sm text-text-secondary">
        <span className="font-medium text-text-primary">
          Microtasks are executed before tasks.
        </span>{" "}
        That&apos;s why <span className="font-mono text-info">Promise</span>{" "}
        callbacks run before{" "}
        <span className="font-mono text-streak">setTimeout</span>.
      </p>
    </div>
  );
}
