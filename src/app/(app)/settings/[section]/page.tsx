import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getCachedSession } from "@/lib/auth/server";
import { isSettingsSection } from "@/features/settings/lib/sections";
import { SettingsShell } from "@/features/settings/components/SettingsShell";
import { SettingsSectionContent } from "@/features/settings/components/SettingsSectionContent";

export const metadata: Metadata = {
  title: "Settings | Frontend Forever",
  description: "Manage your Frontend Forever account.",
};

type PageProps = {
  params: Promise<{ section: string }>;
  // Only read by the "account" section — see SettingsSectionContent.tsx.
  searchParams: Promise<{ error?: string }>;
};

// Full-page render — hit on a hard navigation/refresh to /settings/[section]
// (Next.js's intercepting-routes convention: the modal only opens for
// client-side navigation from within the app; a direct/shared URL or a
// refresh always renders the real page). See @settingsModal for the
// intercepted, same-content overlay version of this route.
export default async function SettingsSectionPage({ params, searchParams }: PageProps) {
  const { section } = await params;
  if (!isSettingsSection(section)) {
    notFound();
  }

  const session = await getCachedSession();
  // proxy.ts already matches /settings/:path* on cookie presence, but that's
  // only an optimistic check (see architecture.md → Authentication) — verify
  // the real session here too, same defensive precedent as /leaderboard.
  if (!session?.user) {
    redirect(`/login?callbackURL=/settings/${section}`);
  }

  const { error } = await searchParams;

  return (
    <SettingsShell activeSection={section}>
      <SettingsSectionContent section={section} userId={session.user.id} linkErrorCode={error} />
    </SettingsShell>
  );
}
