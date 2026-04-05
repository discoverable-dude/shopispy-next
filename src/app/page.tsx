import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomepageHero } from "@/components/marketing/HomepageHero";
import { HomepageLogos } from "@/components/marketing/HomepageLogos";
import { HomepageFeatures } from "@/components/marketing/HomepageFeatures";
import { HomepageStatsAndProcess } from "@/components/marketing/HomepageStatsAndProcess";
import { HomepageIntelAndProof } from "@/components/marketing/HomepageIntelAndProof";
import { HomepageCTA } from "@/components/marketing/HomepageCTA";

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
      <HomepageLogos />
      <HomepageFeatures />
      <HomepageStatsAndProcess />
      <HomepageIntelAndProof />
      <HomepageCTA />
      <Footer />
    </div>
  );
}
