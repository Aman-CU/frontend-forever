"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { CollectionsCard } from "@/components/homepage/feature-highlights/CollectionsCard";
import {
  LEFT_TOPICS,
  RIGHT_TOPICS,
  VIEWBOX_HEIGHT,
  VIEWBOX_WIDTH,
  Y_SLOTS,
  cardEntryY,
  linkPath,
  sampleLink,
  toSvgY,
} from "@/components/homepage/feature-highlights/graphData";
import { useGraphMeasurements } from "@/components/homepage/feature-highlights/useGraphMeasurements";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const pathVariants = {
  hidden: { pathLength: 0 },
  visible: { pathLength: 1 },
};

export function PlatformGraph() {
  const { containerRef, cardRef, leftPillRefs, rightPillRefs, leftPoints, rightPoints, card } =
    useGraphMeasurements();

  const leftHighlight = sampleLink(
    leftPoints[0].x,
    toSvgY(leftPoints[0].y),
    card.left,
    toSvgY(cardEntryY(card, 0)),
  );
  const rightHighlight = sampleLink(
    rightPoints[0].x,
    toSvgY(rightPoints[0].y),
    card.right,
    toSvgY(cardEntryY(card, 0)),
  );

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
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
        >
          <defs>
            <linearGradient id="ff-graph-highlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "var(--color-xp)" }} />
              <stop offset="100%" style={{ stopColor: "var(--color-streak)" }} />
            </linearGradient>
          </defs>
          {leftPoints.map((point, index) => (
            <motion.path
              key={LEFT_TOPICS[index]}
              variants={pathVariants}
              transition={{ duration: 1, ease: EASE, delay: index * 0.1 }}
              d={linkPath(point.x, toSvgY(point.y), card.left, toSvgY(cardEntryY(card, index)))}
              fill="none"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeWidth={index === 0 ? 2 : 1.25}
              className={index === 0 ? undefined : "stroke-border-muted"}
              stroke={index === 0 ? "url(#ff-graph-highlight)" : undefined}
            />
          ))}
          {rightPoints.map((point, index) => (
            <motion.path
              key={RIGHT_TOPICS[index]}
              variants={pathVariants}
              transition={{ duration: 1, ease: EASE, delay: index * 0.1 }}
              d={linkPath(point.x, toSvgY(point.y), card.right, toSvgY(cardEntryY(card, index)))}
              fill="none"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeWidth={index === 0 ? 2 : 1.25}
              className={index === 0 ? undefined : "stroke-border-muted"}
              stroke={index === 0 ? "url(#ff-graph-highlight)" : undefined}
            />
          ))}
          <motion.circle
            r={1.6}
            className="fill-xp"
            vectorEffect="non-scaling-stroke"
            initial={{ opacity: 0 }}
            animate={{ cx: leftHighlight.cx, cy: leftHighlight.cy, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "linear", delay: 0.6 }}
          />
          <motion.circle
            r={1.6}
            className="fill-xp"
            vectorEffect="non-scaling-stroke"
            initial={{ opacity: 0 }}
            animate={{ cx: rightHighlight.cx, cy: rightHighlight.cy, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "linear", delay: 1.1 }}
          />
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
          animate={{ opacity: [0.08, 0.2, 0.08], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent blur-3xl"
        />
        <motion.span
          aria-hidden="true"
          animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "26%" }}
          className="absolute left-1/2 flex size-7 -translate-x-1/2 items-center justify-center rounded-full bg-xp-light text-xp"
        >
          <Sparkles className="size-4" aria-hidden="true" />
        </motion.span>

        <div
          ref={cardRef}
          className="absolute top-1/2 left-1/2 w-64 -translate-x-1/2 -translate-y-1/2"
        >
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
