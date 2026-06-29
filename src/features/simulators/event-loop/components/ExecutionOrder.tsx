import { AnimatePresence, motion } from "framer-motion";
import { MoveRight } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ExecutionOrderEntry, PanelTheme } from "../types";

type ExecutionOrderProps = {
  consoleOutput: string[];
  executionOrderByOutput: Record<string, ExecutionOrderEntry>;
};

const THEME_TEXT: Record<PanelTheme, string> = {
  premium: "text-premium",
  success: "text-success",
  info: "text-info",
  streak: "text-streak",
};

export function ExecutionOrder({ consoleOutput, executionOrderByOutput }: ExecutionOrderProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-secondary px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
        Execution Order
      </span>

      {consoleOutput.length === 0 ? (
        <span className="text-xs text-text-muted">Nothing executed yet</span>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <AnimatePresence mode="popLayout">
            {consoleOutput.map((output, index) => {
              const entry = executionOrderByOutput[output];
              if (!entry) return null;

              return (
                <motion.div
                  key={output}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1">
                    <span className="flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                      {index + 1}
                    </span>
                    <span className={cn("font-mono text-xs", THEME_TEXT[entry.theme])}>
                      {entry.code}
                    </span>
                  </div>
                  {index < consoleOutput.length - 1 && (
                    <MoveRight className="size-3.5 text-text-muted" />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
