import { Fragment } from "react";
import type { ReactNode } from "react";

import { ArrowRight, Box, Database, GitCompare, Monitor, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import type { CardStatuses, RenderScenarioKind, StageId } from "../types";
import { ComponentStateBody } from "./stage-bodies/ComponentStateBody";
import { DiffingBody } from "./stage-bodies/DiffingBody";
import { RealDomBody } from "./stage-bodies/RealDomBody";
import { RenderPhaseBody } from "./stage-bodies/RenderPhaseBody";
import { VirtualDomBody } from "./stage-bodies/VirtualDomBody";
import { ComponentTreeView } from "./ComponentTreeView";
import { StageCard } from "./StageCard";
import type { StageColor } from "./StageCard";

type StageMeta = {
  id: StageId;
  icon: LucideIcon;
  title: string;
  color: StageColor;
  captionTitle: string;
};

// Keyed by `id`, not position — StageCardsRow looks up each card's status via
// cardStatuses[meta.id], so reordering this array can never desync a card
// from the wrong status the way indexing a positional tuple could. The caption
// subtext line is scenario-specific and comes in via props, not from here.
const STAGE_META: StageMeta[] = [
  { id: "component-state", icon: Database, title: "Component State", color: "premium", captionTitle: "User Click" },
  { id: "render-phase", icon: Zap, title: "Render Phase", color: "info", captionTitle: "State Update" },
  { id: "virtual-dom", icon: Box, title: "Virtual DOM", color: "success", captionTitle: "Render Phase" },
  { id: "diffing", icon: GitCompare, title: "Diffing", color: "streak", captionTitle: "Diffing" },
  { id: "real-dom", icon: Monitor, title: "Real DOM", color: "accent", captionTitle: "DOM Update" },
];

// 5 card columns (equal 1fr each) interleaved with 4 auto-width arrow
// columns — this is what guarantees the cards distribute evenly across the
// full row width instead of clumping with dead space at the end.
const GRID_TEMPLATE = "grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]";

type StageCardsRowProps = {
  kind: RenderScenarioKind;
  cardStatuses: CardStatuses;
  componentStateCount: number;
  realDomCount: number;
  /** The value the update settles on — drives the "after" tree in Virtual DOM/Diffing. */
  targetCount: number;
  componentLabel: string;
  stateLabel: string;
  clickLabel: string;
  childLabel: string;
  captionSubtexts: Record<StageId, string>;
  isPlaying: boolean;
  onIncrement: () => void;
};

export function StageCardsRow({
  kind,
  cardStatuses,
  componentStateCount,
  realDomCount,
  targetCount,
  componentLabel,
  stateLabel,
  clickLabel,
  childLabel,
  captionSubtexts,
  isPlaying,
  onIncrement,
}: StageCardsRowProps) {
  const componentState = (
    <ComponentStateBody
      status={cardStatuses["component-state"]}
      count={componentStateCount}
      isPlaying={isPlaying}
      onIncrement={onIncrement}
      componentLabel={componentLabel}
      stateLabel={stateLabel}
      clickLabel={clickLabel}
    />
  );

  // The "wasted-render" scenario swaps the counter trees for a Parent→Child
  // component tree across the four downstream cards; everything else (the card
  // shells, statuses, captions) is shared.
  const bodies: Record<StageId, ReactNode> =
    kind === "wasted-render"
      ? {
          "component-state": componentState,
          "render-phase": (
            <ComponentTreeView
              status={cardStatuses["render-phase"]}
              mode="rerender"
              parentValue={targetCount}
              parentBefore={realDomCount}
              childLabel={childLabel}
            />
          ),
          "virtual-dom": (
            <ComponentTreeView
              status={cardStatuses["virtual-dom"]}
              mode="vdom"
              parentValue={targetCount}
              parentBefore={realDomCount}
              childLabel={childLabel}
            />
          ),
          diffing: (
            <ComponentTreeView
              status={cardStatuses.diffing}
              mode="diff"
              parentValue={targetCount}
              parentBefore={realDomCount}
              childLabel={childLabel}
            />
          ),
          "real-dom": (
            <ComponentTreeView
              status={cardStatuses["real-dom"]}
              mode="commit"
              parentValue={realDomCount}
              parentBefore={realDomCount}
              childLabel={childLabel}
            />
          ),
        }
      : {
          "component-state": componentState,
          "render-phase": <RenderPhaseBody status={cardStatuses["render-phase"]} />,
          "virtual-dom": <VirtualDomBody status={cardStatuses["virtual-dom"]} count={targetCount} />,
          diffing: <DiffingBody status={cardStatuses.diffing} count={targetCount} />,
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
              captionSubtext={captionSubtexts[meta.id]}
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
