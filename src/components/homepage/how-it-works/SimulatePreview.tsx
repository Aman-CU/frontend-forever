"use client";

import { motion } from "framer-motion";
import { CircleDot, Play, RotateCcw, StepForward } from "lucide-react";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export function SimulatePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex w-full max-w-md flex-col gap-5 rounded-3xl bg-info-muted p-8 shadow-sm"
    >
      <div className="flex items-center justify-between text-sm text-text-muted">
        <span>Step 3 of 8</span>
        <span className="flex items-center gap-1 text-success">
          <CircleDot className="size-3" aria-hidden="true" />
          Running
        </span>
      </div>
      <div className="relative grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-surface p-4 text-center text-sm text-text-secondary shadow-sm">
          Call Stack
        </div>
        <div className="rounded-lg bg-surface p-4 text-center text-sm text-text-secondary shadow-sm">
          Web APIs
        </div>
        <motion.span
          animate={{ left: ["20%", "70%", "20%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-info"
        />
      </div>
      <div className="flex items-center justify-center gap-5 text-text-muted">
        <RotateCcw className="size-4" aria-hidden="true" />
        <span className="flex size-9 items-center justify-center rounded-full bg-info text-info-foreground">
          <Play className="size-4" aria-hidden="true" />
        </span>
        <StepForward className="size-4" aria-hidden="true" />
      </div>
    </motion.div>
  );
}
