import { notFound, redirect } from "next/navigation";

import { getCachedSession } from "@/lib/auth/server";
import { isSettingsSection } from "@/features/settings/lib/sections";
import { SettingsModal } from "@/features/settings/components/SettingsModal";
import { SettingsSectionContent } from "@/features/settings/components/SettingsSectionContent";

type PageProps = {
  params: Promise<{ section: string }>;
};

// Intercepts client-side navigation to /settings/[section] and renders it as
// an overlay on top of whatever page was already open, instead of a full
// page transition — the URL still updates to the real route (Next.js's
// Parallel + Intercepting Routes convention for modals). A hard
// navigation/refresh never hits this file; it renders
// app/(app)/settings/[section]/page.tsx instead.
//
// Lives at the shared root (app/@settingsModal), not nested inside (app),
// so this same slot correctly overlays pages in both (app) and (main) — the
// two top-level layout trees, sibling to each other, that this app has. A
// slot nested in just one of them can only ever recover the previous page's
// state (and thus only ever show a real overlay, not a blank body) for
// navigations that already started inside that same tree.
export default async function InterceptedSettingsSectionPage({ params }: PageProps) {
  const { section } = await params;
  if (!isSettingsSection(section)) {
    notFound();
  }

  const session = await getCachedSession();
  if (!session?.user) {
    redirect(`/login?callbackURL=/settings/${section}`);
  }

  return (
    <SettingsModal activeSection={section}>
      <SettingsSectionContent section={section} userId={session.user.id} />
    </SettingsModal>
  );
}
