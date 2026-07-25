import type { RoadmapSeoContent } from "@/features/roadmaps/lib/roadmapSeoContent";

type Props = { content: RoadmapSeoContent };

// Plain, always-visible Q&A — not a collapsed accordion. GEO/SEO content is
// meant to be crawlable/extractable (build-plan.md's Feature 31 rule), and
// hidden-until-click text works against that.
export function RoadmapFaq({ content }: Props) {
  return (
    <section className="mx-auto mt-12 w-full max-w-3xl px-6 lg:px-8">
      <p className="text-sm leading-relaxed text-text-secondary">{content.intro}</p>

      <h2 className="mt-8 mb-4 text-lg font-semibold text-text-primary">
        Frequently asked questions
      </h2>
      <div className="space-y-5">
        {content.faqs.map((faq) => (
          <div key={faq.question}>
            <h3 className="text-sm font-semibold text-text-primary">{faq.question}</h3>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
