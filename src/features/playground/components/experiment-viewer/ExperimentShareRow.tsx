"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { XLogo } from "@/components/shared/XLogo";
import { FacebookLogo } from "@/components/shared/FacebookLogo";
import { InstagramLogo } from "@/components/shared/InstagramLogo";

type Props = {
  title: string;
  slug: string;
};

// Playground-local copy of Practice's ShareButtons pattern (Feature 29) — built
// here rather than imported, since features never import other features
// (features/practice → features/playground would break that rule; same reason
// Feature 53 kept its own getIsPremiumUser). X and Facebook both fetch the
// page's own og:image (wired in the detail page's generateMetadata to the
// experiment thumbnail) when they unfurl, so we never attach an image directly.
// Instagram has no third-party share intent — best effort is copy the caption +
// download the og:image + open Instagram for a manual paste.
export function ExperimentShareRow({ title, slug }: Props) {
  const [copied, setCopied] = useState(false);

  function getPageUrl(): string {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  function getCaption(): string {
    return `Check out "${title}" on Frontend Forever!`;
  }

  function getHashtags(): string[] {
    return ["FF", "FrontendForever", "WebDev"];
  }

  function handleShareX() {
    const url = new URL("https://x.com/intent/tweet");
    url.searchParams.set("text", getCaption());
    url.searchParams.set("url", getPageUrl());
    url.searchParams.set("hashtags", getHashtags().join(","));
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  function handleShareFacebook() {
    // Facebook's sharer only takes the target URL — the preview (title/
    // description/image) comes from that page's own og: tags, not anything
    // passable here.
    const url = new URL("https://www.facebook.com/sharer/sharer.php");
    url.searchParams.set("u", getPageUrl());
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  async function handleShareInstagram() {
    const caption = `${getCaption()} ${getPageUrl()} ${getHashtags()
      .map((tag) => `#${tag}`)
      .join(" ")}`;

    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard can fail — the download below still happens; the user just
      // types the caption manually.
    }

    const ogImageUrl = document
      .querySelector<HTMLMetaElement>('meta[property="og:image"]')
      ?.content;
    if (ogImageUrl) {
      const anchor = document.createElement("a");
      anchor.href = ogImageUrl;
      anchor.download = `frontend-forever-${slug}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    window.open(
      isMobile ? "instagram://app" : "https://www.instagram.com/",
      "_blank",
      "noopener,noreferrer",
    );
  }

  const buttonClass =
    "flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary";

  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-1 text-xs font-medium text-text-muted">Share</span>
      <button type="button" onClick={handleShareX} aria-label="Share on X" className={buttonClass}>
        <XLogo className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={handleShareFacebook}
        aria-label="Share on Facebook"
        className={buttonClass}
      >
        <FacebookLogo className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={handleShareInstagram}
        aria-label="Share on Instagram — copies caption and downloads the image"
        className={buttonClass}
      >
        {copied ? (
          <Check className="h-4 w-4 text-success" aria-hidden />
        ) : (
          <InstagramLogo className="h-4 w-4" />
        )}
      </button>
      {copied && (
        <span role="status" className="text-xs font-medium text-success">
          Caption copied — paste it in Instagram
        </span>
      )}
    </div>
  );
}
