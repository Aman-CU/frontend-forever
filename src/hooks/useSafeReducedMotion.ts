"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";
const STORAGE_KEY = "reduced-motion-preference";

export type ReducedMotionPreference = "system" | "on" | "off";

function isExplicitPreference(value: string | null): value is Exclude<ReducedMotionPreference, "system"> {
  return value === "on" || value === "off";
}

// Settings → Appearance calls setReducedMotionPreference from a different
// component than the ones reading useSafeReducedMotion/
// useReducedMotionPreference (e.g. a simulator open behind the Settings
// modal) — a plain localStorage write alone wouldn't re-render any of
// them. This module-level listener set, notified manually below, is what
// subscribe() plugs into so useSyncExternalStore knows to re-read the
// snapshot the moment the preference changes, same-tab.
const listeners = new Set<() => void>();
function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  const mediaQueryList = window.matchMedia(QUERY);
  mediaQueryList.addEventListener("change", callback);
  listeners.add(callback);
  return () => {
    mediaQueryList.removeEventListener("change", callback);
    listeners.delete(callback);
  };
}

function getSnapshot(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "on") return true;
  if (stored === "off") return false;
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

// A naive useState+useEffect "has mounted" flag here would trip the
// react-hooks/set-state-in-effect lint rule and is the wrong tool for
// syncing with an external mutable source (the media query, and now the
// manual override) — same reasoning as ThemeProvider's theme sync.
// useSyncExternalStore's getServerSnapshot (always false) vs getSnapshot
// (the real, merged preference) split avoids both the lint error and any
// hydration mismatch.
//
// Merge order: an explicit Settings → Appearance choice always wins over
// the OS-level prefers-reduced-motion query; "system" (the default, no
// override ever set) defers to the OS query exactly as before this
// override existed.
export function useSafeReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function getPreferenceSnapshot(): ReducedMotionPreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  return isExplicitPreference(stored) ? stored : "system";
}

function getPreferenceServerSnapshot(): ReducedMotionPreference {
  return "system";
}

// Settings → Appearance's own three-way control reads the raw preference
// (not the merged boolean above) so it can show which of System/On/Off is
// currently selected.
export function useReducedMotionPreference(): ReducedMotionPreference {
  return useSyncExternalStore(subscribe, getPreferenceSnapshot, getPreferenceServerSnapshot);
}

export function setReducedMotionPreference(preference: ReducedMotionPreference): void {
  if (preference === "system") {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, preference);
  }
  notifyListeners();
}
