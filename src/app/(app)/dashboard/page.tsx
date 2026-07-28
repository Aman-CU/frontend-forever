import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCachedSession } from "@/lib/auth/server";
import { getLeaderboardEntries, getUserRank } from "@/features/leaderboard/lib/queries";
import {
  getDashboardProfileStats,
  getWeeklyDashboardStats,
  getTotalUserCount,
  hasAnyLearningProgress,
} from "@/features/dashboard/lib/queries";
import { getDailyActivity } from "@/features/streak/lib/queries";
import { getLevelProgress } from "@/features/dashboard/lib/level";
import { getCalendarWindowDays } from "@/features/dashboard/lib/dateWindow";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { LevelCard } from "@/features/dashboard/components/LevelCard";
import { StatTiles } from "@/features/dashboard/components/StatTiles";
import { DashboardActivityHeatmap } from "@/features/dashboard/components/DashboardActivityHeatmap";
import { StartLearningCard } from "@/features/dashboard/components/StartLearningCard";
import { LeaderboardPreviewCard } from "@/features/dashboard/components/LeaderboardPreviewCard";

export const metadata: Metadata = {
  title: "Dashboard | Frontend Forever",
  description: "Your learning progress, streaks, and stats in one place.",
};

const ACTIVITY_MONTHS = 6;

export default async function DashboardPage() {
  const session = await getCachedSession();
  // proxy.ts already matches /dashboard on cookie presence, but that's only
  // an optimistic check (see architecture.md → Authentication) — verify the
  // real session here too, same defensive precedent as /leaderboard.
  if (!session?.user) {
    redirect("/login?callbackURL=/dashboard");
  }

  const userId = session.user.id;
  const displayName = session.user.name ?? session.user.email.split("@")[0];

  const [profileStats, weeklyStats, totalUsers, hasProgress, activity, weekEntries, currentUserRank] =
    await Promise.all([
      getDashboardProfileStats(userId),
      getWeeklyDashboardStats(userId),
      getTotalUserCount(),
      hasAnyLearningProgress(userId),
      getDailyActivity(userId, getCalendarWindowDays(ACTIVITY_MONTHS)),
      getLeaderboardEntries("week"),
      getUserRank(userId, "week"),
    ]);

  const { level, xpIntoLevel, xpToNextLevel } = getLevelProgress(profileStats.xp);
  const activeDays = activity.filter((day) => day.xp > 0).length;

  const levelCard = (
    <LevelCard
      level={level}
      xpIntoLevel={xpIntoLevel}
      xpToNextLevel={xpToNextLevel}
      weeklyRank={weeklyStats.weeklyRank}
      totalUsers={totalUsers}
      xpThisWeek={weeklyStats.xpThisWeek}
      totalXp={profileStats.xp}
    />
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
      <DashboardHeader displayName={displayName} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          {!hasProgress ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_18rem]">
              <StartLearningCard />
              {levelCard}
            </div>
          ) : (
            levelCard
          )}

          <StatTiles
            streakCurrent={profileStats.streakCurrent}
            streakLongest={profileStats.streakLongest}
            activeDays={activeDays}
            lessonsCompleted={weeklyStats.lessonsCompleted}
          />

          <DashboardActivityHeatmap activity={activity} activeDays={activeDays} months={ACTIVITY_MONTHS} />
        </div>

        <div className="space-y-4">
          <LeaderboardPreviewCard
            entries={weekEntries}
            currentUserId={userId}
            currentUserRank={currentUserRank}
          />
        </div>
      </div>
    </div>
  );
}
