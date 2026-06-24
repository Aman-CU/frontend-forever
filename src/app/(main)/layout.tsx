import { headers } from "next/headers";

import { auth } from "@/lib/auth/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialUser = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    initialUser = session?.user ?? null;
  } catch {
    // Fall through — navbar will load session client-side
  }

  return (
    <>
      <Navbar initialUser={initialUser} />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
