import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCachedSession } from "@/lib/auth/server";
import { LEADERBOARD_RANGES, type LeaderboardRange } from "@/lib/constants";
import { getLeaderboardEntries, getUserRank } from "@/features/leaderboard/lib/queries";
import { LeaderboardRangeTabs } from "@/features/leaderboard/components/LeaderboardRangeTabs";
import { LeaderboardPodium } from "@/features/leaderboard/components/LeaderboardPodium";
import { LeaderboardTable } from "@/features/leaderboard/components/LeaderboardTable";
import { YourRankCard } from "@/features/leaderboard/components/YourRankCard";

export const metadata: Metadata = {
  title: "Leaderboard | Frontend Forever",
  description: "See how your XP, streak, and concepts completed stack up against the community.",
};

type PageProps = {
  searchParams: Promise<{ range?: string }>;
};

function parseRange(value: string | undefined): LeaderboardRange {
  return (LEADERBOARD_RANGES as readonly string[]).includes(value ?? "")
    ? (value as LeaderboardRange)
    : "all-time";
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const session = await getCachedSession();
  // proxy.ts already matches /leaderboard on cookie presence, but that's only
  // an optimistic check (see architecture.md → Authentication) — verify the
  // real session here too, same defensive precedent as /interview-prep/review.
  if (!session?.user) {
    redirect("/login?callbackURL=/leaderboard");
  }

  const { range: rawRange } = await searchParams;
  const range = parseRange(rawRange);

  const [entries, yourRank] = await Promise.all([
    getLeaderboardEntries(range),
    getUserRank(session.user.id, range),
  ]);

  const podiumEntries = entries.length >= 3 ? entries.slice(0, 3) : [];
  const tableEntries = podiumEntries.length > 0 ? entries.slice(3) : entries;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Leaderboard</h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            Ranked by XP earned across every concept, challenge, and interview question.
          </p>
        </div>
        <LeaderboardRangeTabs activeRange={range} />
      </div>

      {yourRank && <YourRankCard summary={yourRank} />}

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-text-secondary">
          No activity yet for this range — be the first to earn XP and claim the top spot.
        </div>
      ) : (
        <>
          {podiumEntries.length > 0 && <LeaderboardPodium entries={podiumEntries} />}
          <LeaderboardTable entries={tableEntries} currentUserId={session.user.id} />
        </>
      )}
    </div>
  );
}
