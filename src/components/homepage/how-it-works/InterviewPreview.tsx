"use client";

import { motion } from "framer-motion";
import { ThumbsDown, ThumbsUp } from "lucide-react";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export function InterviewPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex w-full max-w-md flex-col gap-4 rounded-3xl bg-success-muted p-8 shadow-sm"
    >
      <p className="text-base font-medium text-text-primary">
        What&apos;s the difference between a microtask and a macrotask?
      </p>
      <p className="text-base text-text-secondary">
        Microtasks run immediately after the current task, before the event loop checks
        for the next macrotask.
      </p>
      <div className="flex gap-3">
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.3 }}
          className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-2 text-sm text-text-secondary shadow-sm"
        >
          <motion.span
            animate={{ rotate: [0, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ThumbsUp className="size-4" aria-hidden="true" />
          </motion.span>
          I knew this
        </motion.span>
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.4 }}
          className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-2 text-sm text-text-secondary shadow-sm"
        >
          <ThumbsDown className="size-4" aria-hidden="true" />
          Need to review
        </motion.span>
      </div>
    </motion.div>
  );
}
