"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SettingsSidebar } from "@/features/settings/components/SettingsSidebar";
import { isSettingsSection, SETTINGS_SECTIONS } from "@/features/settings/lib/sections";

type Props = {
  children: ReactNode;
};

// The modal's "open" state is just "is this intercepted route mounted" — it
// has no boolean state of its own. Closing means navigating back to whatever
// page was open behind it (Next.js's own intercepting-routes-modal
// convention), so the URL and the modal never drift out of sync.
//
// activeSection is derived from the URL client-side (usePathname), not
// passed as a prop from a server layout — this component is rendered by
// (.)settings/layout.tsx, which sits one level *above* the [section]
// dynamic segment specifically so it stays mounted across a sidebar
// navigation between sections (see that file's comment for why a lower
// layout doesn't work). A layout above [section] structurally cannot
// receive that segment's own param (confirmed via Next's generated
// typed-routes, not just assumed) — so the section has to come from
// somewhere that *is* stable across the navigation and *does* reflect the
// current URL: the pathname, read on the client.
export function SettingsModal({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const lastSegment = pathname.split("/").pop();
  const activeSection = lastSegment && isSettingsSection(lastSegment) ? lastSegment : SETTINGS_SECTIONS[0];

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent
        showCloseButton
        className="flex h-160 max-h-[85vh] w-full max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl md:flex-row"
      >
        <div className="w-full shrink-0 border-b border-border p-5 md:w-56 md:border-r md:border-b-0">
          <SettingsSidebar activeSection={activeSection} replace />
        </div>
        <div className="min-w-0 flex-1 overflow-y-auto p-8">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
