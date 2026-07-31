import { notFound, redirect } from "next/navigation";

import { getCachedSession } from "@/lib/auth/server";
import { isSettingsSection } from "@/features/settings/lib/sections";
import { SettingsSectionContent } from "@/features/settings/components/SettingsSectionContent";

type PageProps = {
  params: Promise<{ section: string }>;
  // Only read by the "account" section — see SettingsSectionContent.tsx.
  searchParams: Promise<{ error?: string }>;
};

// Intercepts client-side navigation to /settings/[section] and renders it as
// an overlay on top of whatever page was already open, instead of a full
// page transition — the URL still updates to the real route (Next.js's
// Parallel + Intercepting Routes convention for modals). A hard
// navigation/refresh never hits this file; it renders
// app/(app)/settings/[section]/page.tsx instead.
//
// The Dialog itself (SettingsModal) lives in ../layout.tsx — one level up
// from this [section] folder, not inside it — so it survives a sidebar
// navigation between sections instead of remounting (see that file's
// comment for why it has to be one level higher, not right here). This page
// is the only place that can validate section/session (a parent layout
// structurally can't see this segment's own param) and renders the
// section-specific content.
export default async function InterceptedSettingsSectionPage({ params, searchParams }: PageProps) {
  const { section } = await params;
  if (!isSettingsSection(section)) {
    notFound();
  }

  const session = await getCachedSession();
  if (!session?.user) {
    redirect(`/login?callbackURL=/settings/${section}`);
  }

  const { error } = await searchParams;

  return <SettingsSectionContent section={section} userId={session.user.id} linkErrorCode={error} />;
}
