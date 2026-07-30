import type { Metadata } from "next";

import { CHANGELOG_ENTRIES } from "@/features/changelog/lib/entries";

export const metadata: Metadata = {
  title: "Changelog | Frontend Forever",
  description: "Everything shipped on Frontend Forever, newest first.",
};

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export default function ChangelogPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-14 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">Changelog</h1>
      <p className="mt-1.5 text-sm text-text-secondary">Everything shipped, newest first.</p>

      <ol className="mt-10 space-y-8 border-l border-border pl-6">
        {CHANGELOG_ENTRIES.map((entry) => (
          <li key={`${entry.date}-${entry.title}`} className="relative">
            <span
              className="absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full bg-accent"
              aria-hidden
            />
            <p className="text-xs font-semibold tracking-wide text-text-muted uppercase">
              {formatDate(entry.date)}
            </p>
            <h2 className="mt-1 text-base font-bold text-text-primary">{entry.title}</h2>
            <p className="mt-1 text-sm text-text-secondary">{entry.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
