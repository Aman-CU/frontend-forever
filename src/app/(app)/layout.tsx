import { headers } from "next/headers";

import { auth } from "@/lib/auth/server";
import { AppNavbar } from "@/components/layout/AppNavbar";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let initialUser = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    initialUser = session?.user ?? null;
  } catch {
    // Fall through — navbar will load session client-side
  }

  return (
    <>
      <AppNavbar initialUser={initialUser} />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
