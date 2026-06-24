import { AppNavbar } from "@/components/layout/AppNavbar";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AppNavbar />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
