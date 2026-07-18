"use client";

import type { RoughSVG } from "roughjs/bin/svg";

import { RoughDiagram, type RoughThemeColors } from "./RoughDiagram";
import { drawArrow, drawLine } from "./roughPrimitives";

// A generic, data-driven sequence/time-ordered diagram — same "auto-layout
// from plain data" tradeoff as FlowDiagram, but for the protocol-heavy guides
// (WebRTC signaling, OT merge races, sync-engine reconnects) where the useful
// picture is "who sends what, in what order" rather than a static component
// graph. Actors run left-to-right as lifelines; messages stack top-to-bottom
// in the order given. `dashed: true` marks a response/ack, rendered muted
// instead of accent so the request/response pairing reads at a glance.
export type SequenceActor = { id: string; label: string };
export type SequenceMessage = { from: string; to: string; label: string; dashed?: boolean };

type Props = {
  actors: SequenceActor[];
  messages: SequenceMessage[];
  ariaLabel: string;
};

const ACTOR_W = 150;
const ACTOR_H = 40;
const SPACING = 190;
const STEP_Y = 54;
const PADDING = 20;
const LOOP_W = 70;
const LOOP_H = 18;

export function SequenceDiagram({ actors, messages, ariaLabel }: Props) {
  const centerX = new Map(actors.map((a, i) => [a.id, PADDING + ACTOR_W / 2 + i * SPACING]));
  const width = PADDING * 2 + ACTOR_W + Math.max(0, actors.length - 1) * SPACING;
  const lifelineTop = PADDING + ACTOR_H;
  const firstMessageY = lifelineTop + 34;
  const height = firstMessageY + messages.length * STEP_Y + PADDING;

  function draw(rc: RoughSVG, colors: RoughThemeColors): SVGElement[] {
    const els: SVGElement[] = [];

    for (const actor of actors) {
      const x = centerX.get(actor.id)!;
      els.push(drawLine(rc, x, lifelineTop, x, height - PADDING, { stroke: colors.muted, roughness: 1.2 }));
    }

    messages.forEach((msg, i) => {
      const y = firstMessageY + i * STEP_Y;
      const fromX = centerX.get(msg.from);
      const toX = centerX.get(msg.to);
      if (fromX === undefined || toX === undefined) return;
      const stroke = msg.dashed ? colors.muted : colors.accent;

      if (msg.from === msg.to) {
        els.push(drawLine(rc, fromX, y, fromX + LOOP_W, y, { stroke, roughness: 1.4 }));
        els.push(
          drawLine(rc, fromX + LOOP_W, y, fromX + LOOP_W, y + LOOP_H, { stroke, roughness: 1.4 }),
        );
        els.push(
          drawArrow(rc, fromX + LOOP_W, y + LOOP_H, fromX, y + LOOP_H, { stroke, roughness: 1.4 }),
        );
      } else {
        els.push(drawArrow(rc, fromX, y, toX, y, { stroke, roughness: 1.4 }));
      }
    });

    return els;
  }

  return (
    <RoughDiagram
      viewBox={`0 0 ${width} ${height}`}
      ariaLabel={ariaLabel}
      draw={draw}
      overlay={
        <g fontSize={11} textAnchor="middle">
          {actors.map((actor) => {
            const x = centerX.get(actor.id)!;
            return (
              <g key={actor.id}>
                <rect
                  x={x - ACTOR_W / 2}
                  y={PADDING}
                  width={ACTOR_W}
                  height={ACTOR_H}
                  rx={6}
                  fill="var(--color-surface-secondary)"
                  stroke="none"
                />
                <text x={x} y={PADDING + ACTOR_H / 2 + 4} fontWeight={600} fill="var(--color-text-primary)">
                  {actor.label}
                </text>
              </g>
            );
          })}
          {messages.map((msg, i) => {
            const y = firstMessageY + i * STEP_Y;
            const fromX = centerX.get(msg.from);
            const toX = centerX.get(msg.to);
            if (fromX === undefined || toX === undefined) return null;
            const isSelf = msg.from === msg.to;
            const labelX = isSelf ? fromX + LOOP_W / 2 : (fromX + toX) / 2;
            const labelY = isSelf ? y - 6 : y - 8;
            return (
              <text
                key={i}
                x={labelX}
                y={labelY}
                fill={msg.dashed ? "var(--color-text-secondary)" : "var(--color-text-primary)"}
              >
                {`${i + 1}. ${msg.label}`}
              </text>
            );
          })}
        </g>
      }
    />
  );
}
