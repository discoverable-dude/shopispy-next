import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PricingContent } from "@/components/marketing/PricingContent";

export const metadata: Metadata = {
  title: "Pricing Plans",
  description:
    "Flexible pricing plans for Shopify competitor intelligence. Start free, upgrade as you grow. Track stores, monitor prices, and get real-time alerts.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PricingContent />
      <Footer />
    </div>
  );
}
