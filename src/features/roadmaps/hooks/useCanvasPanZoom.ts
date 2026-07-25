"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export type CanvasTransform = { x: number; y: number; scale: number };

const MIN_SCALE = 0.4;
const MAX_SCALE = 1.75;
const WHEEL_ZOOM_SPEED = 0.0015;
const BUTTON_ZOOM_STEP = 0.2;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// Custom pan/zoom over a CSS transform — no dependency (same "build it
// in-house" precedent as Feature 49's rough.js system). Wheel zoom is bound
// as a native, non-passive listener via containerRef rather than React's
// onWheel prop: React attaches synthetic wheel handlers as passive by
// default, and calling preventDefault() inside a passive listener is a
// silent no-op (the page scrolls along with the canvas) — a native listener
// with { passive: false } is the only way to actually stop that.
export function useCanvasPanZoom(containerRef: RefObject<HTMLDivElement | null>) {
  const [transform, setTransform] = useState<CanvasTransform>({ x: 0, y: 0, scale: 1 });
  const dragState = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // A pointerdown that started on a node button shouldn't begin a pan
    // drag at all — capturing the pointer here would fight the button's
    // own native click. Let it fall through untouched.
    if ((e.target as HTMLElement).closest("[data-roadmap-node-interactive]")) return;

    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    dragState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: transform.x,
      originY: transform.y,
    };
  }, [transform.x, transform.y]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    setTransform((t) => ({
      ...t,
      x: drag.originX + (e.clientX - drag.startX),
      y: drag.originY + (e.clientY - drag.startY),
    }));
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (dragState.current?.pointerId === e.pointerId) dragState.current = null;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setTransform((t) => ({ ...t, scale: clamp(t.scale - e.deltaY * WHEEL_ZOOM_SPEED, MIN_SCALE, MAX_SCALE) }));
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [containerRef]);

  const zoomIn = useCallback(() => {
    setTransform((t) => ({ ...t, scale: clamp(t.scale + BUTTON_ZOOM_STEP, MIN_SCALE, MAX_SCALE) }));
  }, []);

  const zoomOut = useCallback(() => {
    setTransform((t) => ({ ...t, scale: clamp(t.scale - BUTTON_ZOOM_STEP, MIN_SCALE, MAX_SCALE) }));
  }, []);

  const reset = useCallback(() => setTransform({ x: 0, y: 0, scale: 1 }), []);

  return { transform, onPointerDown, onPointerMove, onPointerUp, zoomIn, zoomOut, reset };
}
