"use client";

import { useState } from "react";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Code2,
  Command,
  Gamepad2,
  LucideGraduationCap,
  Map,
  Menu,
  Search,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";

import { useUser, type SessionUser } from "@/hooks/useUser";
import { UserDropdown } from "@/components/shared/UserDropdown";
import { AppNavbarStats } from "./AppNavbarStats";
import { AppNavLink, AppMobileNavLink, type NavLink } from "./AppNavLinks";

const NAV_LINKS: NavLink[] = [
  { label: "Playground", href: "/playground", icon: Gamepad2 },
  { label: "Learn", href: "/learn", icon: LucideGraduationCap },
  { label: "Roadmaps", href: "/roadmaps", icon: Map },
  { label: "Practice", href: "/practice", icon: Code2 },
  { label: "Interview Prep", href: "/interview-prep", icon: Users },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
];

type AppNavbarProps = {
  initialUser?: SessionUser | null;
  initialStreak?: number;
  initialXp?: number;
  // Display-only: hides the upgrade pill from people who already paid. Never
  // a gate — every locked surface re-checks premium server-side for itself.
  isPremiumUser?: boolean;
};

export function AppNavbar({
  initialUser,
  initialStreak = 0,
  initialXp = 0,
  isPremiumUser = false,
}: AppNavbarProps = {}) {
  const pathname = usePathname();
  const { user, isLoading } = useUser(initialUser);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface dark:bg-background">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-3 px-6 md:px-8 xl:gap-5">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setIsMenuOpen(false)}
          className="flex shrink-0 items-center gap-2"
        >
          <span className="text-2xl font-extrabold tracking-tight text-text-primary">
            FF
          </span>
          <span className="hidden text-xs font-semibold tracking-tight text-text-primary xl:inline">
            Frontend Forever
          </span>
        </Link>

        {/* Desktop nav links — text only, no pill container */}
        <nav className="hidden shrink-0 items-center lg:flex ml-4 gap-2 xl:ml-10">
          {NAV_LINKS.map((link) => (
            <AppNavLink key={link.href} link={link} pathname={pathname} />
          ))}
        </nav>

        <div className="flex-1" />

        {/* Search trigger — compact icon + shortcut-hint pill (no placeholder
            text), not the wide labeled box this used to be. Opening a real
            search overlay is future work (no onClick yet); this is just the
            trigger's visual shape. Much smaller than before, but the nav
            links + stats + avatar cluster alone already fill the exact
            1024px lg: breakpoint with no slack (confirmed: adding this back
            in at lg: pushes the avatar ~55px off-viewport at exactly 1024px,
            while every width from 1152px up has room to spare) — xl: (1280px)
            is the first point with enough margin. */}
        <button
          type="button"
          aria-label="Search"
          className="hidden h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface-secondary px-2 transition-colors hover:border-border-light hover:bg-surface xl:flex"
        >
          <Search className="size-3.5 text-text-muted" />
          <kbd className="inline-flex items-center gap-px rounded border border-border bg-surface px-1 py-0.5 leading-none text-text-muted">
            <Command className="size-2.5" />
            <span className="font-mono text-[10px]">K</span>
          </kbd>
        </button>

        {/* Upgrade pill (Feature 38 Stage 9) — build-plan.md calls for an
            "Upgrade to Premium" pill in the logged-in navbar routing to the
            pricing page. Hidden entirely once the user is premium: there's
            nothing left to sell them, and it buys back this pill's width.

            Breakpoint is min-[1366px], NOT xl: — measured, not chosen. This
            row already has no slack (see the search trigger's note above);
            adding this 90px pill at xl: pushed the account avatar to
            x=1307–1339 in a 1280px viewport, i.e. clean off-screen, for
            every non-premium user. That is the same class of bug the
            ui-registry entry for this file warns about, and it reproduced
            immediately on the sweep it tells you to run. 1366px is the first
            width where the pill fits with the avatar fully on-screen
            (verified 1024/1152/1280/1366/1440/1536/1920, free and premium).
            Do not lower it without re-running that sweep. */}
        {!isLoading && user && !isPremiumUser && (
          <Link
            href="/pricing"
            className="hidden h-8 shrink-0 items-center gap-1.5 rounded-lg bg-premium-light px-2.5 text-xs font-semibold text-premium transition-colors hover:bg-premium hover:text-premium-foreground min-[1366px]:flex"
          >
            <Sparkles className="size-3.5" aria-hidden />
            Upgrade
          </Link>
        )}

        {/* Right cluster (desktop) — only once session resolves */}
        {!isLoading && user && (
          <div className="hidden shrink-0 items-center gap-5 lg:flex">
            <AppNavbarStats xp={initialXp} streak={initialStreak} />

            <button
              type="button"
              aria-label="Notifications"
              className="relative flex size-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
            >
              <Bell className="size-4" />
              <span
                aria-hidden="true"
                className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-error"
              />
            </button>

            <UserDropdown user={user} isPremiumUser={isPremiumUser} />
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex size-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary lg:hidden"
        >
          {isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="border-t border-border bg-surface px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <AppMobileNavLink
                key={link.href}
                link={link}
                pathname={pathname}
                onClick={() => setIsMenuOpen(false)}
              />
            ))}
          </nav>

          {/* The desktop pill is xl:-only for width reasons, so the mobile
              menu carries its own copy — otherwise everything below 1280px
              has no navbar route to pricing at all. */}
          {!isLoading && user && !isPremiumUser && (
            <Link
              href="/pricing"
              onClick={() => setIsMenuOpen(false)}
              className="mt-3 flex items-center gap-2 rounded-lg bg-premium-light px-2 py-3 text-sm font-semibold text-premium"
            >
              <Sparkles className="size-4" aria-hidden />
              Upgrade to Premium
            </Link>
          )}

          {!isLoading && user && (
            <div className="mt-3 flex items-center justify-between border-t border-border pt-4">
              <AppNavbarStats xp={initialXp} streak={initialStreak} />
              <UserDropdown user={user} isPremiumUser={isPremiumUser} />
            </div>
          )}
        </div>
      )}
    </header>
  );
}
