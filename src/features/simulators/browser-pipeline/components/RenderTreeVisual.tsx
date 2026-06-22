"use client";

import { Network } from "lucide-react";

import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";

import { RENDER_TREE } from "../data/scenarios";
import type { StageStatus } from "../types";
import { PendingPlaceholder } from "./PendingPlaceholder";
import { TreeView } from "./TreeView";

export function RenderTreeVisual({ status }: { status: StageStatus }) {
  const prefersReducedMotion = useSafeReducedMotion();

  if (status === "pending") return <PendingPlaceholder icon={Network} />;

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <TreeView node={RENDER_TREE} revealDepth={Infinity} prefersReducedMotion={prefersReducedMotion} />
    </div>
  );
}
