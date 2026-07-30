"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  conceptId: string;
  isLoggedIn: boolean;
  initialUnderstood: boolean;
};

export function MarkUnderstoodButton({ conceptId, isLoggedIn, initialUnderstood }: Props) {
  const router = useRouter();
  const [understood, setUnderstood] = useState(initialUnderstood);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    // Logged-out visitors are sent to sign in, then back to this page.
    if (!isLoggedIn) {
      router.push(
        `/login?callbackURL=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      );
      return;
    }
    if (understood || isSaving) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptId, tab: "understand" }),
      });
      if (res.status === 429) {
        setError("You're doing that too fast. Please wait a moment.");
        return;
      }
      if (!res.ok) {
        setError("Could not save your progress. Please try again.");
        return;
      }
      setUnderstood(true);
      // Refreshes server-rendered data on this route — in particular
      // AppNavbar's XP/streak (fetched once per navigation in (app)/layout.tsx),
      // which would otherwise stay stale until the user's next full navigation.
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
        disabled={understood || isSaving}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors",
          understood
            ? "cursor-default bg-success-muted text-success"
            : "bg-accent-dark text-text-inverse hover:bg-accent-darker disabled:opacity-70",
        )}
      >
        {understood ? (
          <>
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Marked as understood
          </>
        ) : isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Saving…
          </>
        ) : (
          "Mark as understood"
        )}
      </button>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
