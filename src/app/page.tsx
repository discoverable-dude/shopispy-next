import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomepageHero } from "@/components/marketing/HomepageHero";
import { HomepageFeatures } from "@/components/marketing/HomepageFeatures";
import { HomepageStats } from "@/components/marketing/HomepageStats";
import { HomepageTestimonials } from "@/components/marketing/HomepageTestimonials";
import { HomepageCTA } from "@/components/marketing/HomepageCTA";
import { HomepageDemo } from "@/components/marketing/HomepageDemo";
import { LiveIntelligence } from "@/components/marketing/LiveIntelligence";

export const metadata: Metadata = {
  title: "ShopiSpy - Shopify Competitor Intelligence Tool",
  description:
    "Track your competitors on Shopify. Monitor prices in real-time, get instant alerts on changes, and make data-driven pricing decisions.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HomepageHero />
      <HomepageDemo />
      <HomepageStats />
      <HomepageFeatures />
      <LiveIntelligence />
      <HomepageTestimonials />
      <HomepageCTA />
      <Footer />
    </div>
  );
}
