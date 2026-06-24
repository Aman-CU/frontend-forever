import { headers } from "next/headers";

import { auth } from "@/lib/auth/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialUser: import("@/hooks/useUser").SessionUser | null | undefined;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    initialUser = session?.user ?? null;
  } catch {
    // initialUser stays undefined — navbar falls back to client-side loading
  }

  return (
    <>
      <Navbar initialUser={initialUser} />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
