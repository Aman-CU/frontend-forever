import type { ReactNode } from "react";

import { SettingsModal } from "@/features/settings/components/SettingsModal";

type LayoutProps = {
  children: ReactNode;
};

// Owns the Dialog (via SettingsModal) so it survives a sidebar navigation
// between sections (e.g. Account -> Profile) instead of replaying its
// open/close animation on every switch. Lives one level *above* the
// [section] folder deliberately — a layout scoped to [section] itself still
// gets torn down and remounted when that segment's own param changes
// (confirmed empirically with a true mount/unmount lifecycle effect, not
// just visually), because Next.js treats it as part of "that segment."
//
// No params, no auth check here on purpose — a layout above [section]
// structurally cannot receive that segment's own param (confirmed via
// Next's generated typed-routes: it resolves to `{}`, not `{ section }`),
// so section/session validation stays where it can actually happen
// correctly: page.tsx, which still fully guards the route (notFound/redirect
// there aborts this whole segment tree, including this layout's Dialog,
// before anything is shown).
export default function InterceptedSettingsLayout({ children }: LayoutProps) {
  return <SettingsModal>{children}</SettingsModal>;
}
