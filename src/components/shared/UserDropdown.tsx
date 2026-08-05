"use client";

import {
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquare,
  Moon,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";
import { useTheme } from "@/hooks/useTheme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type DropdownUser = {
  name: string | null;
  email: string;
  image?: string | null;
};

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return email[0]?.toUpperCase() ?? "?";
}

type UserDropdownProps = {
  user: DropdownUser;
  // Feature 38 Stage 9. Display-only, never a gate — the real premium checks
  // all live server-side on the routes that own the content. Optional and
  // defaulting to false so the marketing Navbar, which has no profile read,
  // simply doesn't show the item rather than showing a wrong one.
  isPremiumUser?: boolean;
};

export function UserDropdown({ user, isPremiumUser = false }: UserDropdownProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      // 8-second ceiling — in dev the TLS-intercepting proxy can make the
      // session DELETE take 7+ seconds when the pool connection is cold.
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 8_000),
      );
      await Promise.race([authClient.signOut(), timeout]);
      // Hard navigation: the layout never remounts on router.push() so
      // isSigningOut would stay true indefinitely. replace() forces a full
      // reload, resets all component state, and gives a fresh server render.
      window.location.replace("/");
    } catch {
      // Timed out or server error — reset spinner so the user can retry.
      setIsSigningOut(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open user menu"
        disabled={isSigningOut}
        className="relative flex shrink-0 rounded-full ring-offset-background transition-shadow hover:ring-2 hover:ring-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none"
      >
        <Avatar className={cn("size-8", isSigningOut && "opacity-30")}>
          <AvatarImage
            src={user.image ?? undefined}
            alt={user.name ?? user.email}
            referrerPolicy="no-referrer"
          />
          <AvatarFallback className="bg-accent-muted text-xs font-semibold text-accent">
            {getInitials(user.name, user.email)}
          </AvatarFallback>
        </Avatar>
        {isSigningOut && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 animate-spin text-text-primary" />
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-medium text-text-primary">
            {user.name ?? "User"}
          </p>
          <p className="truncate text-xs text-text-muted">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        {/* The one upgrade entry point that exists at every viewport width.
            AppNavbar's pill can only appear from 1366px up without pushing
            the avatar off-screen, and the mobile menu stops at 1024px — which
            left 1024–1365px with no navbar route to pricing at all. This
            dropdown is present at every width, so it closes that gap. */}
        {!isPremiumUser && (
          <DropdownMenuItem
            onClick={() => router.push("/pricing")}
            className="text-premium focus:bg-premium-light focus:text-premium [&_svg]:!text-premium"
          >
            <Sparkles className="mr-2 size-4" />
            Upgrade to Premium
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => router.push("/dashboard")}>
          <LayoutDashboard className="mr-2 size-4" />
          Dashboard
        </DropdownMenuItem>
        {/* Opens the Settings modal (Next.js Parallel + Intercepting Routes —
            see app/@settingsModal, at the shared root so it correctly
            overlays pages in both (app) and (main)). */}
        <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
          <Settings className="mr-2 size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/feedback")}>
          <MessageSquare className="mr-2 size-4" />
          Feedback
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/changelog")}>
          <FileText className="mr-2 size-4" />
          Changelog
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleTheme}>
          {theme === "dark" ? (
            <Sun className="mr-2 size-4" />
          ) : (
            <Moon className="mr-2 size-4" />
          )}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          variant="destructive"
          className="text-error focus:bg-error-muted focus:text-error [&_svg]:!text-error"
        >
          <LogOut className="mr-2 size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
