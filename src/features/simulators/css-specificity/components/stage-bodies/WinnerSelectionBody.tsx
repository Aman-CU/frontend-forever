"use client";

import { Check, Trophy } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

import { SELECTORS, WINNER_SELECTOR } from "../../data/scenarios";
import { PendingPlaceholder } from "../PendingPlaceholder";
import type { StageStatus } from "../../types";

type WinnerSelectionBodyProps = {
  status: StageStatus;
};

export function WinnerSelectionBody({ status }: WinnerSelectionBodyProps) {
  if (status === "pending") {
    return <PendingPlaceholder icon={Trophy} />;
  }

  return (
    <div className="flex flex-1 flex-col justify-center gap-1.5">
      {SELECTORS.map((selector) => {
        const isWinner = selector.selector === WINNER_SELECTOR;
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
                "font-mono text-xs",
                isWinner ? "font-semibold text-premium" : "text-text-muted",
              )}
            >
              {selector.selector}
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
