"use client";

import { XLogo } from "@/components/shared/XLogo";

type Props = {
  title: string;
};

// X-only for now (not the full X/Facebook/Instagram row Practice's
// ShareButtons uses) — that's what was asked for here. Copy is written to
// actually land as a challenge/dare, not a flat announcement, and names
// frontendforever.dev explicitly since there's no per-battle OG image yet
// for a visual watermark (Feature 29's opengraph-image.tsx precedent — a
// real option later if this needs a richer link-preview card).
export function BattleShareButton({ title }: Props) {
  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Think you can recreate this pixel-for-pixel? 🎯\n\nTry the "${title}" UI Battle on Frontend Forever — no shortcuts, just HTML, CSS & JS.\n\nvia frontendforever.dev`;

    const shareUrl = new URL("https://x.com/intent/tweet");
    shareUrl.searchParams.set("text", text);
    shareUrl.searchParams.set("url", url);
    window.open(shareUrl.toString(), "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share this battle on X"
      title="Share on X"
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
    >
      <XLogo className="size-3.5" />
      Share
    </button>
  );
}
