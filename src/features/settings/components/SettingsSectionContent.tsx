import { getCachedSession } from "@/lib/auth/server";
import { getProfileForEdit, getConnectedAccounts, getActiveSessions } from "@/features/settings/lib/queries";
import { ProfileEditForm } from "@/features/settings/components/ProfileEditForm";
import { AccountSection } from "@/features/settings/components/AccountSection";
import { SecuritySection } from "@/features/settings/components/SecuritySection";
import { AppearanceSection } from "@/features/settings/components/AppearanceSection";
import type { SettingsSection } from "@/features/settings/lib/sections";

type Props = {
  section: SettingsSection;
  userId: string;
  // Only "account" reads this — a failed provider-link attempt (e.g. that
  // GitHub identity already belongs to a different Frontend Forever account)
  // redirects back here via errorCallbackURL=/settings/account?error=<code>.
  linkErrorCode?: string;
};

// Add a branch here as each new section actually ships real content, rather
// than scaffolding one ahead of time — see the Pre-Feature-56 decision entry
// in progress-tracker.md for the full Phase 13 settings roadmap.
export async function SettingsSectionContent({ section, userId, linkErrorCode }: Props) {
  if (section === "profile") {
    const profile = await getProfileForEdit(userId);
    // provisionProfile.ts inserts this row synchronously on account
    // creation, before a session can exist — null here would mean that
    // insert failed, which is a real error, not a normal empty state.
    if (!profile) return null;

    return (
      <div>
        <h2 className="mb-1 text-lg font-bold text-text-primary">Profile</h2>
        <p className="mb-6 text-sm text-text-secondary">
          Your public name, username, and bio. The streak calendar has moved
          to your Dashboard.
        </p>
        <ProfileEditForm initialProfile={profile} />
      </div>
    );
  }

  if (section === "account") {
    const [profile, accounts] = await Promise.all([
      getProfileForEdit(userId),
      getConnectedAccounts(),
    ]);
    if (!profile) return null;

    return <AccountSection accounts={accounts} username={profile.username} linkErrorCode={linkErrorCode} />;
  }

  if (section === "security") {
    const [sessions, currentSession] = await Promise.all([
      getActiveSessions(userId),
      // Already deduped against the auth-check call in page.tsx — this is
      // React's cache(), not an extra request. Only needed here for the
      // current request's own session id (not its token — see
      // getActiveSessions's comment on why a session token never reaches the
      // client at all).
      getCachedSession(),
    ]);

    return <SecuritySection sessions={sessions} currentSessionId={currentSession?.session.id} />;
  }

  if (section === "appearance") {
    // Pure client-side state (localStorage-backed) — no server data to
    // fetch, unlike every other section above.
    return <AppearanceSection />;
  }

  return null;
}
