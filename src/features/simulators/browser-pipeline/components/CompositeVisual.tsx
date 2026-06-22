import { Monitor } from "lucide-react";

import type { StageStatus } from "../types";
import { PageMockupContent } from "./PageMockupContent";
import { PendingPlaceholder } from "./PendingPlaceholder";

// The build-plan's "output visual at the end" — the actual rendered look of
// the page, payoff of the whole pipeline (and visibly missing the ad
// banner the Render Tree frame excluded).
export function CompositeVisual({ status }: { status: StageStatus }) {
  if (status === "pending") return <PendingPlaceholder icon={Monitor} />;

  return (
    <div className="flex flex-1 items-center justify-center p-1">
      <PageMockupContent />
    </div>
  );
}
