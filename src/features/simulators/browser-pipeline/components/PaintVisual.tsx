import { PaintBucket } from "lucide-react";

import type { PageBox, StageStatus } from "../types";
import { PageMockupContent } from "./PageMockupContent";
import { PendingPlaceholder } from "./PendingPlaceholder";

type PaintVisualProps = {
  status: StageStatus;
  pageBoxes: PageBox[];
};

export function PaintVisual({ status, pageBoxes }: PaintVisualProps) {
  if (status === "pending") return <PendingPlaceholder icon={PaintBucket} />;

  return (
    <div className="flex flex-1 items-center justify-center p-1">
      <PageMockupContent layered pageBoxes={pageBoxes} />
    </div>
  );
}
