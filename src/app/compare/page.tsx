import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ComparisonTool } from "@/components/marketing/ComparisonTool";

export const metadata: Metadata = {
  title: "Compare Shopify Stores",
  description:
    "Compare any Shopify stores side by side. See product counts, pricing, update frequency, and competitive positioning.",
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ComparisonTool />
      <Footer />
    </div>
  );
}
