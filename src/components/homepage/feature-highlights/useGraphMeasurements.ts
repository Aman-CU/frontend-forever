"use client";

import { useLayoutEffect, useRef, useState } from "react";

import {
  FALLBACK_CARD,
  FALLBACK_LEFT,
  FALLBACK_RIGHT,
} from "@/components/homepage/feature-highlights/graphData";

export function useGraphMeasurements() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const leftPillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rightPillRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [leftPoints, setLeftPoints] = useState(FALLBACK_LEFT);
  const [rightPoints, setRightPoints] = useState(FALLBACK_RIGHT);
  const [card, setCard] = useState(FALLBACK_CARD);

  useLayoutEffect(() => {
    function measure() {
      const container = containerRef.current;
      const cardEl = cardRef.current;
      if (!container || !cardEl) return;
      const containerRect = container.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) return;

      const toX = (px: number) => ((px - containerRect.left) / containerRect.width) * 100;
      const toY = (px: number) => ((px - containerRect.top) / containerRect.height) * 100;

      setLeftPoints(
        leftPillRefs.current.map((el, index) => {
          if (!el) return FALLBACK_LEFT[index];
          const r = el.getBoundingClientRect();
          return { x: toX(r.right), y: toY(r.top + r.height / 2) };
        }),
      );
      setRightPoints(
        rightPillRefs.current.map((el, index) => {
          if (!el) return FALLBACK_RIGHT[index];
          const r = el.getBoundingClientRect();
          return { x: toX(r.left), y: toY(r.top + r.height / 2) };
        }),
      );
      const cardRect = cardEl.getBoundingClientRect();
      setCard({
        left: toX(cardRect.left),
        right: toX(cardRect.right),
        top: toY(cardRect.top),
        bottom: toY(cardRect.bottom),
      });
    }

    measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return { containerRef, cardRef, leftPillRefs, rightPillRefs, leftPoints, rightPoints, card };
}
