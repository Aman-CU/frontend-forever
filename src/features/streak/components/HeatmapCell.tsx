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
//
// The tooltip content only surfaces on hover/focus, so `aria-label` carries
// the same "date — XP" text as a real accessible name regardless of
// interaction; `role="listitem"` pairs with the parent grid's `role="list"`
// so screen readers get each day individually instead of one opaque image
// (the parent previously used `role="img"`, which hides all of this).
export function HeatmapCell({ date, xp, className }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            role="listitem"
            aria-label={`${date} — ${xp} XP`}
            className={`${className} rounded-[2px] ${intensityClass(xp)}`}
          />
        }
      />
      <TooltipContent>
        {date} — {xp} XP
      </TooltipContent>
    </Tooltip>
  );
}
