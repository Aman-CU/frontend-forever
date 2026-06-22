"use client";

import { motion } from "framer-motion";

import { CardZones } from "../StageCard";
import type { CardStatus } from "../../types";

type RealDomBodyProps = {
  status: CardStatus;
  count: number;
};

export function RealDomBody({ status, count }: RealDomBodyProps) {
  const justUpdated = status === "active";

  return (
    <CardZones topLabel="Updated DOM" bottomNote={justUpdated ? "Just updated!" : undefined}>
      <motion.span
        key={count}
        initial={justUpdated ? { scale: 1.3, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-2xl font-bold text-accent"
      >
        Count: {count}
      </motion.span>
      <span className="rounded-md border border-border-light bg-surface-secondary px-5 py-2 text-sm text-text-secondary">
        Increment
      </span>
    </CardZones>
  );
}
