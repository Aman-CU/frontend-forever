"use client";

import { useSyncExternalStore } from "react";

import { greetingForHour } from "@/features/dashboard/lib/greeting";

type Props = {
  displayName: string;
};

function subscribe() {
  return () => {};
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
