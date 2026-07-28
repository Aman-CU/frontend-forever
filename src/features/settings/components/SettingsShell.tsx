import type { ReactNode } from "react";

import { SettingsSidebar } from "@/features/settings/components/SettingsSidebar";
import type { SettingsSection } from "@/features/settings/lib/sections";

type Props = {
  activeSection: SettingsSection;
  children: ReactNode;
};

// Full-page shell — used only on a hard navigation/refresh (the intercepted
// route uses SettingsModal instead, sharing this same SettingsSidebar).
export function SettingsShell({ activeSection, children }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-4xl gap-8 px-6 py-10 lg:px-8">
      <div className="w-48 shrink-0">
        <SettingsSidebar activeSection={activeSection} />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
