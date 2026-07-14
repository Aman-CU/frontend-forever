import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AmazonLogo } from "@/components/shared/logos/AmazonLogo";
import { AnthropicLogo } from "@/components/shared/logos/AnthropicLogo";
import { GoogleLogo } from "@/components/shared/logos/GoogleLogo";
import { MetaLogo } from "@/components/shared/logos/MetaLogo";
import { MicrosoftLogo } from "@/components/shared/logos/MicrosoftLogo";
import { StripeLogo } from "@/components/shared/logos/StripeLogo";

// Lightweight static teaser (Feature 30 sign-off) — real logo components,
// not placeholder text chips, but only the 6 that already exist from
// Feature 04's homepage strip. The other 26 of the full 32-company list
// (build-plan.md, Feature 51) need their own hand-inlined SVGs, built as
// part of that feature — not invented here as a stand-in.
const COMPANY_PREVIEWS = [
  { name: "Google", Logo: GoogleLogo },
  { name: "Meta", Logo: MetaLogo },
  { name: "Amazon", Logo: AmazonLogo },
  { name: "Microsoft", Logo: MicrosoftLogo },
  { name: "Stripe", Logo: StripeLogo },
  { name: "Anthropic", Logo: AnthropicLogo },
] as const;

const TOTAL_COMPANY_COUNT = 32;

export function CompanyGuidesPreview() {
  const remaining = TOTAL_COMPANY_COUNT - COMPANY_PREVIEWS.length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Company Guides
        </h2>
        <Link
          href="/interview-prep/company-guides"
          className="flex items-center gap-1 text-xs font-semibold text-accent transition-colors hover:text-accent-dark"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <Link
        href="/interview-prep/company-guides"
        className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
      >
        {COMPANY_PREVIEWS.map(({ name, Logo }) => (
          <span
            key={name}
            className="flex h-11 items-center rounded-lg bg-surface-secondary px-4 text-text-primary"
          >
            <span className="sr-only">{name}</span>
            <Logo className="h-5 w-auto" />
          </span>
        ))}
        <span className="flex h-11 items-center rounded-lg bg-accent-muted px-4 text-xs font-semibold text-accent">
          +{remaining} more
        </span>
      </Link>
    </div>
  );
}
