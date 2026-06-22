import { Hourglass } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type PendingPlaceholderProps = {
  icon: LucideIcon;
};

export function PendingPlaceholder({ icon: Icon }: PendingPlaceholderProps) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-1.5 text-text-muted"
      aria-hidden="true"
    >
      <Icon className="size-7 opacity-30" />
      <Hourglass className="size-3.5 opacity-50" />
    </div>
  );
}
