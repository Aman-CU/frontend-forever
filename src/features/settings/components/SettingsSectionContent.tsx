import { getProfileForEdit } from "@/features/settings/lib/queries";
import { ProfileEditForm } from "@/features/settings/components/ProfileEditForm";
import type { SettingsSection } from "@/features/settings/lib/sections";

type Props = {
  section: SettingsSection;
  userId: string;
};

// Only "profile" exists today — add a branch here as each new section
// (Account, Security, Appearance — see the Pre-Feature-56 decision entry in
// progress-tracker.md) actually ships real content, rather than scaffolding
// one ahead of time.
export async function SettingsSectionContent({ section, userId }: Props) {
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

  return null;
}
