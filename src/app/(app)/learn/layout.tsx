import { LearnSidebar } from "@/components/layout/LearnSidebar";
import { getCachedSession } from "@/lib/auth/server";
import { getCategorySummaries } from "@/features/learn/lib/queries";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const session = await getCachedSession();
  const userId = session?.user?.id ?? null;

  const categories = await getCategorySummaries(userId);

  return (
    <div className="flex flex-1">
      <LearnSidebar categories={categories} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
