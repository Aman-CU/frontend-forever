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
  // Icon only, no "Premium" text — for a card whose title is already fighting
  // truncate for room (CompanyGuideCard's 32-card grid: a full-width "🔒
  // Premium" pill next to every company name left barely any width for the
  // name itself). Still the same open/closed lock, just without the label.
  iconOnly?: boolean;
  className?: string;
};

export function PremiumBadge({ isPremiumUser, size = "sm", iconOnly, className }: Props) {
  const Icon = isPremiumUser ? LockOpen : Lock;

  if (iconOnly) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-premium-light text-premium",
          size === "sm" ? "size-5" : "size-4",
          className,
        )}
      >
        <Icon className={size === "sm" ? "size-3" : "h-2.5 w-2.5"} aria-hidden />
        <span className="sr-only">Premium</span>
      </span>
    );
  }

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
