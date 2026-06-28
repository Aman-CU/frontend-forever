"use client";

import { useEffect } from "react";
import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LearnError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[learn] Unexpected error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold text-text-primary">Something went wrong</h2>
      <p className="text-sm text-text-muted">We couldn&apos;t load your learning content.</p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-accent-dark px-4 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-accent-darker"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
