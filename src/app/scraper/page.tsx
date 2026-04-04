import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScraperContent } from "@/components/marketing/ScraperContent";

export const metadata: Metadata = {
  title: "Free Shopify Store Scraper",
  description:
    "Enter any Shopify store URL and instantly see every product, price, and variant in their catalog. Free to try, no signup needed.",
  alternates: { canonical: "/scraper" },
};

function ScraperLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export default function ScraperPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={<ScraperLoading />}>
        <ScraperContent />
      </Suspense>
      <Footer />
    </div>
  );
}
