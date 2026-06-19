"use client";

import { motion } from "framer-motion";
import { TerminalSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export function BuildPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex w-full max-w-md flex-col gap-4 rounded-3xl bg-streak-light p-8 shadow-sm"
    >
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <motion.span
          animate={{ rotate: [0, 20, 0, -20, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <TerminalSquare className="size-4" aria-hidden="true" />
        </motion.span>
        <span>autocomplete.tsx</span>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-surface p-4 font-mono text-sm text-text-secondary shadow-sm">
        {"export function Autocomplete() {\n  // your code here\n}"}
      </pre>
      <motion.span
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={cn(buttonVariants(), "self-start")}
      >
        Mark Build Complete
      </motion.span>
    </motion.div>
  );
}
