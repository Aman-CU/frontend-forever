import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail?: string;
};

// The richer grid-listing card for /playground/experiments (neal.fun-style:
// cover thumbnail → title → description → tags). A deliberate sibling of the
// hub's compact ExperimentCard, not a shared/generalized version — different
// shape, same precedent as BattleCard/BattleListCard.
export function ExperimentListCard({ slug, title, description, tags, thumbnail }: Props) {
  return (
    <Link
      href={`/playground/experiments/${slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-premium hover:shadow-md",
      )}
    >
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-surface-secondary">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={`Preview of the ${title} experiment`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <Sparkles className="size-8 text-premium" aria-hidden />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-text-secondary">{description}</p>
        {tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
