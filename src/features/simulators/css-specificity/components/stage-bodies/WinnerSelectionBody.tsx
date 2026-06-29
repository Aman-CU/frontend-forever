"use client";

import { Check, Trophy } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

import { PendingPlaceholder } from "../PendingPlaceholder";
import type { SelectorInfo, StageStatus } from "../../types";

type WinnerSelectionBodyProps = {
  status: StageStatus;
  selectors: SelectorInfo[];
  winner: string;
};

export function WinnerSelectionBody({ status, selectors, winner }: WinnerSelectionBodyProps) {
  if (status === "pending") {
    return <PendingPlaceholder icon={Trophy} />;
  }

  return (
    <div className="flex flex-1 flex-col justify-center gap-1.5">
      {selectors.map((selector) => {
        const isWinner = selector.selector === winner;
        const [id, cls, type] = selector.score;

        return (
          <div
            key={selector.selector}
            className={cn(
              "flex items-center justify-between rounded-md px-2.5 py-1.5 transition-colors duration-300",
              isWinner ? "bg-premium-light" : "opacity-40",
            )}
          >
            <span
              className={cn(
                "flex items-center gap-1 font-mono text-xs",
                isWinner ? "font-semibold text-premium" : "text-text-muted",
              )}
            >
              {selector.selector}
              {selector.important && (
                <span className="rounded bg-streak-light px-1 py-0.5 text-[9px] font-semibold uppercase text-streak">
                  !important
                </span>
              )}
            </span>
            <span className="flex items-center gap-1">
              <span className={cn("font-mono text-xs", isWinner ? "text-premium" : "text-text-muted")}>
                {id}-{cls}-{type}
              </span>
              {isWinner && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Check className="size-3.5 text-success" />
                </motion.span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
