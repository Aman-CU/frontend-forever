"use client";

import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, FileCode2 } from "lucide-react";

import { cn } from "@/lib/utils";

export const BATTLE_FILES = ["html", "css", "js"] as const;
export type BattleFile = (typeof BATTLE_FILES)[number];

export const FILE_META: Record<BattleFile, string> = {
  html: "index.html",
  css: "style.css",
  js: "script.js",
};

type Props = {
  activeFile: BattleFile;
  onFileChange: (file: BattleFile) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

// Same WAI-ARIA tabs pattern + roving-focus keyboard nav as EditorTabs/
// ConceptTabs, just vertical (Up/Down instead of Left/Right) since this reads
// as a small file-tree list, not a horizontal tab row. Collapsible (Feature
// 53 follow-up) — collapsed, it shrinks to an icon-only strip so the editor
// and compare pane get the width back.
export function FileTabs({ activeFile, onFileChange, collapsed, onToggleCollapsed }: Props) {
  const fileRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    switch (event.key) {
      case "ArrowDown":
        nextIndex = (index + 1) % BATTLE_FILES.length;
        break;
      case "ArrowUp":
        nextIndex = (index - 1 + BATTLE_FILES.length) % BATTLE_FILES.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = BATTLE_FILES.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    onFileChange(BATTLE_FILES[nextIndex]);
    fileRefs.current[nextIndex]?.focus();
  }

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col gap-0.5 rounded-lg border border-border bg-surface-secondary/40 p-1.5",
        collapsed ? "w-11" : "w-40",
      )}
      role="tablist"
      aria-orientation="vertical"
      aria-label="Battle files"
    >
      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? "Expand file list" : "Collapse file list"}
        title={collapsed ? "Expand file list" : "Collapse file list"}
        className="mb-0.5 flex items-center justify-center rounded-md p-2 text-text-muted transition-colors hover:bg-surface/60 hover:text-text-primary"
      >
        {collapsed ? (
          <ChevronRight className="size-4" aria-hidden />
        ) : (
          <ChevronLeft className="size-4" aria-hidden />
        )}
      </button>

      {BATTLE_FILES.map((file, index) => {
        const isActive = file === activeFile;

        return (
          <button
            key={file}
            ref={(el) => {
              fileRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`battle-file-tab-${file}`}
            aria-selected={isActive}
            // A single stable id, not one per file — only one tabpanel is
            // ever rendered (BattleEditorWorkspace swaps its content via the
            // editor's `path`, not by mounting 3 separate panels), so all 3
            // tabs must point at that same panel rather than 2 of them
            // referencing an aria-controls id that doesn't exist in the DOM.
            aria-controls="battle-file-panel"
            tabIndex={isActive ? 0 : -1}
            onClick={() => onFileChange(file)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            title={FILE_META[file]}
            className={cn(
              "flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-mono transition-colors",
              collapsed && "justify-center px-0",
              isActive
                ? "bg-surface text-text-primary shadow-sm"
                : "text-text-secondary hover:bg-surface/60 hover:text-text-primary",
            )}
          >
            <FileCode2 className="size-3.5 shrink-0" aria-hidden />
            {!collapsed && <span className="truncate">{FILE_META[file]}</span>}
            {collapsed && <span className="sr-only">{FILE_META[file]}</span>}
          </button>
        );
      })}
    </div>
  );
}
