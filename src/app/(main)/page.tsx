import { CTASection } from "@/components/homepage/CTASection";
import { FeatureHighlightsSection } from "@/components/homepage/FeatureHighlightsSection";
import { Hero } from "@/components/homepage/Hero";
import { HowItWorksSection } from "@/components/homepage/HowItWorksSection";
import { TestimonialsSection } from "@/components/homepage/TestimonialsSection";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorksSection />
      <FeatureHighlightsSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
