"use client";

import { motion } from "framer-motion";

type Props = {
  // Each increment of `trigger` replays one confetti burst (a counter, not a
  // boolean, so the same celebration can fire again). Re-keying the container on
  // `trigger` remounts the particles, replaying the animation — no state needed.
  trigger: number;
};

const PIECES = 18;
const EMOJI = ["💸", "🎉", "✨", "💵"];
const DOT_COLORS = ["bg-success", "bg-accent", "bg-xp", "bg-premium"];

// A one-shot confetti/emoji burst from the center — the neal.fun payoff moment.
// Offsets are deterministic (index-derived) to stay render-pure.
export function Celebration({ trigger }: Props) {
  if (trigger <= 0) return null;

  return (
    <div
      key={trigger}
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      aria-hidden
    >
      {Array.from({ length: PIECES }).map((_, i) => {
        const angle = (i / PIECES) * Math.PI * 2;
        const distance = 90 + ((i * 37) % 70);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance - 20;
        const rotate = ((i * 53) % 180) - 90;
        const isEmoji = i % 3 === 0;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 text-lg"
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
            animate={{ x, y, opacity: 0, scale: 1.1, rotate }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {isEmoji ? (
              EMOJI[i % EMOJI.length]
            ) : (
              <span className={`block h-2 w-2 rounded-sm ${DOT_COLORS[i % 4]}`} />
            )}
          </motion.span>
        );
      })}
    </div>
  );
}
