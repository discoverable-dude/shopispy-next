import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScraperContent } from "@/components/marketing/ScraperContent";

export const metadata: Metadata = {
  title: "Free Shopify Store Scraper",
  description: "Enter any Shopify store URL and instantly see every product, price, and variant in their catalog. Free to try, no signup needed.",
  alternates: { canonical: "/scraper" },
};

export default function ScraperPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ScraperContent />
      <Footer />
    </div>
  );
}
