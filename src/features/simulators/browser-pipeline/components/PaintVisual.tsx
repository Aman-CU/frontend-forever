import { PaintBucket } from "lucide-react";

import type { StageStatus } from "../types";
import { PageMockupContent } from "./PageMockupContent";
import { PendingPlaceholder } from "./PendingPlaceholder";

export function PaintVisual({ status }: { status: StageStatus }) {
  if (status === "pending") return <PendingPlaceholder icon={PaintBucket} />;

  return (
    <div className="flex flex-1 items-center justify-center p-1">
      <PageMockupContent layered />
    </div>
  );
}
