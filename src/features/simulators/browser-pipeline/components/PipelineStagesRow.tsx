import { Fragment } from "react";
import type { ReactNode } from "react";

import { ArrowRight, LayoutGrid, Monitor, Network, PaintBucket } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import type { StageId, StageStatuses } from "../types";
import { CompositeVisual } from "./CompositeVisual";
import { LayoutVisual } from "./LayoutVisual";
import { PaintVisual } from "./PaintVisual";
import { PipelineCard } from "./PipelineCard";
import type { PipelineColor } from "./PipelineCard";
import { RenderTreeVisual } from "./RenderTreeVisual";

type SequentialStageId = Extract<StageId, "render-tree" | "layout" | "paint" | "composite">;

type StageMeta = {
  id: SequentialStageId;
  icon: LucideIcon;
  color: PipelineColor;
  title: string;
  captionTitle: string;
  captionSubtext: string;
};

// Keyed by id, same precedent as react-rendering's STAGE_META / this
// feature's own TRACK_META — a card can't desync from the wrong status.
const STAGE_META: StageMeta[] = [
  {
    id: "render-tree",
    icon: Network,
    color: "accent",
    title: "Render Tree",
    captionTitle: "Render Tree",
    captionSubtext: "DOM + CSSOM merge, display:none excluded",
  },
  {
    id: "layout",
    icon: LayoutGrid,
    color: "streak",
    title: "Layout",
    captionTitle: "Layout",
    captionSubtext: "Every box gets size & position",
  },
  {
    id: "paint",
    icon: PaintBucket,
    color: "success",
    title: "Paint",
    captionTitle: "Paint",
    captionSubtext: "Color, text, borders filled in",
  },
  {
    id: "composite",
    icon: Monitor,
    color: "accent",
    title: "Composite",
    captionTitle: "Composite",
    captionSubtext: "Layers flatten into the final pixels",
  },
];

const GRID_TEMPLATE = "grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]";

export function PipelineStagesRow({ stageStatuses }: { stageStatuses: StageStatuses }) {
  const bodies: Record<SequentialStageId, ReactNode> = {
    "render-tree": <RenderTreeVisual status={stageStatuses["render-tree"]} />,
    layout: <LayoutVisual status={stageStatuses.layout} />,
    paint: <PaintVisual status={stageStatuses.paint} />,
    composite: <CompositeVisual status={stageStatuses.composite} />,
  };

  return (
    <div className="overflow-x-auto pb-1 [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)] lg:[mask-image:none]">
      <div className={cn("grid min-w-[600px] items-stretch gap-2", GRID_TEMPLATE)}>
        {STAGE_META.map((meta, index) => (
          <Fragment key={meta.id}>
            <PipelineCard
              icon={meta.icon}
              title={meta.title}
              color={meta.color}
              status={stageStatuses[meta.id]}
              captionNumber={index + 3}
              captionTitle={meta.captionTitle}
              captionSubtext={meta.captionSubtext}
            >
              {bodies[meta.id]}
            </PipelineCard>
            {index < STAGE_META.length - 1 && (
              <div className="flex items-center justify-center pb-5" aria-hidden="true">
                <ArrowRight className="size-4 shrink-0 text-accent/40" />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
