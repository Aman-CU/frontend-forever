"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  // Format the (possibly fractional, mid-tween) number for display.
  format?: (n: number) => string;
  durationMs?: number;
  className?: string;
};

// A number that eases to its new value instead of snapping — the satisfying
// "ticking counter" feel. rAF tween with a cubic ease-out.
export function CountUp({ value, format, durationMs = 400, className }: Props) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, durationMs]);

  return (
    <span className={className}>{format ? format(display) : Math.round(display).toString()}</span>
  );
}
