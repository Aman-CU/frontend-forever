import { Fragment } from "react";
import type { ReactNode } from "react";

import { ArrowRight, Box, Database, GitCompare, Monitor, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import type { CardStatuses, StageId } from "../types";
import { ComponentStateBody } from "./stage-bodies/ComponentStateBody";
import { DiffingBody } from "./stage-bodies/DiffingBody";
import { RealDomBody } from "./stage-bodies/RealDomBody";
import { RenderPhaseBody } from "./stage-bodies/RenderPhaseBody";
import { VirtualDomBody } from "./stage-bodies/VirtualDomBody";
import { StageCard } from "./StageCard";
import type { StageColor } from "./StageCard";

type StageMeta = {
  id: StageId;
  icon: LucideIcon;
  title: string;
  color: StageColor;
  captionTitle: string;
  captionSubtext: string;
};

// Keyed by `id`, not position — StageCardsRow looks up each card's status via
// cardStatuses[meta.id], so reordering this array can never desync a card
// from the wrong status the way indexing a positional tuple could.
const STAGE_META: StageMeta[] = [
  { id: "component-state", icon: Database, title: "Component State", color: "premium", captionTitle: "User Click", captionSubtext: "Click Increment" },
  { id: "render-phase", icon: Zap, title: "Render Phase", color: "info", captionTitle: "State Update", captionSubtext: "count becomes 1" },
  { id: "virtual-dom", icon: Box, title: "Virtual DOM", color: "success", captionTitle: "Render Phase", captionSubtext: "Virtual DOM created" },
  { id: "diffing", icon: GitCompare, title: "Diffing", color: "streak", captionTitle: "Diffing", captionSubtext: "Only changed node detected" },
  { id: "real-dom", icon: Monitor, title: "Real DOM", color: "accent", captionTitle: "DOM Update", captionSubtext: "Only the changed node updated" },
];

// 5 card columns (equal 1fr each) interleaved with 4 auto-width arrow
// columns — this is what guarantees the cards distribute evenly across the
// full row width instead of clumping with dead space at the end.
const GRID_TEMPLATE = "grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]";

type StageCardsRowProps = {
  cardStatuses: CardStatuses;
  componentStateCount: number;
  realDomCount: number;
  isPlaying: boolean;
  onIncrement: () => void;
};

export function StageCardsRow({
  cardStatuses,
  componentStateCount,
  realDomCount,
  isPlaying,
  onIncrement,
}: StageCardsRowProps) {
  const bodies: Record<StageId, ReactNode> = {
    "component-state": (
      <ComponentStateBody
        status={cardStatuses["component-state"]}
        count={componentStateCount}
        isPlaying={isPlaying}
        onIncrement={onIncrement}
      />
    ),
    "render-phase": <RenderPhaseBody status={cardStatuses["render-phase"]} />,
    "virtual-dom": <VirtualDomBody status={cardStatuses["virtual-dom"]} />,
    diffing: <DiffingBody status={cardStatuses.diffing} />,
    "real-dom": <RealDomBody status={cardStatuses["real-dom"]} count={realDomCount} />,
  };

  return (
    <div className="overflow-x-auto pb-1 [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)] lg:[mask-image:none]">
      <div className={cn("grid min-w-[760px] items-stretch gap-2", GRID_TEMPLATE)}>
        {STAGE_META.map((meta, index) => (
          <Fragment key={meta.id}>
            <StageCard
              icon={meta.icon}
              title={meta.title}
              color={meta.color}
              status={cardStatuses[meta.id]}
              captionNumber={index + 1}
              captionTitle={meta.captionTitle}
              captionSubtext={meta.captionSubtext}
            >
              {bodies[meta.id]}
            </StageCard>
            {index < STAGE_META.length - 1 && (
              <div className="flex items-center justify-center pb-6" aria-hidden="true">
                <ArrowRight className="size-4 shrink-0 text-accent/40" />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
