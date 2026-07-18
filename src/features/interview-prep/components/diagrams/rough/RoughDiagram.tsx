"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";
import type { RoughSVG } from "roughjs/bin/svg";

// Theme-aware colors resolved at draw time. roughjs bakes literal color
// strings into the generated SVG paths — it can't read CSS variables itself
// the way a plain stroke="var(--color-border)" attribute can (unlike the
// static hand-authored SVG diagrams in ../, which do exactly that) — so this
// wrapper reads the real computed values and redraws whenever the theme
// class flips.
export type RoughThemeColors = {
  ink: string;
  muted: string;
  accent: string;
  success: string;
  warning: string;
  surface: string;
};

function readColor(varName: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

function readThemeColors(): RoughThemeColors {
  return {
    ink: readColor("--color-text-primary", "#1a1a1a"),
    muted: readColor("--color-text-secondary", "#666666"),
    accent: readColor("--color-accent", "#0d9488"),
    success: readColor("--color-success", "#16a34a"),
    warning: readColor("--color-warning", "#d97706"),
    surface: readColor("--color-surface", "#ffffff"),
  };
}

type Props = {
  viewBox: string;
  ariaLabel: string;
  draw: (rc: RoughSVG, colors: RoughThemeColors) => SVGElement[];
  className?: string;
  // Crisp, normally-React-rendered SVG content (box labels, etc.) layered
  // over the rough-sketched shapes — roughjs draws shapes only, never text.
  overlay?: React.ReactNode;
};

export function RoughDiagram({ viewBox, ariaLabel, draw, className, overlay }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const svgEl = svgRef.current;
    const groupEl = groupRef.current;
    if (!svgEl || !groupEl) return;

    function render() {
      const rc = rough.svg(svgEl!);
      while (groupEl!.firstChild) groupEl!.removeChild(groupEl!.firstChild);
      for (const node of draw(rc, readThemeColors())) {
        groupEl!.appendChild(node);
      }
    }

    render();

    // ThemeProvider toggles a "dark" class on <html> (no data-theme
    // attribute in this codebase) — observe that directly, same mechanism
    // ThemeProvider's own useSyncExternalStore subscribe() uses.
    const observer = new MutationObserver(render);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [draw]);

  return (
    <figure className={className ?? "my-2 overflow-x-auto rounded-lg border border-border bg-surface p-4"}>
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="h-auto w-full min-w-[560px]"
        role="img"
        aria-label={ariaLabel}
      >
        <g ref={groupRef} />
        {overlay}
      </svg>
    </figure>
  );
}
