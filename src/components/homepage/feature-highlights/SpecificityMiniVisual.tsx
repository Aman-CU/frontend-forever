import { Code2 } from "lucide-react";

import { cn } from "@/lib/utils";

type SpecificityRow = {
  selector: string;
  widthClass: string;
  winner?: boolean;
};

const ROWS: SpecificityRow[] = [
  { selector: "button", widthClass: "w-1/5" },
  { selector: ".btn", widthClass: "w-1/3" },
  { selector: ".primary", widthClass: "w-1/3" },
  { selector: "#cta", widthClass: "w-11/12", winner: true },
];

export function SpecificityMiniVisual() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-surface p-5 shadow-md">
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Code2 className="size-4" aria-hidden="true" />
        <span>{'<button id="cta" class="primary btn">'}</span>
      </div>
      <div className="flex flex-col gap-2">
        {ROWS.map((row) => (
          <div key={row.selector} className="flex items-center gap-2">
            <span className="w-16 shrink-0 font-mono text-xs text-text-secondary">
              {row.selector}
            </span>
            <div className="h-2 flex-1 rounded-full bg-surface-secondary">
              <div
                className={cn(
                  "h-2 rounded-full",
                  row.widthClass,
                  row.winner ? "bg-accent" : "bg-border-muted",
                )}
              />
            </div>
          </div>
        ))}
      </div>
      <span className="self-start rounded-full bg-accent-light px-3 py-1 text-xs font-medium text-accent">
        #cta wins — specificity 0,1,0,1
      </span>
    </div>
  );
}
