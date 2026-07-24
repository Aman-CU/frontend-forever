"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { Columns2, Layers, Maximize2, Minimize2 } from "lucide-react";

import { cn } from "@/lib/utils";

type CompareMode = "diff" | "slide";

type Props = {
  targetDoc: string;
  outputDoc: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
};

const MODE_META: Record<CompareMode, { label: string; icon: typeof Columns2 }> = {
  diff: { label: "Diff", icon: Layers },
  slide: { label: "Slide & Compare", icon: Columns2 },
};

// The one tag naming what's showing — swaps with the active mode rather than
// labeling both layers at once: "Output" in Diff mode, "Target UI" in Slide
// & Compare mode.
const MODE_TAG: Record<CompareMode, string> = {
  diff: "Output",
  slide: "Target UI",
};

// Two live srcDoc iframes only — no screenshots, no pixel-diff math (see
// build-plan.md's "visual compare only" v1 scope). Diff = target ghosted on
// top of the output. Slide = a draggable divider; output is visible left of
// the divider, target visible right of it.
//
// Both iframes are always a plain, full-size w-full/h-full of the frame —
// no aspect-ratio letterboxing, no scale/crop math. An earlier version tried
// to preserve the target's exact pixel dimensions by fitting/cropping a
// fixed-size box into the frame, which was solving a problem that doesn't
// actually exist: the recreated UI's own CSS (fixed widths, centering,
// min-height: 100vh, etc.) already determines its real rendered size —
// giving the iframe a bigger canvas doesn't stretch or rescale that content,
// it just gives it more room, exactly like a real browser tab. So the frame
// can genuinely fill 100% of whatever space it's given (no empty margins,
// fullscreen actually means something) while every challenge's content
// keeps rendering at its own true, unmodified size.
export function ComparePane({ targetDoc, outputDoc, isFullscreen, onToggleFullscreen }: Props) {
  const [mode, setMode] = useState<CompareMode>("diff");
  const [slidePos, setSlidePos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSlidePos(Math.min(100, Math.max(0, pct)));
  }, []);

  // Coalesce pointermove into at most one state update per animation frame —
  // a fast mouse can fire pointermove well above what's useful to repaint
  // two live iframes' clip-path against.
  const rafRef = useRef<number | null>(null);
  const pendingXRef = useRef<number | null>(null);

  const scheduleUpdate = useCallback(
    (clientX: number) => {
      pendingXRef.current = clientX;
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (pendingXRef.current != null) updateFromClientX(pendingXRef.current);
      });
    },
    [updateFromClientX],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Pointer Capture, not a window-level mousemove listener — dragging over
  // an iframe used to break tracking mid-drag (the cursor entering the
  // iframe's own document meant its pointermove events never reached our
  // window listener at all). setPointerCapture routes every subsequent
  // event for this pointer to the handle itself regardless of what's under
  // the cursor, including iframes, until pointerup releases it.
  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    updateFromClientX(event.clientX);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    scheduleUpdate(event.clientX);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);
  }

  function handleHandleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSlidePos((p) => Math.max(0, p - 2));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setSlidePos((p) => Math.min(100, p + 2));
    }
  }

  return (
    // The whole pane is one bordered frame, always the full size it's given
    // — the toolbar is an overlay *inside* its top edge (not a separate row
    // above it), so the frame's own bounds are what actually line up with
    // the toolbar's left/right edges, in both normal and fullscreen layout.
    <div
      ref={frameRef}
      className="relative h-full w-full overflow-hidden rounded-lg border border-border bg-surface-secondary"
    >
      <iframe
        title="Your live output"
        srcDoc={outputDoc}
        sandbox="allow-scripts"
        className="absolute inset-0 h-full w-full border-0"
      />

      <iframe
        title="Target reference"
        srcDoc={targetDoc}
        sandbox="allow-scripts"
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full border-0"
        style={
          mode === "diff"
            ? // Kept low on purpose: at 50% the target's own static markup
              // (e.g. a button's original label) visibly overlapped/clashed
              // with dynamic changes in the output (e.g. that same button's
              // label after a click), reading as garbled double-text rather
              // than a helpful ghost.
              { opacity: 0.22, willChange: "opacity" }
            : { clipPath: `inset(0 0 0 ${slidePos}%)`, willChange: "clip-path" }
        }
      />

      <span className="absolute bottom-2 left-2 z-20 rounded-full bg-background/80 px-2 py-0.5 text-xs font-semibold text-text-secondary shadow-sm backdrop-blur-sm">
        {MODE_TAG[mode]}
      </span>

      {mode === "slide" && (
        <div
          role="slider"
          aria-label="Slide to compare output and target"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(slidePos)}
          aria-orientation="horizontal"
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={handleHandleKeyDown}
          className="absolute inset-y-0 z-10 flex w-6 -translate-x-1/2 touch-none items-center justify-center cursor-ew-resize"
          style={{ left: `${slidePos}%` }}
        >
          <div className="h-full w-0.5 bg-accent" />
          <div
            className={cn(
              "absolute h-8 w-8 rounded-full border-2 border-accent bg-surface shadow-md transition-transform",
              isDragging && "scale-110",
            )}
          />
        </div>
      )}

      {/* Toolbar overlay — inside the frame's top edge, not a sibling row
          above it. z-30, above both the slider (z-10) and the mode tag. */}
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-background/80 p-2 backdrop-blur-sm">
        <div
          className="inline-flex w-fit rounded-lg border border-border bg-surface-secondary/40 p-1"
          role="group"
          aria-label="Compare mode"
        >
          {(Object.keys(MODE_META) as CompareMode[]).map((m) => {
            const { label, icon: Icon } = MODE_META[m];
            const isActive = m === mode;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={isActive}
                onClick={() => setMode(m)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-surface text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen compare" : "Fullscreen compare"}
          title={isFullscreen ? "Exit fullscreen compare" : "Fullscreen compare"}
          className="flex items-center justify-center rounded-md border border-border bg-surface p-1.5 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
        >
          {isFullscreen ? (
            <Minimize2 className="size-3.5" aria-hidden />
          ) : (
            <Maximize2 className="size-3.5" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
