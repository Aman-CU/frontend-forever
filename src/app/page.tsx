import { FeatureHighlightsSection } from "@/components/homepage/FeatureHighlightsSection";
import { Hero } from "@/components/homepage/Hero";
import { HowItWorksSection } from "@/components/homepage/HowItWorksSection";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorksSection />
      <FeatureHighlightsSection />
    </>
  );
}
