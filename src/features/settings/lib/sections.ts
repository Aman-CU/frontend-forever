import type { ComponentType } from "react";
import { User } from "lucide-react";

// Only "profile" is real today (Feature 37's streak calendar). Add a new
// entry here only once that section has real content behind it — Billing
// (Feature 39) and others are deliberately not scaffolded yet, since a nav
// item that opens to nothing is worse than not showing it at all.
export const SETTINGS_SECTIONS = ["profile"] as const;
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];

export const SETTINGS_SECTION_META: Record<
  SettingsSection,
  { label: string; icon: ComponentType<{ className?: string }> }
> = {
  profile: { label: "Profile", icon: User },
};

export function isSettingsSection(value: string): value is SettingsSection {
  return (SETTINGS_SECTIONS as readonly string[]).includes(value);
}
