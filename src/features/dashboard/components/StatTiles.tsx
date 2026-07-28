import { Flame, Trophy, Calendar, CheckCircle2 } from "lucide-react";
import type { ComponentType } from "react";

type Props = {
  streakCurrent: number;
  streakLongest: number;
  activeDays: number;
  lessonsCompleted: number;
};

type Tile = {
  icon: ComponentType<{ className?: string }>;
  value: number;
  label: string;
  iconBg: string;
  iconColor: string;
};

export function StatTiles({ streakCurrent, streakLongest, activeDays, lessonsCompleted }: Props) {
  const tiles: Tile[] = [
    {
      icon: Flame,
      value: streakCurrent,
      label: "day streak",
      iconBg: "bg-streak-light",
      iconColor: "text-streak",
    },
    {
      icon: Trophy,
      value: streakLongest,
      label: "best streak",
      iconBg: "bg-success-light",
      iconColor: "text-success",
    },
    {
      icon: Calendar,
      value: activeDays,
      label: "active days",
      iconBg: "bg-info-light",
      iconColor: "text-info",
    },
    {
      icon: CheckCircle2,
      value: lessonsCompleted,
      label: "lessons completed",
      iconBg: "bg-accent-muted",
      iconColor: "text-accent",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map(({ icon: Icon, value, label, iconBg, iconColor }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
          <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
            <Icon className={`size-4 ${iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-text-primary">{value}</p>
            <p className="text-xs leading-tight text-text-muted">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
