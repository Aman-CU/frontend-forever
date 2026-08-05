import { headers } from "next/headers";

import { auth } from "@/lib/auth/server";
import { getProfileSummary } from "@/lib/profile";
import { AppNavbar } from "@/components/layout/AppNavbar";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let initialUser: import("@/hooks/useUser").SessionUser | null | undefined;
  let initialStreak = 0;
  let initialXp = 0;
  let isPremiumUser = false;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    initialUser = session?.user ?? null;
    if (session?.user) {
      ({
        xp: initialXp,
        streakCurrent: initialStreak,
        isPremium: isPremiumUser,
      } = await getProfileSummary(session.user.id));
    }
  } catch {
    // initialUser stays undefined — navbar falls back to client-side loading
  }

  return (
    <>
      <AppNavbar
        initialUser={initialUser}
        initialStreak={initialStreak}
        initialXp={initialXp}
        isPremiumUser={isPremiumUser}
      />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
