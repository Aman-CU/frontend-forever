"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// The runnable side of the experiments registry. Kept separate from registry.ts
// (the server-safe metadata) because next/dynamic({ ssr: false }) is only legal
// inside a Client Component — these demos are canvas/rAF/browser-API driven and
// have no meaningful server render, so they load client-only. registry.ts stays
// importable from the RSC list/detail pages; this file is only ever pulled in by
// the client stage component.
function loadingStage() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <p className="text-sm text-text-muted">Loading experiment…</p>
    </div>
  );
}

export const EXPERIMENT_COMPONENTS: Record<string, ComponentType> = {
  "particle-cursor-trail": dynamic(
    () =>
      import("./particle-cursor-trail/ParticleCursorTrail").then(
        (mod) => mod.ParticleCursorTrail,
      ),
    { ssr: false, loading: loadingStage },
  ),
};
