"use client";

import { motion } from "framer-motion";

import { CardZones } from "../StageCard";
import type { CardStatus } from "../../types";

type ComponentStateBodyProps = {
  status: CardStatus;
  count: number;
  isPlaying: boolean;
  onIncrement: () => void;
};

export function ComponentStateBody({ status, count, isPlaying, onIncrement }: ComponentStateBodyProps) {
  return (
    <CardZones topLabel="Counter Component">
      <motion.div
        key={count}
        initial={status === "active" ? { scale: 0.7, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-1 rounded-md bg-premium-light px-6 py-3"
      >
        <span className="text-xs text-text-muted">count</span>
        <span className="text-3xl font-bold text-premium">{count}</span>
      </motion.div>
      <button
        type="button"
        onClick={onIncrement}
        disabled={isPlaying}
        className="rounded-md bg-premium px-5 py-2 text-sm font-semibold text-text-inverse disabled:cursor-not-allowed disabled:opacity-50"
      >
        Increment
      </button>
    </CardZones>
  );
}
