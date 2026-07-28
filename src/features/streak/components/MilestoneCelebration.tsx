"use client";

import { useEffect, useSyncExternalStore } from "react";

import { Celebration } from "@/features/practice/components/playground/Celebration";

type Props = {
  userId: string;
  streakCurrent: number;
  isMilestoneDay: boolean;
};

function noopSubscribe() {
  return () => {};
}

function getServerSnapshot() {
  return false;
}

// Reads localStorage's dedup flag as an external store rather than mirroring
// it into useState+useEffect — a plain "has mounted" state flag here would
// trip react-hooks/set-state-in-effect, same reasoning as
// useSafeReducedMotion.ts. getServerSnapshot always returns false so
// SSR/hydration render "not yet shown" and the client re-reads the real
// value on mount; subscribe is a no-op since nothing outside this component
// changes the flag mid-session, so the snapshot is stable for this mount.
export function MilestoneCelebration({ userId, streakCurrent, isMilestoneDay }: Props) {
  const key = `ff:streakMilestoneSeen:${userId}:${streakCurrent}`;
  const alreadySeen = useSyncExternalStore(
    noopSubscribe,
    () => window.localStorage.getItem(key) !== null,
    getServerSnapshot,
  );
  const shouldCelebrate = isMilestoneDay && !alreadySeen;

  // Marks the milestone seen — a plain side effect, not a state update, so it
  // doesn't trip the same lint rule the naive approach would.
  useEffect(() => {
    if (shouldCelebrate) {
      window.localStorage.setItem(key, "1");
    }
  }, [shouldCelebrate, key]);

  return <Celebration trigger={shouldCelebrate ? 1 : 0} />;
}
