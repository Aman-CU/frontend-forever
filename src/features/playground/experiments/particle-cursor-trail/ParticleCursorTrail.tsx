"use client";

import { useEffect, useRef } from "react";

// A self-contained canvas experiment: every pointer move spawns a few particles
// that drift, shrink, and fade. No external libraries — just canvas 2D +
// requestAnimationFrame. Particle colors are read once from the page's own CSS
// custom properties (--color-accent / --color-premium) via getComputedStyle, so
// the effect stays on-brand and theme-aware without hardcoding any hex (AGENTS.md
// rule 2). The canvas backdrop stays transparent; the stage behind it provides
// the surface color.

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 1 → 0
  size: number;
  color: string;
};

// Canvas fillStyle needs a concrete color string — it cannot consume a CSS
// `var(--color-*)` the way a className can, so the brand tokens are resolved to
// real values via getComputedStyle here (same constraint/approach as Feature
// 49's RoughDiagram). The literal below is only a last-resort default if a token
// ever fails to resolve; it's unreachable in practice since these tokens are
// always defined in globals.css. It mirrors --color-accent's own teal so even
// that fallback stays on-brand rather than introducing a foreign color.
function readAccentColors(el: HTMLElement): string[] {
  const styles = getComputedStyle(el);
  const accent = styles.getPropertyValue("--color-accent").trim();
  const premium = styles.getPropertyValue("--color-premium").trim();
  const fallback = "#14b8a6";
  return [accent || fallback, premium || accent || fallback];
}

export function ParticleCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement ?? canvas;
    const colors = readAccentColors(canvas);
    const particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let running = true;

    function resize() {
      const rect = parent.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(x: number, y: number) {
      const count = 3;
      for (let i = 0; i < count; i += 1) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 1.6,
          vy: (Math.random() - 0.5) * 1.6,
          life: 1,
          size: 4 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      // Cap the field so a fast, continuous drag can't grow it without bound.
      if (particles.length > 600) {
        particles.splice(0, particles.length - 600);
      }
    }

    function toLocal(clientX: number, clientY: number): { x: number; y: number } {
      const rect = parent.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function onPointerMove(event: PointerEvent) {
      const { x, y } = toLocal(event.clientX, event.clientY);
      spawn(x, y);
    }

    function onTouchMove(event: TouchEvent) {
      const touch = event.touches[0];
      if (!touch) return;
      const { x, y } = toLocal(touch.clientX, touch.clientY);
      spawn(x, y);
    }

    function tick() {
      if (!running) return;
      ctx!.clearRect(0, 0, width, height);
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // gentle gravity
        p.life -= 0.016;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx!.globalAlpha = Math.max(p.life, 0);
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      rafId = requestAnimationFrame(tick);
    }

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);
    parent.addEventListener("pointermove", onPointerMove);
    parent.addEventListener("touchmove", onTouchMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      parent.removeEventListener("pointermove", onPointerMove);
      parent.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div className="relative h-full w-full cursor-crosshair select-none">
      {/* Behind the canvas (earlier in DOM order): the transparent canvas
          paints on top, so particles always draw over this gentle hint. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <p className="text-sm font-medium text-text-muted">Move your cursor</p>
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
