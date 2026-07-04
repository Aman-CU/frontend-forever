import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type NavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type AppNavLinkProps = {
  link: NavLink;
  pathname: string;
};

export function AppNavLink({ link, pathname }: AppNavLinkProps) {
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

export function AppMobileNavLink({ link, pathname, onClick }: AppMobileNavLinkProps) {
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
