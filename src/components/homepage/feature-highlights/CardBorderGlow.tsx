"use client";

import { motion, useReducedMotion } from "framer-motion";

const PERIMETER = {
  top: ["0%", "0%", "100%", "100%", "0%"],
  left: ["0%", "100%", "100%", "0%", "0%"],
};

const STATIC_CORNER = { top: "0%", left: "0%" };

const TRANSITION = { duration: 6, repeat: Infinity, ease: "linear" } as const;
const STATIC_TRANSITION = { duration: 0 } as const;

export function CardBorderGlow() {
  const prefersReducedMotion = useReducedMotion();
  const animate = prefersReducedMotion ? STATIC_CORNER : PERIMETER;
  const transition = prefersReducedMotion ? STATIC_TRANSITION : TRANSITION;

  return (
    <>
      <motion.div
        aria-hidden="true"
        animate={animate}
        transition={transition}
        className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-70 blur-md"
      />
      <motion.div
        aria-hidden="true"
        animate={animate}
        transition={transition}
        className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
      />
    </>
  );
}
