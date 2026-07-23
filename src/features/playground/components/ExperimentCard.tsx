import Link from "next/link";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  title: string;
  description: string;
};

export function ExperimentCard({ slug, title, description }: Props) {
  return (
    <Link
      href={`/playground/experiments/${slug}`}
      className={cn(
        "group flex w-56 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-premium hover:shadow-md",
      )}
    >
      <div className="flex h-32 items-center justify-center bg-surface-secondary">
        <Sparkles className="size-8 text-premium" aria-hidden />
      </div>

      <div className="flex flex-col gap-1.5 p-4">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-text-muted">{description}</p>
      </div>
    </Link>
  );
}
