"use client";

import { XLogo } from "@/components/shared/XLogo";

type Props = {
  title: string;
};

// X-only, same single-button treatment as the UI Battles editor's
// BattleShareButton (built locally, not imported — features never import other
// features). X fetches the page's own og:image (wired to the experiment
// thumbnail in the detail page's generateMetadata) when it unfurls, so no image
// is attached here. Styled as a floating overlay button (translucent backdrop)
// since it sits over the full-bleed canvas.
export function ExperimentShareButton({ title }: Props) {
  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Check out "${title}" — a live experiment on Frontend Forever.\n\nvia frontendforever.dev`;

    const shareUrl = new URL("https://x.com/intent/tweet");
    shareUrl.searchParams.set("text", text);
    shareUrl.searchParams.set("url", url);
    window.open(shareUrl.toString(), "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share this experiment on X"
      title="Share on X"
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold text-text-secondary backdrop-blur-sm transition-colors hover:bg-surface-secondary hover:text-text-primary"
    >
      <XLogo className="size-3.5" />
      Share
    </button>
  );
}
