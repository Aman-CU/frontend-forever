import { cn } from "@/lib/utils";
import { getCompanyInitials } from "@/features/interview-prep/lib/companies";

type Props = {
  name: string;
  size?: "sm" | "md";
  className?: string;
};

// Flat monochrome initials tile — deliberate for all 32 companies, including
// the 6 that already have real brand SVGs elsewhere (CompanyGuidesPreview,
// the homepage strip) — a 32-card grid mixing 6 branded logos with 26 plain
// tiles would read as inconsistent. Same "deliberately monochrome" precedent
// as COLLECTION_META/PLAYBOOK_META's icon squares (no per-item colorKey).
export function CompanyBadge({ name, size = "md", className }: Props) {
  const initials = getCompanyInitials(name);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-surface-secondary font-semibold text-text-secondary",
        size === "md" ? "h-11 w-11 text-sm" : "h-8 w-8 text-xs",
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
