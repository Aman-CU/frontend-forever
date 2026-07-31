import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  SETTINGS_SECTIONS,
  SETTINGS_SECTION_META,
  type SettingsSection,
} from "@/features/settings/lib/sections";

type Props = {
  activeSection: SettingsSection;
  // The modal passes true: switching sections there should replace the
  // current history entry, not push a new one, so the close button's single
  // router.back() always lands on the page behind the modal instead of the
  // previously-viewed section. The full-page shell (hard navigation, no
  // modal/back semantics) leaves this false for normal browsing history.
  replace?: boolean;
};

export function SettingsSidebar({ activeSection, replace = false }: Props) {
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
                replace={replace}
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
