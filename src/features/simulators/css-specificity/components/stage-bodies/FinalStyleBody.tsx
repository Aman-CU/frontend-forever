"use client";

import { ArrowDown, Paintbrush } from "lucide-react";
import { motion } from "framer-motion";

import { PendingPlaceholder } from "../PendingPlaceholder";
import type { StageStatus } from "../../types";

type FinalStyleBodyProps = {
  status: StageStatus;
};

export function FinalStyleBody({ status }: FinalStyleBodyProps) {
  if (status === "pending") {
    return <PendingPlaceholder icon={Paintbrush} />;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2.5">
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-text-muted">Before</span>
        <span className="rounded-md bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-secondary">
          Start Learning
        </span>
      </div>
      <ArrowDown className="size-3.5 text-text-muted" aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex flex-col items-center gap-1"
      >
        <span className="text-[10px] text-text-muted">After</span>
        <span className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">
          Start Learning
        </span>
      </motion.div>
    </div>
  );
}
