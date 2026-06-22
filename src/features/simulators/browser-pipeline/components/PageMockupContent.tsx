import { cn } from "@/lib/utils";

type PageMockupContentProps = {
  /** Paint shows separate offset/shadowed layers; Composite flattens them. */
  layered?: boolean;
};

// The same 4 visible boxes (header/h1/intro/footer — aside.ad stays excluded
// all the way through) rendered with their real styles. Shared by Paint
// (layered) and Composite (flat) so the "what changed between them" is only
// ever the offset, never the content.
export function PageMockupContent({ layered }: PageMockupContentProps) {
  return (
    <div className="flex w-full flex-col gap-1 p-1.5">
      <div
        className={cn(
          "rounded-sm bg-surface px-2 py-1 text-center text-[9px] font-bold text-text-primary shadow-sm",
          layered && "translate-x-0.5 -translate-y-0.5",
        )}
      >
        Frontend Forever
      </div>
      <div
        className={cn(
          "rounded-sm bg-surface px-2 py-1 text-center text-[9px] font-semibold text-text-primary shadow-sm",
          layered && "translate-x-1 -translate-y-1",
        )}
      >
        Learn by Doing
      </div>
      <div
        className={cn(
          "rounded-sm bg-surface px-2 py-1 text-center text-[9px] text-accent shadow-sm",
          layered && "translate-x-[6px] -translate-y-[6px]",
        )}
      >
        Simulators teach concepts.
      </div>
      <div
        className={cn(
          "rounded-sm bg-surface px-2 py-1 text-center text-[8px] text-text-muted shadow-sm",
          layered && "translate-x-2 -translate-y-2",
        )}
      >
        © 2026 Frontend Forever
      </div>
    </div>
  );
}
