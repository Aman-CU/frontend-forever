import { Flame, Zap } from "lucide-react";

type Props = {
  xp: number;
  streak: number;
};

// The XP + streak pair in the logged-in Navbar's right cluster — shared
// between the desktop cluster and the mobile menu (both real as of Feature 27;
// previously "0 day streak"/no XP display at all). `fill-*` renders each lucide
// icon as a solid shape (not a stroked outline), the established pattern for
// this from PlatformGraph (Feature 06).
export function AppNavbarStats({ xp, streak }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 text-sm font-semibold text-xp">
        <Zap className="size-4 fill-xp stroke-none" />
        <span>{xp} XP</span>
      </div>
      <div className="flex items-center gap-1 text-sm font-semibold text-text-primary">
        <Flame className="size-4 fill-streak stroke-none" />
        <span>{streak} day streak</span>
      </div>
    </div>
  );
}
