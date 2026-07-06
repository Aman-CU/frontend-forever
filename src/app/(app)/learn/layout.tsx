import { LearnSidebar } from "@/components/layout/LearnSidebar";
import { getCachedSession } from "@/lib/auth/server";
import { getCategorySummaries, getIsPremiumUser } from "@/features/learn/lib/queries";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const session = await getCachedSession();
  const userId = session?.user?.id ?? null;

  const [categories, isPremiumUser] = await Promise.all([
    getCategorySummaries(userId),
    userId ? getIsPremiumUser(userId) : Promise.resolve(false),
  ]);

  return (
    <div className="flex flex-1">
      <LearnSidebar categories={categories} isPremiumUser={isPremiumUser} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
