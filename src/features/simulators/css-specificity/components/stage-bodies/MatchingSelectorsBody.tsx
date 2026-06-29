"use client";

import { List } from "lucide-react";
import { motion } from "framer-motion";

import { PendingPlaceholder } from "../PendingPlaceholder";
import type { SelectorInfo, StageStatus } from "../../types";

type MatchingSelectorsBodyProps = {
  status: StageStatus;
  selectors: SelectorInfo[];
};

export function MatchingSelectorsBody({ status, selectors }: MatchingSelectorsBodyProps) {
  if (status === "pending") {
    return <PendingPlaceholder icon={List} />;
  }

  return (
    <div className="flex flex-1 flex-col justify-center gap-1.5">
      {selectors.map((selector, index) => (
        <motion.div
          key={selector.selector}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: index * 0.12 }}
          className="flex items-center justify-between rounded-md bg-surface-secondary px-2.5 py-1.5"
        >
          <span className="font-mono text-xs text-text-primary">{selector.selector}</span>
          <span className="text-[10px] text-text-muted">{selector.kindLabel}</span>
        </motion.div>
      ))}
    </div>
  );
}
