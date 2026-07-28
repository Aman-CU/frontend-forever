import { StreakHeatMap } from "@/features/streak/components/StreakHeatMap";
import { getStreakSummary, getDailyActivity } from "@/features/streak/lib/queries";
import type { SettingsSection } from "@/features/settings/lib/sections";

type Props = {
  section: SettingsSection;
  userId: string;
};

// Only "profile" exists today — add a branch here as each new section
// (Billing, etc.) actually ships real content, rather than scaffolding one
// ahead of time.
export async function SettingsSectionContent({ section, userId }: Props) {
  if (section === "profile") {
    const [streak, activity] = await Promise.all([
      getStreakSummary(userId),
      getDailyActivity(userId),
    ]);

    return (
      <div>
        <h2 className="mb-1 text-lg font-bold text-text-primary">Profile</h2>
        <p className="mb-6 text-sm text-text-secondary">
          Your streak history over the last 30 days.
        </p>
        <StreakHeatMap
          activity={activity}
          streakCurrent={streak.streakCurrent}
          streakLongest={streak.streakLongest}
        />
      </div>
    );
  }

  return null;
}
