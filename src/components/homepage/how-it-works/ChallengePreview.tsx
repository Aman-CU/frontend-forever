"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Code2, XCircle } from "lucide-react";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export function ChallengePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex w-full max-w-md flex-col gap-4 rounded-3xl bg-premium-light p-8 shadow-sm"
    >
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Code2 className="size-4" aria-hidden="true" />
        <span>debounce.js</span>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-surface p-4 font-mono text-sm text-text-secondary shadow-sm">
        {"function debounce(fn, delay) {\n  // your code here"}
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block h-3.5 w-1.5 translate-y-0.5 bg-premium"
        />
        {"\n}"}
      </pre>
      <div className="flex items-center justify-between text-sm">
        <motion.span
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-1 text-success"
        >
          <CheckCircle2 className="size-4" aria-hidden="true" />3 passed
        </motion.span>
        <motion.span
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="flex items-center gap-1 text-error"
        >
          <XCircle className="size-4" aria-hidden="true" />1 failed
        </motion.span>
      </div>
    </motion.div>
  );
}
