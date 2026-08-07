import { Lock, LockOpen } from "lucide-react";

import { cn } from "@/lib/utils";

// The one shared "Premium" pill, extracted out of the half-dozen places that
// each hand-rolled the same bg-premium-light/text-premium badge (ui-registry.md
// flagged this gap directly — "no shared PremiumBadge component exists in
// this codebase"). Shown on every premium-tagged item regardless of viewer
// (content classification, not a restriction notice — see progress-tracker.md's
// Feature 38 entry on why the tag stays visible even to premium accounts) —
// only the icon changes: closed lock for a viewer who doesn't have access
// yet, open lock for one who does. The tag itself never gates anything; the
// real gate is always server-side elsewhere.
type Props = {
  isPremiumUser: boolean;
  // QuestionCard's denser card rows need a smaller pill than the list/grid
  // cards (BattleCard, ChallengeListRow, StudyPlanCard) use — "sm" (default)
  // matches those; "xs" matches QuestionCard's existing size.
  size?: "sm" | "xs";
  className?: string;
};

export function PremiumBadge({ isPremiumUser, size = "sm", className }: Props) {
  const Icon = isPremiumUser ? LockOpen : Lock;
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-full bg-premium-light font-semibold text-premium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2 py-0.5 text-[0.6875rem]",
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "h-2.5 w-2.5"} aria-hidden />
      Premium
    </span>
  );
}
