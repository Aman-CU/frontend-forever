import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AmazonLogo } from "@/components/shared/logos/AmazonLogo";
import { AnthropicLogo } from "@/components/shared/logos/AnthropicLogo";
import { GoogleLogo } from "@/components/shared/logos/GoogleLogo";
import { MetaLogo } from "@/components/shared/logos/MetaLogo";
import { MicrosoftLogo } from "@/components/shared/logos/MicrosoftLogo";
import { StripeLogo } from "@/components/shared/logos/StripeLogo";
import type { CompanyGuideSummary } from "@/features/interview-prep/lib/queries";

// The 6 real logo components from Feature 04's homepage strip — kept as-is
// here (Feature 51 sign-off): the full 32-company grid page uses a
// consistent monochrome initials tile for every company instead (see
// CompanyBadge), but this small teaser row predates that decision and stays
// on its existing 6 real logos rather than being restyled to match.
const COMPANY_PREVIEWS = [
  { name: "Google", Logo: GoogleLogo },
  { name: "Meta", Logo: MetaLogo },
  { name: "Amazon", Logo: AmazonLogo },
  { name: "Microsoft", Logo: MicrosoftLogo },
  { name: "Stripe", Logo: StripeLogo },
  { name: "Anthropic", Logo: AnthropicLogo },
] as const;

const TOTAL_COMPANY_COUNT = 32;

type Props = {
  companies: CompanyGuideSummary[];
};

export function CompanyGuidesPreview({ companies }: Props) {
  const remaining = TOTAL_COMPANY_COUNT - COMPANY_PREVIEWS.length;
  const totalQuestions = companies.reduce((sum, c) => sum + c.questionCount + c.challengeCount, 0);

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
        className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
      >
        <div className="flex flex-wrap items-center gap-3">
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
        </div>
        <p className="text-xs text-text-muted">
          {totalQuestions} real questions and challenges across all {TOTAL_COMPANY_COUNT} companies
        </p>
      </Link>
    </div>
  );
}
