"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

// Among all repeated letters in the word, pick the pair with the largest
// gap between occurrences (the most dramatic swap distance); ties go to
// the pair that starts later in the word.
function findSwapPair(text: string): [number, number] | null {
  const positions = new Map<string, number[]>();
  for (let i = 0; i < text.length; i++) {
    const letter = text[i].toLowerCase();
    const list = positions.get(letter) ?? [];
    list.push(i);
    positions.set(letter, list);
  }

  let best: [number, number] | null = null;
  let bestDistance = -1;
  for (const list of positions.values()) {
    if (list.length < 2) continue;
    const i = list[0];
    const j = list[list.length - 1];
    const distance = j - i;
    if (distance > bestDistance || (distance === bestDistance && best !== null && i > best[0])) {
      bestDistance = distance;
      best = [i, j];
    }
  }
  return best;
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const letterVariants: Variants = {
  hidden: { opacity: 0, rotateX: -60 },
  visible: { opacity: 1, rotateX: 0, transition: { duration: 0.4, ease: EASE } },
};

function swapVariants(dx: number): Variants {
  return {
    hidden: { opacity: 0, x: dx, y: 0 },
    visible: {
      opacity: 1,
      x: [dx, dx * 0.5, 0],
      y: [0, -18, 0],
      transition: { duration: 0.6, ease: EASE, delay: 0.1 },
    },
  };
}

type AnimatedHeadingProps = {
  text: string;
  className?: string;
  swapColorClassName?: string;
};

export function AnimatedHeading({ text, className, swapColorClassName }: AnimatedHeadingProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [offsets, setOffsets] = useState<number[] | null>(null);
  const swapPair = useMemo(() => findSwapPair(text), [text]);

  useLayoutEffect(() => {
    function measure() {
      const container = containerRef.current;
      if (!container) return;
      const containerLeft = container.getBoundingClientRect().left;
      setOffsets(
        letterRefs.current.map((el) =>
          el ? el.getBoundingClientRect().left - containerLeft : 0,
        ),
      );
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [text]);

  return (
    <motion.span
      ref={containerRef}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={containerVariants}
    >
      {text.split("").map((char, index) => {
        const swapIndex =
          swapPair?.[0] === index ? swapPair[1] : swapPair?.[1] === index ? swapPair[0] : null;
        const dx = swapIndex !== null && offsets ? offsets[swapIndex] - offsets[index] : 0;

        return (
          <motion.span
            key={index}
            ref={(el) => {
              letterRefs.current[index] = el;
            }}
            style={{ display: "inline-block" }}
            className={cn(swapIndex !== null && swapColorClassName)}
            variants={swapIndex !== null ? swapVariants(dx) : letterVariants}
          >
            {char}
          </motion.span>
        );
      })}
    </motion.span>
  );
}
