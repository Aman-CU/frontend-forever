"use client";

import { Fragment } from "react";

import {
  Braces,
  FileCode,
  GitBranch,
  LayoutGrid,
  ListTree,
  Monitor,
  Network,
  PaintBucket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";

import { STAGE_IDS } from "../types";
import type { StageId, StageStatuses } from "../types";
import { PIPELINE_THEME } from "./PipelineCard";
import type { PipelineColor } from "./PipelineCard";

type RailMeta = { id: StageId; label: string; icon: LucideIcon; color: PipelineColor };

const RAIL_META: RailMeta[] = [
  { id: "html", label: "HTML", icon: FileCode, color: "info" },
  { id: "dom", label: "DOM", icon: GitBranch, color: "info" },
  { id: "css", label: "CSS", icon: Braces, color: "premium" },
  { id: "cssom", label: "CSSOM", icon: ListTree, color: "premium" },
  { id: "render-tree", label: "Render Tree", icon: Network, color: "accent" },
  { id: "layout", label: "Layout", icon: LayoutGrid, color: "streak" },
  { id: "paint", label: "Paint", icon: PaintBucket, color: "success" },
  { id: "composite", label: "Composite", icon: Monitor, color: "accent" },
];

// A persistent strip showing all 8 build-plan stage names lighting up in
// order, even though the real visualization below groups them into 2
// parallel tracks + a 4-stage pipeline rather than one flat row.
export function StageRail({ stageStatuses }: { stageStatuses: StageStatuses }) {
  const prefersReducedMotion = useSafeReducedMotion();

  return (
    <div className="overflow-x-auto pb-1 [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)] lg:[mask-image:none]">
      <div className="flex min-w-[600px] items-center gap-0.5">
        {RAIL_META.map((meta, index) => {
          const status = stageStatuses[meta.id];
          const theme = PIPELINE_THEME[meta.color];
          const Icon = meta.icon;
          const isPending = status === "pending";
          const nextConnectorLit = status === "done";

          return (
            <Fragment key={meta.id}>
              <div className="flex flex-1 flex-col items-center gap-1 px-0.5 py-1 text-center">
                <span className="relative flex size-3.5 items-center justify-center" aria-hidden="true">
                  {status === "active" && !prefersReducedMotion && (
                    <span
                      className={cn(
                        "absolute inline-flex size-full animate-ping rounded-full opacity-50",
                        theme.dot,
                      )}
                    />
                  )}
                  <Icon className={cn("relative size-3.5", isPending ? "text-text-muted" : theme.text)} />
                </span>
                <span
                  className={cn(
                    "text-[9px] font-medium whitespace-nowrap",
                    isPending ? "text-text-muted" : theme.text,
                  )}
                >
                  {meta.label}
                </span>
              </div>
              {index < STAGE_IDS.length - 1 && (
                <div
                  className={cn("h-px flex-1", nextConnectorLit ? theme.dot : "bg-border")}
                  aria-hidden="true"
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
