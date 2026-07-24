"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { EXPERIMENT_COMPONENTS } from "@/features/playground/experiments/clientRegistry";

type Props = {
  slug: string;
  title: string;
};

// The live demo surface: renders the real first-party experiment component
// (dynamic, client-only — see clientRegistry.tsx), with a persistent
// bottom-center frontendforever.dev watermark and a Fullscreen toggle. Fullscreen
// uses the native Fullscreen API on the stage element, with a CSS fixed-overlay
// fallback for browsers that reject/lack requestFullscreen (or when it throws) —
// the watermark stays visible in both, since it lives inside the stage element
// that goes fullscreen.
export function ExperimentStage({ slug, title }: Props) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // True only when we fell back to a CSS overlay because the native API was
  // unavailable or rejected — keeps the exit path symmetric.
  const [isCssFullscreen, setIsCssFullscreen] = useState(false);

  const Demo = EXPERIMENT_COMPONENTS[slug];

  // Keep local state in sync with the browser's own fullscreen state (Esc key,
  // browser chrome exit) so the icon/label never lies.
  useEffect(() => {
    function onChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const enterFullscreen = useCallback(async () => {
    const el = stageRef.current;
    if (!el) return;
    if (el.requestFullscreen) {
      try {
        await el.requestFullscreen();
        return;
      } catch {
        // Fall through to the CSS overlay fallback below.
      }
    }
    setIsCssFullscreen(true);
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore — worst case the CSS fallback below still clears.
      }
    }
    setIsCssFullscreen(false);
  }, []);

  const active = isFullscreen || isCssFullscreen;

  const toggleFullscreen = useCallback(() => {
    if (active) {
      void exitFullscreen();
    } else {
      void enterFullscreen();
    }
  }, [active, enterFullscreen, exitFullscreen]);

  return (
    <div
      ref={stageRef}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-surface",
        // The native :fullscreen pseudo-class already fills the screen; the CSS
        // fallback fills the viewport manually via fixed positioning.
        isCssFullscreen ? "fixed inset-0 z-50 rounded-none" : "aspect-[16/10] w-full",
        "[&:fullscreen]:rounded-none",
      )}
    >
      {Demo ? (
        <Demo />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-sm text-text-muted">This experiment isn&apos;t available.</p>
        </div>
      )}

      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label={active ? "Exit fullscreen" : "Enter fullscreen"}
        title={active ? "Exit fullscreen" : "Enter fullscreen"}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/80 text-text-secondary backdrop-blur-sm transition-colors hover:text-text-primary"
      >
        {active ? (
          <Minimize2 className="size-4" aria-hidden />
        ) : (
          <Maximize2 className="size-4" aria-hidden />
        )}
      </button>

      <a
        href="https://frontendforever.dev"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${title} — built on Frontend Forever`}
        className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-text-muted backdrop-blur-sm transition-colors hover:text-text-primary"
      >
        frontendforever.dev
      </a>
    </div>
  );
}
