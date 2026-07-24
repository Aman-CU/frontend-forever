"use client";

import { useEffect, useState } from "react";

// Single consumer today (BattleEditorWorkspace) — kept feature-local rather
// than promoted to shared hooks/, per this codebase's "promote on second
// consumer" precedent (see CodeEditor/the sandbox engine in ui-registry.md).
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
