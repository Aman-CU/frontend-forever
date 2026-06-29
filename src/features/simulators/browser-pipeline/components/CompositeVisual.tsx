import { Monitor } from "lucide-react";

import type { PageBox, StageStatus } from "../types";
import { PageMockupContent } from "./PageMockupContent";
import { PendingPlaceholder } from "./PendingPlaceholder";

type CompositeVisualProps = {
  status: StageStatus;
  pageBoxes: PageBox[];
};

// The build-plan's "output visual at the end" — the actual rendered look of
// the page, payoff of the whole pipeline (and visibly missing the ad banner
// the Render Tree excluded, or showing its reserved blank space when hidden).
export function CompositeVisual({ status, pageBoxes }: CompositeVisualProps) {
  if (status === "pending") return <PendingPlaceholder icon={Monitor} />;

  return (
    <div className="flex flex-1 items-center justify-center p-1">
      <PageMockupContent pageBoxes={pageBoxes} />
    </div>
  );
}
