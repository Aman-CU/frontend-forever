"use client";

import { Network } from "lucide-react";

import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";

import type { StageStatus, TreeNode } from "../types";
import { PendingPlaceholder } from "./PendingPlaceholder";
import { TreeView } from "./TreeView";

type RenderTreeVisualProps = {
  status: StageStatus;
  renderTree: TreeNode;
};

export function RenderTreeVisual({ status, renderTree }: RenderTreeVisualProps) {
  const prefersReducedMotion = useSafeReducedMotion();

  if (status === "pending") return <PendingPlaceholder icon={Network} />;

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <TreeView node={renderTree} revealDepth={Infinity} prefersReducedMotion={prefersReducedMotion} />
    </div>
  );
}
