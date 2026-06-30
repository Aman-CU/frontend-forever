"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Server } from "lucide-react";

import { cn } from "@/lib/utils";
import { CountUp } from "./CountUp";

const COST = 0.002; // $ per request

export type Coin = { id: number };

type Props = {
  title: string;
  calls: number;
  load: number; // 0–100
  coins: Coin[];
  onCoinDone: (id: number) => void;
};

// One server "lane" of the debounce playground: a load meter that reacts to the
// requests hitting it, coins flying to the server, a mood emoji, and a running
// bill. Used twice — once for the naive baseline, once driven by the user's code.
export function ServerPanel({ title, calls, load, coins, onCoinDone }: Props) {
  const mood = load > 70 ? "🥵" : load > 25 ? "😅" : "😌";
  const meter = load > 70 ? "bg-error" : load > 25 ? "bg-xp" : "bg-success";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">{title}</span>
        <span className="text-lg" aria-hidden>{mood}</span>
      </div>

      <div className="relative h-12 overflow-hidden rounded-md bg-surface-secondary">
        <Server className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" aria-hidden />
        <AnimatePresence>
          {coins.map((coin) => (
            <motion.span
              key={coin.id}
              className="absolute bottom-3 left-3 text-sm"
              initial={{ x: 0, opacity: 1 }}
              animate={{ x: 190, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeIn" }}
              onAnimationComplete={() => onCoinDone(coin.id)}
            >
              🪙
            </motion.span>
          ))}
        </AnimatePresence>
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-surface">
          <motion.div
            className={cn("h-full", meter)}
            animate={{ width: `${load}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <CountUp
          value={calls * COST}
          format={(n) => `$${n.toFixed(3)}`}
          className="text-2xl font-bold tabular-nums text-text-primary"
        />
        <span className="text-xs text-text-muted">
          <CountUp value={calls} /> requests
        </span>
      </div>
    </div>
  );
}
