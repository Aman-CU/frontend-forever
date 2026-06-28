import { Brain, HelpCircle, Lightbulb, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ConceptFrontmatter } from "@/lib/mdx";

type Card = {
  title: string;
  field: keyof Pick<
    ConceptFrontmatter,
    "whatsHappening" | "keyInsight" | "memoryHook" | "inRealLife"
  >;
  icon: LucideIcon;
  iconBg: string;
  iconText: string;
};

const CARDS: Card[] = [
  { title: "What's Happening?", field: "whatsHappening", icon: HelpCircle, iconBg: "bg-info-muted", iconText: "text-info" },
  { title: "Key Insight", field: "keyInsight", icon: Lightbulb, iconBg: "bg-accent-muted", iconText: "text-accent" },
  { title: "Memory Hook", field: "memoryHook", icon: Brain, iconBg: "bg-premium-light", iconText: "text-premium" },
  { title: "In Real Life", field: "inRealLife", icon: Building2, iconBg: "bg-streak-light", iconText: "text-streak" },
];

type Props = {
  frontmatter: ConceptFrontmatter;
};

export function InfoCards({ frontmatter }: Props) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map(({ title, field, icon: Icon, iconBg, iconText }) => (
        <div key={title} className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", iconBg)}>
              <Icon className={cn("h-4 w-4", iconText)} aria-hidden />
            </span>
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          </div>
          <p className="text-xs leading-6 text-text-secondary">{frontmatter[field]}</p>
        </div>
      ))}
    </div>
  );
}
