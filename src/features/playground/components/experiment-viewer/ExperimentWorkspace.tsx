"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Code2, Lock, Maximize2, Minimize2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { ExperimentSource } from "@/lib/experimentSource";
import { ExperimentStage } from "./ExperimentStage";
import { ExperimentCodeView } from "./ExperimentCodeView";
import { ExperimentShareButton } from "./ExperimentShareButton";

type Props = {
  slug: string;
  title: string;
  sources: ExperimentSource[];
  // True when the viewer isn't premium — the real source has already been
  // stripped server-side (sources is empty), this only drives the UI.
  isCodeLocked: boolean;
};

const OVERLAY_BUTTON =
  "flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold text-text-secondary backdrop-blur-sm transition-colors hover:bg-surface-secondary hover:text-text-primary";

// Full-bleed experiment canvas: the demo fills the whole area below AppNavbar
// (h-14 = 3.5rem) edge to edge, with only a minimal floating toolbar (Share on
// X, View Code, Fullscreen) and a persistent watermark overlaid on it — no
// breadcrumb/title/description/tags chrome, per the page's own design. Fullscreen
// uses the native API on the stage element (CSS fixed-overlay fallback), so the
// toolbar and watermark inside it stay visible when maximized.
export function ExperimentWorkspace({ slug, title, sources, isCodeLocked }: Props) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCssFullscreen, setIsCssFullscreen] = useState(false);

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
        // Fall through to the CSS overlay fallback.
      }
    }
    setIsCssFullscreen(true);
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore — the CSS fallback below still clears.
      }
    }
    setIsCssFullscreen(false);
  }, []);

  const active = isFullscreen || isCssFullscreen;
  const toggleFullscreen = useCallback(() => {
    if (active) void exitFullscreen();
    else void enterFullscreen();
  }, [active, enterFullscreen, exitFullscreen]);

  return (
    <div
      ref={stageRef}
      className={
        isCssFullscreen
          ? "fixed inset-0 z-50 bg-surface"
          : "relative h-[calc(100dvh-3.5rem)] w-full bg-surface"
      }
    >
      {/* The live demo fills the whole surface. */}
      <div className="absolute inset-0">
        <ExperimentStage slug={slug} />
      </div>

      {/* Floating toolbar — top-right. */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <ExperimentShareButton title={title} />
        <button type="button" onClick={() => setShowCode(true)} className={OVERLAY_BUTTON}>
          {isCodeLocked ? <Lock className="size-3.5" aria-hidden /> : <Code2 className="size-3.5" aria-hidden />}
          View Code
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={active ? "Exit fullscreen" : "Enter fullscreen"}
          title={active ? "Exit fullscreen" : "Enter fullscreen"}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/80 text-text-secondary backdrop-blur-sm transition-colors hover:text-text-primary"
        >
          {active ? <Minimize2 className="size-4" aria-hidden /> : <Maximize2 className="size-4" aria-hidden />}
        </button>
      </div>

      {/* Persistent watermark — bottom center. */}
      <a
        href="https://frontendforever.dev"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${title} — built on Frontend Forever`}
        className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-text-muted backdrop-blur-sm transition-colors hover:text-text-primary"
      >
        frontendforever.dev
      </a>

      <Dialog open={showCode} onOpenChange={setShowCode}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Source Code</DialogTitle>
            <DialogDescription>
              {isCodeLocked
                ? "The real, first-party source behind this experiment."
                : "The exact source that runs this experiment, read straight from the repo."}
            </DialogDescription>
          </DialogHeader>
          <ExperimentCodeView sources={sources} isLocked={isCodeLocked} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
