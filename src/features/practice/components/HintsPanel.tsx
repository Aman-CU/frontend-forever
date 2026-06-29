"use client";

import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  hints: string[];
};

// Collapsible panel with progressive hint reveal — one hint at a time, so the
// learner only sees as much help as they ask for.
export function HintsPanel({ hints }: Props) {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(0);

  if (hints.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-surface" aria-label="Hints">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Lightbulb className="h-4 w-4 text-xp" aria-hidden />
          Hints
          {revealed > 0 && (
            <span className="text-xs font-normal text-text-muted">
              ({revealed}/{hints.length} revealed)
            </span>
          )}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-text-muted transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 py-3">
              <ol className="flex flex-col gap-2">
                {hints.slice(0, revealed).map((hint, index) => (
                  <li key={index} className="flex gap-2 text-sm text-text-secondary">
                    <span className="font-semibold text-text-muted">{index + 1}.</span>
                    <span>{hint}</span>
                  </li>
                ))}
              </ol>

              {revealed < hints.length ? (
                <button
                  type="button"
                  onClick={() => setRevealed((count) => count + 1)}
                  className="mt-3 text-sm font-medium text-accent transition-colors hover:text-accent-dark"
                >
                  {revealed === 0 ? "Show a hint" : "Show next hint"}
                </button>
              ) : (
                <p className="mt-3 text-xs text-text-muted">All hints revealed.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
