"use client";

import { motion } from "framer-motion";

const PERIMETER = {
  top: ["0%", "0%", "100%", "100%", "0%"],
  left: ["0%", "100%", "100%", "0%", "0%"],
};

const TRANSITION = { duration: 6, repeat: Infinity, ease: "linear" } as const;

export function CardBorderGlow() {
  return (
    <>
      <motion.div
        aria-hidden="true"
        animate={PERIMETER}
        transition={TRANSITION}
        className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-70 blur-md"
      />
      <motion.div
        aria-hidden="true"
        animate={PERIMETER}
        transition={TRANSITION}
        className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
      />
    </>
  );
}
