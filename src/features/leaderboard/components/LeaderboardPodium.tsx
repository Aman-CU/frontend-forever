"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import { LeaderboardAvatar } from "@/features/leaderboard/components/LeaderboardAvatar";
import type { LeaderboardEntry } from "@/features/leaderboard/lib/queries";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

// Visual order is 2nd - 1st - 3rd (classic podium arrangement), driven by a
// CSS `order` utility rather than reshuffling the array — `entries` stays in
// real rank order for anything reading it (e.g. keys, a11y order).
const PODIUM_ORDER: Record<number, string> = { 1: "order-2", 2: "order-1", 3: "order-3" };

export function LeaderboardPodium({ entries }: { entries: LeaderboardEntry[] }) {
  const reduceMotion = useSafeReducedMotion();

  return (
    <div className="mb-8 flex flex-wrap items-end justify-center gap-4 sm:flex-nowrap">
      {entries.map((entry, index) => {
        const isFirst = entry.rank === 1;
        return (
          <motion.div
            key={entry.id}
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: index * 0.08 }}
            className={cn(
              "flex w-full flex-col items-center rounded-xl border px-5 py-6 text-center sm:w-56",
              PODIUM_ORDER[entry.rank] ?? "",
              isFirst
                ? "border-xp/40 bg-xp-light pb-8 pt-8"
                : "border-border bg-surface-elevated",
            )}
          >
            {isFirst && <Crown className="mb-2 h-6 w-6 text-xp" aria-hidden />}
            <span
              className={cn(
                "mb-3 text-xs font-semibold uppercase tracking-wide",
                isFirst ? "text-xp" : "text-text-muted",
              )}
            >
              Rank #{entry.rank}
            </span>
            <LeaderboardAvatar
              fullName={entry.fullName}
              username={entry.username}
              avatarUrl={entry.avatarUrl}
              size={isFirst ? "lg" : "default"}
            />
            <p className="mt-3 truncate text-sm font-semibold text-text-primary">
              {entry.fullName ?? entry.username}
            </p>
            <p className={cn("mt-1 text-sm font-bold", isFirst ? "text-xp" : "text-text-secondary")}>
              {entry.xp.toLocaleString()} XP
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
