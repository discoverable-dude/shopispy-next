import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BrandIcon } from "@/components/marketing/BrandIcon";
import { VERTICALS, ALL_BRANDS, TOTAL_PRODUCTS } from "@/lib/brands";
import { slugify, getVerticalStats, getTopBrands } from "@/lib/brandUtils";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Browse Shopify stores by industry. Track products, prices, and launches across fashion, beauty, food, electronics, and more.",
  alternates: { canonical: "/industries" },
};

export default function IndustriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Intelligence by sector</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Industries</h1>
          <p className="mt-3 text-muted-foreground">
            {ALL_BRANDS.length} Shopify brands tracked across {VERTICALS.length} industries.{" "}
            {TOTAL_PRODUCTS.toLocaleString()} products monitored.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VERTICALS.map((vertical) => {
            const stats = getVerticalStats(vertical);
            const top5 = getTopBrands(vertical, 5);

            return (
              <Link
                key={vertical.id}
                href={`/industries/${slugify(vertical.label)}`}
                className="group rounded-2xl border border-border/60 p-5 transition-all hover:border-primary/20 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {vertical.label}
                  </h2>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>

                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{vertical.brands.length} brands</span>
                  <span className="text-border">&middot;</span>
                  <span>{stats.total.toLocaleString()} products</span>
                  <span className="text-border">&middot;</span>
                  <span>{stats.recentlyUpdated} active</span>
                </div>

                {/* Brand favicon row */}
                <div className="mt-4 flex items-center gap-1.5">
                  {top5.map((brand) => (
                    <BrandIcon key={brand.name} name={brand.name} domain={brand.domain} size="sm" />
                  ))}
                  {vertical.brands.length > 5 && (
                    <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted/40 text-[9px] text-muted-foreground">
                      +{vertical.brands.length - 5}
                    </span>
                  )}
                </div>

                {/* Top brand names */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {top5.slice(0, 3).map((brand) => (
                    <span key={brand.name} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      {brand.name}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-border bg-muted/20 p-8 text-center">
          <h3 className="text-lg font-bold">Download industry benchmark reports</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get CSV and JSON data for all {ALL_BRANDS.length} brands across {VERTICALS.length} industries.
          </p>
          <Link
            href="/reports"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20"
          >
            Download reports <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
