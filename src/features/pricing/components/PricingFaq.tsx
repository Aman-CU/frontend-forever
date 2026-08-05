import { ChevronDown } from "lucide-react";

import { PRICING_FAQ } from "@/features/pricing/lib/faq";

// Built on native <details>/<summary> rather than a JS accordion, and so it
// stays a server component with zero client JS.
//
// That choice is deliberate, not laziness: ui-registry.md records that the
// roadmap FAQs were rendered always-visible specifically because
// hidden-until-click content works against SEO/GEO crawlability. <details>
// keeps every answer in the served HTML whether or not it's open — a crawler
// reads all of it — while still collapsing visually the way the reference
// pricing pages do. A conditional React accordion would have re-introduced
// exactly the problem that note was written about.
export function PricingFaq() {
  return (
    <section
      id="faq"
      className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-10 px-6 py-16 md:px-8 md:py-20 lg:flex-row lg:gap-16"
    >
      <div className="lg:w-2/5">
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl">
          Questions, answered
        </h2>
        <p className="mt-4 text-base text-text-secondary">
          Everything people ask before subscribing. If yours isn&apos;t here, the answer is
          probably that we&apos;d rather you asked than guessed.
        </p>
      </div>

      <div className="flex flex-1 flex-col">
        {PRICING_FAQ.map((item) => (
          <details
            key={item.id}
            className="group border-b border-border py-5 first:border-t first:border-border"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left text-base font-semibold text-text-primary transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown
                className="mt-0.5 size-5 shrink-0 text-text-muted transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <p className="mt-3 max-w-3xl pr-11 text-sm leading-relaxed text-text-secondary">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
