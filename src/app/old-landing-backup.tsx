import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { CapabilitiesSection } from "@/components/landing/capabilities-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FinalCTASection } from "@/components/landing/final-cta-section";
import { AnalyticsProvider } from "@/components/analytics-provider";

export const metadata = {
  title: "Boring Automation - The Fastest Way to Automate with AI",
  description:
    "Empower your sales, marketing, and operations teams with AI agents that work 24/7. Setup in 7 days, trusted by 50,000+ companies.",
};

export default function Home() {

  return (
    <AnalyticsProvider>
      <div className="flex flex-col min-h-screen">
        <PublicHeader />

        <main className="flex-grow">
          <HeroSection />
          <FeaturesSection />
          <SocialProofSection />
          <TestimonialsSection />
          <HowItWorksSection />
          <CapabilitiesSection />
          <FAQSection />
          <FinalCTASection />
        </main>

        <PublicFooter />
      </div>
    </AnalyticsProvider>
  );
}
