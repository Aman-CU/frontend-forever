import type { Metadata } from "next";

import { getCachedSession } from "@/lib/auth/server";
import { getBaseUrl, safeJsonLd } from "@/lib/seo";
import { TestimonialsSection } from "@/components/homepage/TestimonialsSection";
import { getIsPremiumUser } from "@/features/pricing/lib/queries";
import { PRICING_FAQ } from "@/features/pricing/lib/faq";
import { LIFETIME_PLAN, PRICING_PLANS } from "@/features/pricing/lib/plans";
import { resolveViewerState } from "@/features/pricing/lib/viewer";
import { PricingHero } from "@/features/pricing/components/PricingHero";
import { PricingPlansSection } from "@/features/pricing/components/PricingPlansSection";
import { PricingFeaturesSection } from "@/features/pricing/components/PricingFeaturesSection";
import { PricingFaq } from "@/features/pricing/components/PricingFaq";

const PAGE_TITLE = "Pricing | Frontend Forever";
const PAGE_DESCRIPTION =
  "One Premium tier, four ways to pay. Unlock every interview question, coding challenge, system design guide and study plan on Frontend Forever.";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}/pricing`;

  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
    },
  };
}

export default async function PricingPage() {
  // The page renders for everyone — anonymous, free and premium — so a failed
  // session/profile read degrades to the anonymous view rather than erroring
  // the whole page out. Worst case a signed-in user sees the sign-up CTA;
  // nothing is unlocked by this value, it only picks which CTA to show.
  let isLoggedIn = false;
  let isPremiumUser = false;
  try {
    const session = await getCachedSession();
    if (session?.user) {
      isLoggedIn = true;
      isPremiumUser = await getIsPremiumUser(session.user.id);
    }
  } catch {
    // isLoggedIn / isPremiumUser stay false — anonymous view.
  }

  const viewerState = resolveViewerState(isLoggedIn, isPremiumUser);
  const baseUrl = await getBaseUrl();

  // Offers are built from the same constants the cards render from, so the
  // structured data can't drift away from the visible prices.
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Frontend Forever Premium",
    description: PAGE_DESCRIPTION,
    url: `${baseUrl}/pricing`,
    brand: { "@type": "Brand", name: "Frontend Forever" },
    offers: [
      ...PRICING_PLANS.map((plan) => ({
        "@type": "Offer",
        name: `${plan.name} plan`,
        price: plan.billedTotal.toFixed(2),
        priceCurrency: "USD",
        url: `${baseUrl}/pricing`,
      })),
      {
        "@type": "Offer",
        name: `${LIFETIME_PLAN.name} plan`,
        price: LIFETIME_PLAN.price.toFixed(2),
        priceCurrency: "USD",
        url: `${baseUrl}/pricing`,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PRICING_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      {/* Rendered as script text content, never dangerouslySetInnerHTML — see
          security.md → XSS Prevention, and safeJsonLd for the </script> escape. */}
      <script type="application/ld+json">{safeJsonLd(productJsonLd)}</script>
      <script type="application/ld+json">{safeJsonLd(faqJsonLd)}</script>

      <PricingHero viewerState={viewerState} />
      <PricingPlansSection viewerState={viewerState} />
      <PricingFeaturesSection />
      <PricingFaq />
      <TestimonialsSection />
    </>
  );
}
