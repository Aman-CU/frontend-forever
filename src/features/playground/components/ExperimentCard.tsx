import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  title: string;
  description: string;
  // Optional — the hub's scroll-row teaser now passes a real screenshot; falls
  // back to the Sparkles placeholder tile when absent.
  thumbnail?: string;
};

// The compact hub scroll-row card (deliberate sibling of the richer
// ExperimentListCard used on /playground/experiments, matching the
// BattleCard/BattleListCard precedent). Fixed width lives on the caller (same as
// BattleCard) so the same card works in the hub's w-56 row and anywhere else.
export function ExperimentCard({ slug, title, description, thumbnail }: Props) {
  return (
    <Link
      href={`/playground/experiments/${slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-premium hover:shadow-md",
      )}
    >
      <div className="relative flex h-32 items-center justify-center overflow-hidden bg-surface-secondary">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={`Preview of the ${title} experiment`}
            fill
            sizes="224px"
            className="object-cover"
          />
        ) : (
          <Sparkles className="size-8 text-premium" aria-hidden />
        )}
      </div>

      <div className="flex flex-col gap-1.5 p-4">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-text-muted">{description}</p>
      </div>
    </Link>
  );
}
