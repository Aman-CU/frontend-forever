"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { FeatureHighlight, FeatureThemeColor } from "@/components/homepage/feature-highlights/FeatureCard";

const NODE_POSITIONS = [
  { x: 50, y: 8 },
  { x: 92, y: 50 },
  { x: 50, y: 92 },
  { x: 8, y: 50 },
];

const LINE_THEME: Record<FeatureThemeColor, { stroke: string; fill: string; node: string }> = {
  accent: { stroke: "stroke-accent", fill: "fill-accent", node: "bg-accent-light text-accent" },
  info: { stroke: "stroke-info", fill: "fill-info", node: "bg-info-light text-info" },
  premium: {
    stroke: "stroke-premium",
    fill: "fill-premium",
    node: "bg-premium-light text-premium",
  },
  success: {
    stroke: "stroke-success",
    fill: "fill-success",
    node: "bg-success-light text-success",
  },
};

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

type PlatformGraphProps = {
  features: FeatureHighlight[];
};

export function PlatformGraph({ features }: PlatformGraphProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative mx-auto mt-12 aspect-square w-full max-w-sm sm:max-w-md md:mt-16 md:max-w-lg"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
        {features.map((feature, index) => {
          const pos = NODE_POSITIONS[index];
          const theme = LINE_THEME[feature.color];
          return (
            <g key={feature.id}>
              <line
                x1={pos.x}
                y1={pos.y}
                x2={50}
                y2={50}
                strokeWidth={2.5}
                opacity={0.12}
                className={theme.stroke}
              />
              <line
                x1={pos.x}
                y1={pos.y}
                x2={50}
                y2={50}
                strokeWidth={0.7}
                strokeLinecap="round"
                opacity={0.6}
                className={theme.stroke}
              />
              <motion.circle
                r={1.3}
                className={theme.fill}
                initial={{ opacity: 0 }}
                animate={{ cx: [pos.x, 50], cy: [pos.y, 50], opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.35,
                }}
              />
            </g>
          );
        })}
      </svg>

      {features.map((feature, index) => {
        const pos = NODE_POSITIONS[index];
        const theme = LINE_THEME[feature.color];
        const Icon = feature.icon;
        return (
          <div
            key={feature.id}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
          >
            <div
              className={cn(
                "flex size-12 items-center justify-center rounded-full shadow-md sm:size-14",
                theme.node,
              )}
            >
              <Icon className="size-5 sm:size-6" aria-hidden="true" />
            </div>
            <span className="max-w-20 text-center text-xs font-medium text-text-secondary sm:text-sm">
              {feature.shortLabel}
            </span>
          </div>
        );
      })}

      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <div className="relative flex size-20 items-center justify-center rounded-full bg-surface shadow-xl sm:size-24">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-accent opacity-10 blur-xl"
          />
          <span className="relative text-lg font-extrabold tracking-tight text-text-primary sm:text-xl">
            FF
          </span>
        </div>
      </div>
    </motion.div>
  );
}
