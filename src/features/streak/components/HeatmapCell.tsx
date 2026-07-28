"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { intensityClass } from "@/features/streak/lib/intensity";

type Props = {
  date: string;
  xp: number;
  className: string;
};

// Shared by StreakHeatMap (Settings > Profile) and DashboardActivityHeatmap —
// both rendered a native `title` attribute for the per-day detail, which
// browsers show as an unstyled, delayed system tooltip instead of a designed
// one. This swaps in the project's existing Base-UI-backed Tooltip.
export function HeatmapCell({ date, xp, className }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<div className={`${className} rounded-[2px] ${intensityClass(xp)}`} />}
      />
      <TooltipContent>
        {date} — {xp} XP
      </TooltipContent>
    </Tooltip>
  );
}
