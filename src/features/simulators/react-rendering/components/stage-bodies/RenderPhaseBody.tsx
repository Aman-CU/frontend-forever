"use client";

import { CheckCircle2, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";

import { CardZones } from "../StageCard";
import { PendingPlaceholder } from "../PendingPlaceholder";
import type { CardStatus } from "../../types";

type RenderPhaseBodyProps = {
  status: CardStatus;
};

export function RenderPhaseBody({ status }: RenderPhaseBodyProps) {
  const prefersReducedMotion = useSafeReducedMotion();

  if (status === "pending") {
    return (
      <CardZones topLabel="Not started" bottomNote="Waiting…">
        <PendingPlaceholder icon={Zap} />
      </CardZones>
    );
  }

  if (status === "active") {
    return (
      <CardZones topLabel="Rendering..." bottomNote="Preparing new UI">
        <div
          className={cn(
            "size-16 rounded-full border-4 border-info/20 border-t-info",
            !prefersReducedMotion && "animate-spin",
          )}
          aria-hidden="true"
        />
      </CardZones>
    );
  }

  return (
    <CardZones topLabel="Rendered" bottomNote="New UI ready">
      <CheckCircle2 className="size-14 text-info" aria-hidden="true" />
    </CardZones>
  );
}
