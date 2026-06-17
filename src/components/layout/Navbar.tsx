"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LucideGraduationCap,
  Compass,
  Map,
  Menu,
  Trophy,
  Users,
  X,
  Code2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { XLogo } from "@/components/shared/XLogo";

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

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-5 z-50 bg-surface dark:bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="text-5xl font-extrabold tracking-tight text-text-primary">
            FF
          </span>
          <span className="text-sm font-semibold tracking-tight text-text-primary">
            Frontend Forever
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 rounded-xl border border-border-light bg-surface px-1.5 py-3.5 shadow-xl lg:flex">
          {NAV_LINKS.map((link) => (
            <NavbarPillLink key={link.href} link={link} pathname={pathname} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="#"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
          >
            Follow on
            <XLogo className="size-3.5" />
          </a>
          <ThemeToggle />
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "px-5",
              "py-4",
            )}
          >
            Log In
          </Link>
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex size-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary lg:hidden"
        >
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="flex flex-col gap-1 border-t border-border bg-surface px-6 py-4 lg:hidden">
          {NAV_LINKS.map((link) => (
            <NavbarMobileLink
              key={link.href}
              link={link}
              pathname={pathname}
              onClick={() => setIsMenuOpen(false)}
            />
          ))}

          <div className="mt-3 flex items-center gap-3 border-t border-border pt-4">
            <a
              href="#"
              aria-label="Follow Frontend Forever on X"
              className="flex size-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
            >
              <XLogo className="size-4" />
            </a>
            <ThemeToggle />
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex-1 justify-center",
              )}
            >
              Log In
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

type NavbarPillLinkProps = {
  link: NavLink;
  pathname: string;
};

function NavbarPillLink({ link, pathname }: NavbarPillLinkProps) {
  const isActive =
    pathname === link.href || pathname.startsWith(`${link.href}/`);
  const Icon = link.icon;

  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent-muted text-accent"
          : "text-text-primary hover:bg-surface-secondary",
      )}
    >
      <Icon className="size-3.5" />
      {link.label}
    </Link>
  );
}

type NavbarMobileLinkProps = {
  link: NavLink;
  pathname: string;
  onClick: () => void;
};

function NavbarMobileLink({ link, pathname, onClick }: NavbarMobileLinkProps) {
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
