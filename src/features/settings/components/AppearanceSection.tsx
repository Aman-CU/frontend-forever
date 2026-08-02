"use client";

import { useRef, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";
import {
  setReducedMotionPreference,
  useReducedMotionPreference,
  type ReducedMotionPreference,
} from "@/hooks/useSafeReducedMotion";

const OPTIONS: { value: ReducedMotionPreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "on", label: "On" },
  { value: "off", label: "Off" },
];

const PREVIOUS_KEYS = new Set(["ArrowLeft", "ArrowUp"]);
const NEXT_KEYS = new Set(["ArrowRight", "ArrowDown"]);

// Theme (light/dark) already has three separate surfaces — the navbar
// toggle, the user dropdown, and LearnSidebar — all sharing one
// localStorage-backed mechanism. Adding a fourth copy here would be pure
// duplication, so this section is scoped to the one setting that has no
// other home: the reduced-motion override. See progress-tracker.md's
// Pre-Feature-56 decision entry for the full reasoning.
export function AppearanceSection() {
  const preference = useReducedMotionPreference();
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // WAI-ARIA radio-group keyboard pattern: arrow keys move both focus and
  // the selection together (wrapping at the ends), rather than requiring a
  // separate Tab stop + activation key per option.
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!PREVIOUS_KEYS.has(event.key) && !NEXT_KEYS.has(event.key)) return;
    event.preventDefault();

    const direction = PREVIOUS_KEYS.has(event.key) ? -1 : 1;
    const nextIndex = (index + direction + OPTIONS.length) % OPTIONS.length;
    setReducedMotionPreference(OPTIONS[nextIndex].value);
    optionRefs.current[nextIndex]?.focus();
  }

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-text-primary">Appearance</h2>
      <p className="mb-6 text-sm text-text-secondary">
        Control how Frontend Forever looks and moves.
      </p>

      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3">
        <div>
          <p className="text-sm font-medium text-text-primary">Reduced motion</p>
          <p className="text-xs text-text-muted">
            Calms simulator and card animations on this site, independent of your device&apos;s
            system setting.
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="Reduced motion"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-surface-secondary p-1"
        >
          {OPTIONS.map((option, index) => {
            const isSelected = option.value === preference;
            return (
              <button
                key={option.value}
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setReducedMotionPreference(option.value)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isSelected
                    ? "bg-surface text-text-primary shadow-sm"
                    : "text-text-muted hover:text-text-primary",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
