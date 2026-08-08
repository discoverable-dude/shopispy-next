import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VERTICALS, ALL_BRANDS } from "@/lib/brands";
import { slugify } from "@/lib/brandUtils";
import { fetchLiveCounts } from "@/lib/productData";
import { REPORTS } from "@/lib/reports";
import { BuyReportButton } from "@/components/reports/BuyReportButton";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Shopify Benchmark Reports",
  description:
    "Downloadable Shopify competitive-intelligence reports. Product counts, price bands, sale intensity and category data across 16 industries and 700+ brands.",
  alternates: { canonical: "/reports" },
};

// Real, DB-backed numbers — revalidated every 5 minutes.
export const revalidate = 300;

export default async function ReportsPage() {
  const { byVertical } = await fetchLiveCounts();
  const totalProducts = [...byVertical.values()].reduce((a, v) => a + v.total, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Downloadable data</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Shopify Benchmark Reports
          </h1>
          <p className="mt-3 mx-auto max-w-xl text-muted-foreground">
            Competitive intelligence across {ALL_BRANDS.length} Shopify brands and{" "}
            {VERTICALS.length} industries, {totalProducts.toLocaleString()} products and counting.
            Buy once, download instantly as CSV.
          </p>
        </div>

        {/* Complete market report */}
        <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {REPORTS.market.label} &mdash; {REPORTS.market.display}
              </h2>
              <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                {REPORTS.market.blurb} All {ALL_BRANDS.length} brands, {totalProducts.toLocaleString()} products.
              </p>
            </div>
            <BuyReportButton
              report="market"
              target="all"
              label="All industries"
              price={REPORTS.market.display}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
            >
              Buy full report &mdash; {REPORTS.market.display}
            </BuyReportButton>
          </div>
        </div>

        {/* Per-industry reports */}
        <div className="mt-10">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">By industry</h2>
            <p className="text-sm text-muted-foreground">{REPORTS.industry.display} each</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {VERTICALS.map((v) => {
              const count = byVertical.get(v.label)?.total ?? 0;
              return (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 p-4 transition-colors hover:border-primary/20"
                >
                  <div>
                    <Link
                      href={`/industries/${slugify(v.label)}`}
                      className="text-sm font-semibold transition-colors hover:text-primary"
                    >
                      {v.label}
                    </Link>
                    <p className="text-[11px] text-muted-foreground">
                      {v.brands.length} brands &middot; {count.toLocaleString()} products
                    </p>
                  </div>
                  <BuyReportButton
                    report="industry"
                    target={slugify(v.label)}
                    label={v.label}
                    price={REPORTS.industry.display}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-60"
                  >
                    Buy &middot; {REPORTS.industry.display}
                  </BuyReportButton>
                </div>
              );
            })}
          </div>
        </div>

        {/* What's included */}
        <div className="mt-12 rounded-xl border border-border bg-muted/20 p-6">
          <h2 className="mb-4 text-sm font-semibold">What&apos;s in every report</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Brand & product counts", desc: "Every tracked brand with its live product count" },
              { title: "Price bands", desc: "From price, average price and highest price per brand" },
              { title: "Sale intensity", desc: "Share of catalogue currently discounted" },
              { title: "Top category & activity", desc: "Leading product type plus the latest tracked change" },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="text-xs font-semibold">{item.title}</h3>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold">Want live data instead of a snapshot?</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Track any Shopify store in real time with price alerts and product monitoring.
          </p>
          <Link
            href="/scraper"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:brightness-110"
          >
            Try ShopiSpy free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
