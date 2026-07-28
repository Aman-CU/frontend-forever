import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  SETTINGS_SECTIONS,
  SETTINGS_SECTION_META,
  type SettingsSection,
} from "@/features/settings/lib/sections";

type Props = {
  activeSection: SettingsSection;
};

export function SettingsSidebar({ activeSection }: Props) {
  return (
    <nav aria-label="Settings sections">
      <p className="mb-2 px-2 text-xs font-semibold tracking-wide text-text-muted uppercase">
        Settings
      </p>
      <ul className="space-y-0.5">
        {SETTINGS_SECTIONS.map((section) => {
          const { label, icon: Icon } = SETTINGS_SECTION_META[section];
          const isActive = section === activeSection;
          return (
            <li key={section}>
              <Link
                href={`/settings/${section}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent-muted text-accent"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
