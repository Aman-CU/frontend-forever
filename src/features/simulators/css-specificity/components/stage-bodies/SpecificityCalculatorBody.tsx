"use client";

import { Calculator } from "lucide-react";
import { motion } from "framer-motion";

import { PendingPlaceholder } from "../PendingPlaceholder";
import type { SelectorInfo, StageStatus } from "../../types";

type SpecificityCalculatorBodyProps = {
  status: StageStatus;
  selectors: SelectorInfo[];
};

export function SpecificityCalculatorBody({ status, selectors }: SpecificityCalculatorBodyProps) {
  if (status === "pending") {
    return <PendingPlaceholder icon={Calculator} />;
  }

  return (
    <div className="flex flex-1 flex-col justify-center gap-1.5">
      {selectors.map((selector, index) => {
        const [id, cls, type] = selector.score;
        return (
          <motion.div
            key={selector.selector}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: index * 0.12 }}
            className="flex flex-col gap-0.5 rounded-md bg-surface-secondary px-2.5 py-1.5"
          >
            <div className="flex items-center justify-between gap-1.5">
              <span className="flex items-center gap-1 font-mono text-xs text-text-primary">
                {selector.selector}
                {selector.important && (
                  <span className="rounded bg-streak-light px-1 py-0.5 text-[9px] font-semibold uppercase text-streak">
                    !important
                  </span>
                )}
              </span>
              <span className="font-mono text-xs font-semibold text-accent">
                {id}-{cls}-{type}
              </span>
            </div>
            <span className="text-[10px] text-text-muted">
              {id} + {cls} + {type}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
