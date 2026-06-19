"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { CardBorderGlow } from "@/components/homepage/feature-highlights/CardBorderGlow";
import { CollectionsCard } from "@/components/homepage/feature-highlights/CollectionsCard";
import { GraphLine } from "@/components/homepage/feature-highlights/GraphLine";
import {
  LEFT_TOPICS,
  RIGHT_TOPICS,
  VIEWBOX_HEIGHT,
  VIEWBOX_WIDTH,
  Y_SLOTS,
} from "@/components/homepage/feature-highlights/graphData";
import { useGraphMeasurements } from "@/components/homepage/feature-highlights/useGraphMeasurements";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function PlatformGraph() {
  const prefersReducedMotion = useReducedMotion();
  const { containerRef, cardRef, leftPillRefs, rightPillRefs, leftPoints, rightPoints, card } =
    useGraphMeasurements();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeInVariants}
      transition={{ duration: 0.6, ease: EASE }}
      className="mx-auto mt-12 w-full max-w-4xl md:mt-16"
    >
      <div ref={containerRef} className="relative hidden aspect-video md:block">
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
        >
          <defs>
            <linearGradient id="ff-graph-highlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "var(--color-xp)" }} />
              <stop offset="100%" style={{ stopColor: "var(--color-streak)" }} />
            </linearGradient>
          </defs>
          {leftPoints.map((point, index) => (
            <GraphLine
              key={LEFT_TOPICS[index]}
              point={point}
              index={index}
              cardEdgeX={card.left}
              card={card}
              dotDelay={index * 0.4}
            />
          ))}
          {rightPoints.map((point, index) => (
            <GraphLine
              key={RIGHT_TOPICS[index]}
              point={point}
              index={index}
              cardEdgeX={card.right}
              card={card}
              dotDelay={index * 0.4 + 0.25}
            />
          ))}
        </svg>

        {LEFT_TOPICS.map((topic, index) => (
          <motion.span
            key={topic}
            ref={(el) => {
              leftPillRefs.current[index] = el;
            }}
            variants={fadeInVariants}
            transition={{ duration: 0.5, ease: EASE, delay: index * 0.1 }}
            style={{ left: "2%", top: `${Y_SLOTS[index]}%` }}
            className="absolute -translate-y-1/2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium whitespace-nowrap text-text-secondary shadow-sm"
          >
            {topic}
          </motion.span>
        ))}
        {RIGHT_TOPICS.map((topic, index) => (
          <motion.span
            key={topic}
            ref={(el) => {
              rightPillRefs.current[index] = el;
            }}
            variants={fadeInVariants}
            transition={{ duration: 0.5, ease: EASE, delay: index * 0.1 }}
            style={{ right: "2%", top: `${Y_SLOTS[index]}%` }}
            className="absolute -translate-y-1/2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium whitespace-nowrap text-text-secondary shadow-sm"
          >
            {topic}
          </motion.span>
        ))}

        <motion.div
          aria-hidden="true"
          animate={
            prefersReducedMotion
              ? { opacity: 0.14, scale: 1 }
              : { opacity: [0.08, 0.2, 0.08], scale: [1, 1.1, 1] }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
          className="absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent blur-3xl"
        />
        <motion.span
          aria-hidden="true"
          animate={prefersReducedMotion ? { y: 0, rotate: 0 } : { y: [0, -8, 0], rotate: [0, 10, 0] }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
          }
          style={{ top: "26%" }}
          className="absolute left-1/2 flex size-7 -translate-x-1/2 items-center justify-center rounded-full bg-xp-light text-xp"
        >
          <Sparkles className="size-4" aria-hidden="true" />
        </motion.span>

        <div
          ref={cardRef}
          className="absolute top-1/2 left-1/2 w-64 -translate-x-1/2 -translate-y-1/2"
        >
          <CardBorderGlow />
          <CollectionsCard />
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-6 md:hidden">
        <div className="w-full max-w-xs">
          <CollectionsCard />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {[...LEFT_TOPICS, ...RIGHT_TOPICS].map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
