"use client";

import { ArrowDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";

import type { StageStatus, TreeNode } from "../types";
import { PendingPlaceholder } from "./PendingPlaceholder";
import { PipelineCard } from "./PipelineCard";
import type { PipelineColor } from "./PipelineCard";
import { TreeView } from "./TreeView";

type ParseTrackProps = {
  icon: LucideIcon;
  color: PipelineColor;
  title: string;
  sourceCode: string;
  tree: TreeNode;
  status: StageStatus;
  captionNumber: number;
  captionTitle: string;
  captionSubtext: string;
};

// active reveals just the root + first level (parsing is still in
// progress); done reveals the full tree. pending shows a placeholder
// instead of an empty tree, never a blank box.
export function ParseTrack({
  icon,
  color,
  title,
  sourceCode,
  tree,
  status,
  captionNumber,
  captionTitle,
  captionSubtext,
}: ParseTrackProps) {
  const prefersReducedMotion = useSafeReducedMotion();

  return (
    <PipelineCard
      icon={icon}
      title={title}
      color={color}
      status={status}
      captionNumber={captionNumber}
      captionTitle={captionTitle}
      captionSubtext={captionSubtext}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5">
        <pre className="w-full overflow-x-auto rounded-md bg-surface-secondary px-1.5 py-1 font-mono text-[9px] leading-snug text-text-secondary">
          {sourceCode}
        </pre>
        <ArrowDown className="size-3 text-text-muted" aria-hidden="true" />
        {status === "pending" ? (
          <PendingPlaceholder icon={icon} />
        ) : (
          <TreeView
            node={tree}
            revealDepth={status === "active" ? 1 : Infinity}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}
      </div>
    </PipelineCard>
  );
}
