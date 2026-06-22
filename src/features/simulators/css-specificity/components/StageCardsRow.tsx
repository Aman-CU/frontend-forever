import { Fragment } from "react";
import type { ReactNode } from "react";

import { ArrowRight, Calculator, Code2, List, Paintbrush, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import type { StageId, StageStatuses } from "../types";
import { ElementBody } from "./stage-bodies/ElementBody";
import { FinalStyleBody } from "./stage-bodies/FinalStyleBody";
import { MatchingSelectorsBody } from "./stage-bodies/MatchingSelectorsBody";
import { SpecificityCalculatorBody } from "./stage-bodies/SpecificityCalculatorBody";
import { WinnerSelectionBody } from "./stage-bodies/WinnerSelectionBody";
import { SpecificityCard } from "./SpecificityCard";
import type { SpecificityColor } from "./SpecificityCard";

type StageMeta = {
  id: StageId;
  icon: LucideIcon;
  color: SpecificityColor;
  title: string;
  captionTitle: string;
  captionSubtext: string;
};

// Keyed by id, not position — a card can't desync from the wrong status the
// way indexing a positional tuple could if this array were ever reordered.
const STAGE_META: StageMeta[] = [
  { id: "element", icon: Code2, color: "accent", title: "Element", captionTitle: "Element", captionSubtext: "The element to style" },
  { id: "matching", icon: List, color: "info", title: "Matching Selectors", captionTitle: "Matching Selectors", captionSubtext: "4 selectors match" },
  { id: "calculator", icon: Calculator, color: "premium", title: "Specificity Calculator", captionTitle: "Specificity Calculation", captionSubtext: "[ID, Class, Type] score" },
  { id: "winner", icon: Trophy, color: "streak", title: "Winner Selection", captionTitle: "Winner Selection", captionSubtext: "Highest score wins" },
  { id: "final", icon: Paintbrush, color: "success", title: "Final Style Applied", captionTitle: "Final Style Applied", captionSubtext: "Winning rule applied" },
];

// 5 card columns (equal 1fr each) interleaved with 4 auto-width arrow
// columns — guarantees the cards distribute evenly across the full row
// width, same fix as react-rendering's StageCardsRow.
const GRID_TEMPLATE = "grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]";

type StageCardsRowProps = {
  stageStatuses: StageStatuses;
};

export function StageCardsRow({ stageStatuses }: StageCardsRowProps) {
  const bodies: Record<StageId, ReactNode> = {
    element: <ElementBody status={stageStatuses.element} />,
    matching: <MatchingSelectorsBody status={stageStatuses.matching} />,
    calculator: <SpecificityCalculatorBody status={stageStatuses.calculator} />,
    winner: <WinnerSelectionBody status={stageStatuses.winner} />,
    final: <FinalStyleBody status={stageStatuses.final} />,
  };

  return (
    <div className="overflow-x-auto pb-1 [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)] lg:[mask-image:none]">
      <div className={cn("grid min-w-[760px] items-stretch gap-2", GRID_TEMPLATE)}>
        {STAGE_META.map((meta, index) => (
          <Fragment key={meta.id}>
            <SpecificityCard
              icon={meta.icon}
              title={meta.title}
              color={meta.color}
              status={stageStatuses[meta.id]}
              captionNumber={index + 1}
              captionTitle={meta.captionTitle}
              captionSubtext={meta.captionSubtext}
            >
              {bodies[meta.id]}
            </SpecificityCard>
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
