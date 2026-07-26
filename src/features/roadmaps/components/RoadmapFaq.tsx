"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { RoadmapSeoContent } from "@/features/roadmaps/lib/roadmapSeoContent";

type Props = { content: RoadmapSeoContent };

// Accordion FAQ, matching roadmap.sh's own reference page (direct user
// request against a screenshot) — was previously an always-visible plain
// Q&A specifically to stay crawlable for GEO/SEO (build-plan.md's Feature
// 31 rule). Every answer stays in the DOM at all times here too — collapsed
// via a CSS grid-template-rows transition, never conditionally unmounted —
// so a crawler/LLM extractor still sees the full text either way; only the
// visual presentation changed.
export function RoadmapFaq({ content }: Props) {
  const [openQuestion, setOpenQuestion] = useState<string | null>(content.faqs[0]?.question ?? null);

  return (
    <section className="mx-auto mt-12 w-full max-w-3xl px-6 lg:px-8">
      <p className="text-sm leading-relaxed text-text-secondary">{content.intro}</p>

      <div className="mt-8 rounded-xl border border-border bg-surface px-4 py-3.5">
        <h2 className="text-base font-semibold text-text-primary">Frequently Asked Questions</h2>
      </div>

      <div className="mt-3 space-y-3">
        {content.faqs.map((faq) => {
          const isOpen = openQuestion === faq.question;
          return (
            <div key={faq.question} className="rounded-xl border border-border bg-surface">
              <button
                type="button"
                onClick={() => setOpenQuestion(isOpen ? null : faq.question)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-sm font-semibold text-text-primary">{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-4 pb-4 text-sm leading-relaxed text-text-secondary">{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
