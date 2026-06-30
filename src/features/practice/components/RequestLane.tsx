"use client";

import { motion } from "framer-motion";
import { Radio } from "lucide-react";

import { cn } from "@/lib/utils";

export type Packet = { id: number };

const COST_PER_CALL = 0.002;

type Props = {
  label: string;
  tone: "naive" | "good";
  calls: number;
  packets: Packet[];
  onPacketDone: (id: number) => void;
};

// One "lane" of the debounce playground: a label, a track down which a dot flies
// to a 📡 server on each request, and a running API-call counter + cost.
export function RequestLane({ label, tone, calls, packets, onPacketDone }: Props) {
  const isGood = tone === "good";
  const textTone = isGood ? "text-success" : "text-error";
  const dotTone = isGood ? "bg-success" : "bg-error";

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-text-primary">{label}</span>
        <span className={cn("text-xs font-medium tabular-nums", textTone)}>
          ${(calls * COST_PER_CALL).toFixed(3)}
        </span>
      </div>

      <div className="relative mb-3 h-8 overflow-hidden rounded-md bg-surface-secondary">
        <Radio
          className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          aria-hidden
        />
        {packets.map((packet) => (
          <motion.span
            key={packet.id}
            className={cn("absolute left-2 top-1/2 h-2 w-2 rounded-full", dotTone)}
            initial={{ x: 0, y: "-50%", opacity: 1 }}
            animate={{ x: 600, opacity: 0.15 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onAnimationComplete={() => onPacketDone(packet.id)}
          />
        ))}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className={cn("text-2xl font-bold tabular-nums", textTone)}>{calls}</span>
        <span className="text-xs text-text-muted">API calls</span>
      </div>
    </div>
  );
}
