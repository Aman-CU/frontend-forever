"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const COLLECTIONS = ["FF 75", "FF JavaScript", "FF React", "FF System Design"];
const LEFT_TOPICS = ["JavaScript Runtime", "Browser Internals", "CSS", "TypeScript"];
const RIGHT_TOPICS = ["React", "Accessibility", "Performance", "System Design"];

const Y_SLOTS = [12, 38, 64, 90];

const FALLBACK_LEFT = LEFT_TOPICS.map((_, index) => ({ x: 24, y: Y_SLOTS[index] }));
const FALLBACK_RIGHT = RIGHT_TOPICS.map((_, index) => ({ x: 76, y: Y_SLOTS[index] }));
const FALLBACK_CARD = { left: 36, right: 64, top: 30, bottom: 70 };

function linkPath(startX: number, startY: number, endX: number, endY: number) {
  const midX = (startX + endX) / 2;
  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
}

function cardEntryY(card: typeof FALLBACK_CARD, index: number) {
  const t = index / (Y_SLOTS.length - 1);
  return card.top + t * (card.bottom - card.top);
}

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const fadeInVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const pathVariants = {
  hidden: { pathLength: 0 },
  visible: { pathLength: 1 },
};

function CollectionsCard() {
  return (
    <div className="flex w-full flex-col gap-1.5 rounded-2xl border border-border bg-surface p-3 shadow-xl">
      {COLLECTIONS.map((collection, index) => (
        <div key={collection} className="flex items-center gap-3 px-2 py-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-xs font-semibold text-text-secondary">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-text-primary">{collection}</span>
        </div>
      ))}
    </div>
  );
}

export function PlatformGraph() {
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
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

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
          viewBox="0 0 100 100"
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
            <motion.path
              key={LEFT_TOPICS[index]}
              variants={pathVariants}
              transition={{ duration: 1, ease: EASE, delay: index * 0.1 }}
              d={linkPath(point.x, point.y, card.left, cardEntryY(card, index))}
              fill="none"
              strokeWidth={index === 0 ? 0.7 : 0.4}
              className={index === 0 ? undefined : "stroke-border-muted"}
              stroke={index === 0 ? "url(#ff-graph-highlight)" : undefined}
            />
          ))}
          {rightPoints.map((point, index) => (
            <motion.path
              key={RIGHT_TOPICS[index]}
              variants={pathVariants}
              transition={{ duration: 1, ease: EASE, delay: index * 0.1 }}
              d={linkPath(point.x, point.y, card.right, cardEntryY(card, index))}
              fill="none"
              strokeWidth={index === 0 ? 0.7 : 0.4}
              className={index === 0 ? undefined : "stroke-border-muted"}
              stroke={index === 0 ? "url(#ff-graph-highlight)" : undefined}
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

        <div ref={cardRef} className="absolute top-1/2 left-1/2 w-64 -translate-x-1/2 -translate-y-1/2">
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
