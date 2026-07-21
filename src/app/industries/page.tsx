import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BrandIcon } from "@/components/marketing/BrandIcon";
import { VERTICALS, ALL_BRANDS, TOTAL_PRODUCTS } from "@/lib/brands";
import { slugify, getTopBrands } from "@/lib/brandUtils";
import { fetchLiveCounts } from "@/lib/productData";
import { IndustriesGrid } from "@/components/marketing/IndustriesGrid";
import { ArrowRight, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Browse Shopify stores by industry. Track products, prices, and launches across fashion, beauty, food, electronics, and more.",
  alternates: { canonical: "/industries" },
};

export const revalidate = 300;

export default async function IndustriesPage() {
  // Real per-vertical product totals from the DB (static VERTICALS have no counts).
  const { byVertical } = await fetchLiveCounts();
  const verticalData = VERTICALS.map((v) => {
    const top5 = getTopBrands(v, 5);
    const t = byVertical.get(v.label);
    return {
      id: v.id,
      label: v.label,
      slug: slugify(v.label),
      brandCount: v.brands.length,
      totalProducts: t?.total ?? 0,
      recentlyUpdated: t?.brandsWithData ?? 0,
      topBrands: top5.map((b) => ({ name: b.name, domain: b.domain })),
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden pb-8 pt-20">
        <div className="absolute inset-0 bg-dot-pattern mask-fade-b" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            {ALL_BRANDS.length} brands &middot; {VERTICALS.length} industries
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Shopify intelligence <span className="text-gradient">by industry</span>
          </h1>
          <p className="mt-4 mx-auto max-w-xl text-muted-foreground">
            Browse {TOTAL_PRODUCTS.toLocaleString()} tracked products across {VERTICALS.length} verticals.
            Drill into any industry for top brands, pricing data, and competitive insights.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/reports"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Download className="h-4 w-4" /> Download reports
            </Link>
            <Link
              href="/scraper"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:brightness-110"
            >
              Track your competitors <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Grid — client component for animations */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <IndustriesGrid verticals={verticalData} />
      </section>

      <Footer />
    </div>
  );
}
