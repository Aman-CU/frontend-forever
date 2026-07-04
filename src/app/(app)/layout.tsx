import { headers } from "next/headers";

import { auth } from "@/lib/auth/server";
import { getProfileStreak } from "@/lib/profile";
import { AppNavbar } from "@/components/layout/AppNavbar";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let initialUser: import("@/hooks/useUser").SessionUser | null | undefined;
  let initialStreak = 0;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    initialUser = session?.user ?? null;
    if (session?.user) {
      initialStreak = await getProfileStreak(session.user.id);
    }
  } catch {
    // initialUser stays undefined — navbar falls back to client-side loading
  }

  return (
    <>
      <AppNavbar initialUser={initialUser} initialStreak={initialStreak} />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
