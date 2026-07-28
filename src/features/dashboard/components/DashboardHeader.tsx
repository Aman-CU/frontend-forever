import { getQuoteOfTheDay } from "@/features/dashboard/lib/quotes";

type Props = {
  displayName: string;
};

// UTC-based greeting/date — this app has no per-user timezone system today
// (see architecture.md), same convention the streak system already uses.
function getGreeting(): string {
  const hour = new Date().getUTCHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
    .format(new Date())
    .toUpperCase();
}

export function DashboardHeader({ displayName }: Props) {
  const quote = getQuoteOfTheDay();

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold tracking-wide text-text-muted">{getFormattedDate()}</p>
        <h1 className="mt-1 text-2xl font-bold text-text-primary">
          {getGreeting()}, {displayName}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Everything about your learning in one place.</p>
      </div>

      <div className="rounded-xl border border-accent-muted bg-accent-muted/40 px-5 py-4 sm:max-w-xs">
        <p className="text-sm font-medium italic text-text-primary">&ldquo;{quote.text}&rdquo;</p>
        <p className="mt-1.5 text-xs font-semibold tracking-wide text-text-muted uppercase">
          — {quote.author}
        </p>
      </div>
    </div>
  );
}
