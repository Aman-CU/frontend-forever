"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { XLogo } from "@/components/shared/XLogo";
import { FacebookLogo } from "@/components/shared/FacebookLogo";
import { InstagramLogo } from "@/components/shared/InstagramLogo";
import type { PracticeCategory } from "@/features/practice/lib/practiceCategories";

const CATEGORY_HASHTAGS: Record<PracticeCategory, string> = {
  "javascript-runtime": "JavaScript",
  react: "React",
  css: "CSS",
  typescript: "TypeScript",
  "system-design": "SystemDesign",
};

type Props = {
  category: PracticeCategory;
  slug: string;
  title: string;
  questionNumber: number;
};

// X and Facebook both support real pre-filled share intents — the platform
// itself fetches the page's og:image (opengraph-image.tsx) when it unfurls
// the link, so we never attach an image directly. Instagram has no such
// intent for third-party sites (a platform restriction, not a gap here) —
// best effort is download the image + copy the caption + open Instagram, so
// the user pastes it themselves. See progress-tracker.md's Feature 29
// share-buttons decision.
export function ShareButtons({ category, slug, title, questionNumber }: Props) {
  const [copied, setCopied] = useState(false);

  function getPageUrl(): string {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  function getCaption(): string {
    return `Just solved Question #${questionNumber}: ${title} on Frontend Forever!`;
  }

  function getHashtags(): string[] {
    return ["FF", "FFdev", "FrontendForever", CATEGORY_HASHTAGS[category]];
  }

  function handleShareX() {
    const url = new URL("https://x.com/intent/tweet");
    url.searchParams.set("text", getCaption());
    url.searchParams.set("url", getPageUrl());
    url.searchParams.set("hashtags", getHashtags().join(","));
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  function handleShareFacebook() {
    // Facebook's sharer only ever takes the target URL — the preview it
    // shows (title/description/image) comes from that page's own og: tags,
    // not from anything we could pass here; Facebook dropped support for a
    // pre-filled quote/caption param years ago.
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
      // Clipboard access can fail (permissions, non-secure context) — the
      // download below still happens; the user just has to type the caption.
    }

    // opengraph-image.tsx is a real Route Handler, directly downloadable —
    // but Next serves it at a build-hashed path (e.g.
    // opengraph-image-<hash>?<hash>), not the plain segment path, so we read
    // the real URL straight off the page's own <meta property="og:image">
    // tag rather than guessing the path.
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
        {copied ? <Check className="h-4 w-4 text-success" aria-hidden /> : <InstagramLogo className="h-4 w-4" />}
      </button>
      {copied && (
        <span role="status" className="text-xs font-medium text-success">
          Caption copied — paste it in Instagram
        </span>
      )}
    </div>
  );
}
