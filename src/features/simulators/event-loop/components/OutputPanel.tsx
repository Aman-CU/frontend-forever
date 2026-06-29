import { AnimatePresence, motion } from "framer-motion";
import { Terminal } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ExecutionOrderEntry, PanelTheme } from "../types";

type OutputPanelProps = {
  consoleOutput: string[];
  executionOrderByOutput: Record<string, ExecutionOrderEntry>;
};

const THEME_TEXT: Record<PanelTheme, string> = {
  premium: "text-premium",
  success: "text-success",
  info: "text-info",
  streak: "text-streak",
};

export function OutputPanel({ consoleOutput, executionOrderByOutput }: OutputPanelProps) {
  return (
    <div className="flex h-full min-h-[100px] flex-col gap-2 rounded-lg border border-border bg-surface-secondary p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">
        <Terminal className="size-3.5" />
        Output
      </div>

      <div className="flex flex-1 flex-col gap-1.5 font-mono text-[13px] leading-5">
        {consoleOutput.length === 0 ? (
          <span className="text-text-muted">Nothing logged yet</span>
        ) : (
          <AnimatePresence mode="popLayout">
            {consoleOutput.map((output) => {
              const entry = executionOrderByOutput[output];
              if (!entry) return null;

              return (
                <motion.div
                  key={output}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex items-baseline gap-1.5"
                >
                  <span className="text-text-muted">{">"}</span>
                  <span className={cn(THEME_TEXT[entry.theme])}>{output}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
