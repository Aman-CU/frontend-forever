import type { ComponentType } from "react";
import { User, UserCog, ShieldCheck } from "lucide-react";

// Add a new entry here only once that section has real content behind it —
// Appearance (59) and Billing (Feature 39) are deliberately not scaffolded
// yet, since a nav item that opens to nothing is worse than not showing it
// at all. See the Pre-Feature-56 decision entry in progress-tracker.md for
// the full Phase 13 settings roadmap.
export const SETTINGS_SECTIONS = ["profile", "account", "security"] as const;
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];

export const SETTINGS_SECTION_META: Record<
  SettingsSection,
  { label: string; icon: ComponentType<{ className?: string }> }
> = {
  profile: { label: "Profile", icon: User },
  account: { label: "Account", icon: UserCog },
  security: { label: "Security", icon: ShieldCheck },
};

export function isSettingsSection(value: string): value is SettingsSection {
  return (SETTINGS_SECTIONS as readonly string[]).includes(value);
}
