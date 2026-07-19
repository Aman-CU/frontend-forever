"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlaybookSlug } from "@/lib/constants";

type Props = {
  playbookSlug: PlaybookSlug;
  chapterSlug: string;
  isLoggedIn: boolean;
  initialRead: boolean;
};

// Same pattern as Learn's MarkUnderstoodButton — explicit action, not an
// auto-mark-on-visit (architect-session decision, build-plan.md Feature 50).
export function MarkAsReadButton({ playbookSlug, chapterSlug, isLoggedIn, initialRead }: Props) {
  const router = useRouter();
  const [isRead, setIsRead] = useState(initialRead);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (isRead || isSaving) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/playbook/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playbookSlug, chapterSlug }),
      });
      if (res.status === 429) {
        setError("You're doing that too fast. Please wait a moment.");
        return;
      }
      if (!res.ok) {
        setError("Could not save your progress. Please try again.");
        return;
      }
      setIsRead(true);
      // Refreshes the index page's "X/N articles read" bar and the Get
      // Started PlaybookPreview row on next navigation.
      router.refresh();
    } catch {
      setError("Could not save your progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-8 flex flex-col items-start gap-2 border-t border-border pt-6">
      <button
        type="button"
        onClick={handleClick}
        disabled={isRead || isSaving}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors",
          isRead
            ? "cursor-default bg-success-muted text-success"
            : "bg-accent-dark text-text-inverse hover:bg-accent-darker disabled:opacity-70",
        )}
      >
        {isRead ? (
          <>
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Marked as read
          </>
        ) : isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Saving…
          </>
        ) : (
          "Mark as read"
        )}
      </button>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
