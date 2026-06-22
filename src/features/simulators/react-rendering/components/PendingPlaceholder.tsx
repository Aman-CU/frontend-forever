import { Hourglass } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type PendingPlaceholderProps = {
  icon: LucideIcon;
};

export function PendingPlaceholder({ icon: Icon }: PendingPlaceholderProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-text-muted" aria-hidden="true">
      <Icon className="size-12 opacity-30" />
      <Hourglass className="size-4 opacity-50" />
    </div>
  );
}
