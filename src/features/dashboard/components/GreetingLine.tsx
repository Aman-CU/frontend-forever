"use client";

import { useSyncExternalStore } from "react";

import { greetingForHour } from "@/features/dashboard/lib/greeting";

type Props = {
  displayName: string;
};

// Schedules one callback right at the next hour boundary, then reschedules
// itself — so a dashboard tab left open across, say, 11:59am -> 12:01pm
// actually flips from "Good morning" to "Good afternoon" instead of freezing
// on whatever greeting was current at mount.
function subscribe(callback: () => void) {
  const scheduleNext = (): ReturnType<typeof setTimeout> => {
    const now = new Date();
    const msUntilNextHour =
      (60 - now.getMinutes()) * 60_000 - now.getSeconds() * 1000 - now.getMilliseconds();
    return setTimeout(() => {
      callback();
      timeoutId = scheduleNext();
    }, msUntilNextHour);
  };

  let timeoutId = scheduleNext();
  return () => clearTimeout(timeoutId);
}

function getSnapshot(): string {
  return greetingForHour(new Date().getHours());
}

function getServerSnapshot(): string {
  return greetingForHour(new Date().getUTCHours());
}

// Same useSyncExternalStore split as useSafeReducedMotion: the server has no
// idea what timezone the visitor is in, so it renders a UTC-based guess
// (getServerSnapshot) to avoid a hydration mismatch, then the client swaps in
// the real greeting for the visitor's actual local hour (getSnapshot) right
// after hydration — no naive useState+useEffect flag needed.
export function GreetingLine({ displayName }: Props) {
  const greeting = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <>
      {greeting}, {displayName}
    </>
  );
}
