"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Code2,
  Command,
  Compass,
  Flame,
  LucideGraduationCap,
  Map,
  Menu,
  Search,
  Trophy,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { UserDropdown } from "@/components/shared/UserDropdown";

type NavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAV_LINKS: NavLink[] = [
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Learn", href: "/learn", icon: LucideGraduationCap },
  { label: "Roadmaps", href: "/roadmaps", icon: Map },
  { label: "Practice", href: "/practice", icon: Code2 },
  { label: "Interview Prep", href: "/interview-prep", icon: Users },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
];

export function AppNavbar() {
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface dark:bg-background">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-5 px-6 md:px-8">
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
        <nav className="hidden shrink-0 items-center lg:flex ml-10 gap-2">
          {NAV_LINKS.map((link) => (
            <AppNavLink key={link.href} link={link} pathname={pathname} />
          ))}
        </nav>

        <div className="flex-1" />

        {/* Search trigger */}
        <button
          type="button"
          aria-label="Search"
          className="hidden w-52 items-center gap-2 rounded-md border border-border bg-surface-secondary px-3 py-1.5 transition-colors hover:border-border-light hover:bg-surface lg:flex xl:w-72"
        >
          <Search className="size-3.5 shrink-0 text-text-muted" />
          <span className="flex-1 text-left text-xs text-text-muted">
            Search labs, topics, questions...
          </span>
          <kbd className="inline-flex items-center gap-px rounded border border-border bg-surface px-1 py-0.5 leading-none text-text-muted">
            <Command className="size-2.5" />
            <span className="font-mono text-[10px]">K</span>
          </kbd>
        </button>

        {/* Right cluster (desktop) — only once session resolves */}
        {!isLoading && user && (
          <div className="hidden shrink-0 items-center gap-5 lg:flex">
            <div className="flex items-center gap-1 text-sm font-semibold text-text-primary">
              <Flame className="size-4 fill-streak stroke-none" />
              <span>0 day streak</span>
            </div>

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

            <UserDropdown user={user} />
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

          {!isLoading && user && (
            <div className="mt-3 flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                <Flame className="size-4 fill-streak stroke-none" />
                <span>0 day streak</span>
              </div>
              <UserDropdown user={user} />
            </div>
          )}
        </div>
      )}
    </header>
  );
}

type AppNavLinkProps = {
  link: NavLink;
  pathname: string;
};

function AppNavLink({ link, pathname }: AppNavLinkProps) {
  const isActive =
    pathname === link.href || pathname.startsWith(`${link.href}/`);

  return (
    <Link
      href={link.href}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        isActive
          ? "text-accent"
          : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
      )}
    >
      {link.label}
    </Link>
  );
}

type AppMobileNavLinkProps = {
  link: NavLink;
  pathname: string;
  onClick: () => void;
};

function AppMobileNavLink({ link, pathname, onClick }: AppMobileNavLinkProps) {
  const isActive =
    pathname === link.href || pathname.startsWith(`${link.href}/`);
  const Icon = link.icon;

  return (
    <Link
      href={link.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2 py-3 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent-muted text-accent"
          : "text-text-primary hover:bg-surface-secondary",
      )}
    >
      <Icon className="size-4" />
      {link.label}
    </Link>
  );
}
