import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-surface px-6 py-16 dark:bg-background">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-surface p-8 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold leading-tight text-text-primary">
            Frontend Forever <span className="text-accent">Design System</span>
          </h1>
          <ThemeToggle />
        </div>

        <p className="mt-3 text-base text-text-secondary">
          Tokens, fonts, and theming are wired up. This page is a temporary
          style check — it gets replaced by the real homepage hero in a later
          feature.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-beginner-bg px-3 py-1 text-beginner">
            Beginner
          </span>
          <span className="rounded-full bg-intermediate-bg px-3 py-1 text-intermediate">
            Intermediate
          </span>
          <span className="rounded-full bg-advanced-bg px-3 py-1 text-advanced">
            Advanced
          </span>
          <span className="rounded-full bg-xp-light px-3 py-1 text-xp">
            +25 XP
          </span>
          <span className="rounded-full bg-streak-light px-3 py-1 text-streak">
            🔥 12 day streak
          </span>
          <span className="rounded-full bg-premium-light px-3 py-1 text-premium">
            Premium
          </span>
        </div>
      </div>
    </div>
  );
}
