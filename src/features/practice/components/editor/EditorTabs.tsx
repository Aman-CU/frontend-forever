"use client";

import { useRef } from "react";
import type { KeyboardEvent } from "react";

import { FileText, Lightbulb, ListChecks, MessageSquare, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export const EDITOR_TABS = ["description", "hints", "testCases", "solution", "discussion"] as const;
export type EditorTab = (typeof EDITOR_TABS)[number];

const TAB_META: Record<EditorTab, { label: string; icon: LucideIcon }> = {
  description: { label: "Description", icon: FileText },
  hints: { label: "Hints", icon: Lightbulb },
  testCases: { label: "Test Cases", icon: ListChecks },
  solution: { label: "Solution", icon: Trophy },
  discussion: { label: "Discussion", icon: MessageSquare },
};

type Props = {
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
};

// Tabbed, not all-visible-at-once — keeps the left panel calm instead of
// BFE's cluttered always-on row of icon buttons (build-plan.md's own framing
// for this feature). Same WAI-ARIA tabs pattern + roving-focus keyboard nav
// as Learn's ConceptTabs.
export function EditorTabs({ activeTab, onTabChange }: Props) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % EDITOR_TABS.length;
        break;
      case "ArrowLeft":
        nextIndex = (index - 1 + EDITOR_TABS.length) % EDITOR_TABS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = EDITOR_TABS.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    onTabChange(EDITOR_TABS[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div className="border-b border-border" role="tablist" aria-label="Challenge sections">
      <div className="flex gap-1 overflow-x-auto">
        {EDITOR_TABS.map((tab, index) => {
          const { label, icon: Icon } = TAB_META[tab];
          const isActive = tab === activeTab;

          return (
            <button
              key={tab}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`editor-tab-${tab}`}
              aria-selected={isActive}
              aria-controls={`editor-panel-${tab}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-text-secondary hover:text-text-primary",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
