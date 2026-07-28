"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SettingsSidebar } from "@/features/settings/components/SettingsSidebar";
import type { SettingsSection } from "@/features/settings/lib/sections";

type Props = {
  activeSection: SettingsSection;
  children: ReactNode;
};

// The modal's "open" state is just "is this intercepted route mounted" — it
// has no boolean state of its own. Closing means navigating back to whatever
// page was open behind it (Next.js's own intercepting-routes-modal
// convention), so the URL and the modal never drift out of sync.
export function SettingsModal({ activeSection, children }: Props) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent
        showCloseButton
        className="flex max-h-[85vh] w-full max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <div className="w-48 shrink-0 border-r border-border p-4">
          <SettingsSidebar activeSection={activeSection} />
        </div>
        <div className="min-w-0 flex-1 overflow-y-auto p-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
