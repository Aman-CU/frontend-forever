import Link from "next/link";
import {
  BookOpen,
  Building2,
  Check,
  ClipboardList,
  Code2,
  Network,
  Repeat,
  Sparkles,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StudyPlanItemType } from "@/lib/constants";
import type { StudyPlanItemView } from "@/features/interview-prep/lib/studyPlanQueries";

const ITEM_TYPE_ICON: Record<StudyPlanItemType, LucideIcon> = {
  concept: BookOpen,
  "practice-category": Code2,
  collection: Sparkles,
  "playbook-chapter": ClipboardList,
  "system-design-guide": Network,
  "review-session": Repeat,
  "company-guide": Building2,
};

type Props = {
  item: StudyPlanItemView;
};

// One itinerary entry on a Study Plan's detail page. The checkmark only
// renders when `completed` is a real boolean (concept/playbook-chapter
// items, derived live from their own existing progress table) — `null`
// (every other itemType, no per-user tracking exists for it) renders the
// item-type icon instead, never a fabricated unchecked state.
export function StudyPlanItemRow({ item }: Props) {
  const Icon = ITEM_TYPE_ICON[item.itemType];
  const isCompleted = item.completed === true;

  return (
    <Link
      href={item.href}
      className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          isCompleted ? "bg-success-muted text-success" : "bg-surface-secondary text-text-secondary",
        )}
      >
        {isCompleted ? (
          <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        ) : (
          <Icon className="h-5 w-5" aria-hidden />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <h4 className="text-sm font-semibold text-text-primary">{item.title}</h4>
          {item.rangeLabel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-premium-light px-2 py-0.5 text-[0.6875rem] font-semibold text-premium">
              <Star className="h-2.5 w-2.5 fill-current" aria-hidden />
              {item.rangeLabel}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{item.description}</p>
      </div>
    </Link>
  );
}
