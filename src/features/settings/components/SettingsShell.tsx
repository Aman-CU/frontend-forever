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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 md:flex-row lg:px-8">
      <div className="w-full shrink-0 md:w-56">
        <SettingsSidebar activeSection={activeSection} />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
