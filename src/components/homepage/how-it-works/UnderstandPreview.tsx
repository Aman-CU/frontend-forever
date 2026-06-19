"use client";

import { motion } from "framer-motion";
import { Check, Lightbulb } from "lucide-react";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export function UnderstandPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex w-full max-w-md flex-col gap-4 rounded-3xl bg-accent-muted p-8 shadow-sm"
    >
      <motion.div
        initial={{ rotate: -15, opacity: 0 }}
        whileInView={{ rotate: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
        className="flex items-center gap-2 text-accent"
      >
        <motion.span
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Lightbulb className="size-5" aria-hidden="true" />
        </motion.span>
        <span className="text-xs font-semibold tracking-wide uppercase">Key Insight</span>
      </motion.div>
      <p className="text-base text-text-secondary">
        Microtasks (Promises) always run before the next macrotask (setTimeout) — even
        if the timer is 0ms.
      </p>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.35 }}
        className="flex items-center gap-2 text-sm text-text-muted"
      >
        <Check className="size-4 text-success" aria-hidden="true" />
        <span>Marked as understood</span>
      </motion.div>
    </motion.div>
  );
}
