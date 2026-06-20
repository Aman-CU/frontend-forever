"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
  DOT_FILL_CLASSES,
  cardEntryY,
  linkPath,
  sampleLink,
  toSvgY,
  type GraphCard,
  type GraphPoint,
} from "@/components/homepage/feature-highlights/graphData";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

type GraphLineProps = {
  point: GraphPoint;
  index: number;
  cardEdgeX: number;
  card: GraphCard;
  dotDelay: number;
};

export function GraphLine({ point, index, cardEdgeX, card, dotDelay }: GraphLineProps) {
  const prefersReducedMotion = useReducedMotion();
  const startY = toSvgY(point.y);
  const endY = toSvgY(cardEntryY(card, index));
  const sample = sampleLink(point.x, startY, cardEdgeX, endY);
  const dotFill = DOT_FILL_CLASSES[index % DOT_FILL_CLASSES.length];

  return (
    <>
      <motion.path
        variants={fadeInVariants}
        transition={{ duration: 0.6, ease: EASE, delay: index * 0.1 }}
        d={linkPath(point.x, startY, cardEdgeX, endY)}
        fill="none"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeWidth={index === 0 ? 2 : 1.25}
        className={index === 0 ? undefined : "stroke-border-muted"}
        stroke={index === 0 ? "url(#ff-graph-highlight)" : undefined}
      />
      <motion.circle
        r={1.4}
        className={dotFill}
        vectorEffect="non-scaling-stroke"
        initial={{ cx: sample.cx[0], cy: sample.cy[0], opacity: 0 }}
        animate={
          prefersReducedMotion
            ? { cx: sample.cx[0], cy: sample.cy[0], opacity: 0.8 }
            : { cx: sample.cx, cy: sample.cy, opacity: [0, 1, 1, 0] }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0.4, delay: dotDelay }
            : { duration: 2.2 + index * 0.35, repeat: Infinity, ease: "linear", delay: dotDelay }
        }
      />
    </>
  );
}
