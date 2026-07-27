"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { flowConnectorPath, type FlowRow } from "@/features/roadmaps/lib/flowLayout";

export type FlowConnectorPath = { id: string; d: string };

// Measures real rendered DOM positions (useLayoutEffect + getBoundingClientRect,
// re-run on window resize) rather than computing branch-pill positions by
// hand — the same approach PlatformGraph.tsx uses for its curved lines,
// necessary here for the same reason: a branch group's pill count (and so
// its stacked height) varies node to node, so there's no fixed offset that
// works for every section.
export function useFlowConnectors(rows: FlowRow[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spineRefs = useRef(new Map<string, HTMLElement>());
  const branchRefs = useRef(new Map<string, HTMLElement>());
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [paths, setPaths] = useState<FlowConnectorPath[]>([]);

  useLayoutEffect(() => {
    function measure() {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) return;

      const toX = (px: number) => px - containerRect.left;
      const toY = (px: number) => px - containerRect.top;

      const next: FlowConnectorPath[] = [];
      for (const row of rows) {
        if (row.kind !== "section" || row.branches.length === 0) continue;
        const spineEl = spineRefs.current.get(row.node.id);
        if (!spineEl) continue;
        const spineRect = spineEl.getBoundingClientRect();
        const startX = toX(row.side === "right" ? spineRect.right : spineRect.left);
        const startY = toY(spineRect.top + spineRect.height / 2);

        for (const branch of row.branches) {
          const branchEl = branchRefs.current.get(branch.id);
          if (!branchEl) continue;
          const branchRect = branchEl.getBoundingClientRect();
          const endX = toX(row.side === "right" ? branchRect.left : branchRect.right);
          const endY = toY(branchRect.top + branchRect.height / 2);
          next.push({ id: branch.id, d: flowConnectorPath(startX, startY, endX, endY) });
        }
      }

      setSize({ width: containerRect.width, height: containerRect.height });
      setPaths(next);
    }

    measure();
    const raf = requestAnimationFrame(measure);

    // Coalesced through rAF, not called directly — a live window-resize
    // drag can fire the native resize event dozens of times per frame, and
    // each measure() does a getBoundingClientRect() per branch pill plus 2
    // setState calls, so calling it unthrottled was real jank risk on a
    // roadmap with many branches. At most one measurement per frame either
    // way, regardless of how many resize events land in between.
    let resizeRaf: number | null = null;
    function handleResize() {
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(measure);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(raf);
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", handleResize);
    };
  }, [rows]);

  return { containerRef, spineRefs, branchRefs, size, paths };
}
