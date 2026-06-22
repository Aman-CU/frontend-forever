"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mediaQueryList = window.matchMedia(QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

// A naive useState+useEffect "has mounted" flag here would trip the
// react-hooks/set-state-in-effect lint rule and is the wrong tool for
// syncing with an external mutable source (the media query) — same
// reasoning as ThemeProvider's theme sync. useSyncExternalStore's
// getServerSnapshot (always false) vs getSnapshot (the real preference)
// split avoids both the lint error and any hydration mismatch.
export function useSafeReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
