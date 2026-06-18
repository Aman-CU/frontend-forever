import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function MicrosoftLogo({ className }: Props) {
  return (
    <span aria-hidden="true" className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
        <rect x="0" y="0" width="9" height="9" />
        <rect x="11" y="0" width="9" height="9" />
        <rect x="0" y="11" width="9" height="9" />
        <rect x="11" y="11" width="9" height="9" />
      </svg>
      <span className="text-xl leading-none font-semibold tracking-tight">
        Microsoft
      </span>
    </span>
  );
}
