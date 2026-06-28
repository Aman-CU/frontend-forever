import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
};

// Labeled empty-state for a concept tab. Features 22-26 replace each tab body
// with its real content (MDX, full simulator, challenge editor, etc.).
export function TabPlaceholder({ icon: Icon, title, description }: Props) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/40 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary text-text-muted">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{description}</p>
    </div>
  );
}
