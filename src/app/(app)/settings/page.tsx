import { redirect } from "next/navigation";

// Bare /settings has no content of its own — redirect to the default
// section. Only reached on a hard navigation (typed URL, refresh); the
// navbar dropdown's client-side links go straight to /settings/profile,
// which triggers the intercepted modal instead of this page.
export default function SettingsPage() {
  redirect("/settings/profile");
}
