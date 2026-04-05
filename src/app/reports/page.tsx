import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VERTICALS, ALL_BRANDS, TOTAL_PRODUCTS } from "@/lib/brands";
import { getVerticalStats, slugify } from "@/lib/brandUtils";
import { Download, FileSpreadsheet, FileJson, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Industry Benchmark Reports",
  description:
    "Download free Shopify industry benchmark reports. Product counts, pricing data, and competitive intelligence across 11 industries and 550+ brands.",
  alternates: { canonical: "/reports" },
};

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Free downloads</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Industry Benchmark Reports
          </h1>
          <p className="mt-3 mx-auto max-w-xl text-muted-foreground">
            Download competitive intelligence data across {ALL_BRANDS.length} Shopify brands
            and {VERTICALS.length} industries. Updated continuously.
          </p>
        </div>

        {/* Full report */}
        <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Complete Market Report</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                All {ALL_BRANDS.length} brands across {VERTICALS.length} industries.{" "}
                {TOTAL_PRODUCTS.toLocaleString()} products tracked.
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="/api/reports?format=csv"
                download
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                <FileSpreadsheet className="h-4 w-4" /> CSV
              </a>
              <a
                href="/api/reports?format=json"
                download
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                <FileJson className="h-4 w-4" /> JSON
              </a>
            </div>
          </div>
        </div>

        {/* Per-industry reports */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-6">By industry</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {VERTICALS.map((v) => {
              const stats = getVerticalStats(v);
              return (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 p-4 transition-colors hover:border-primary/20"
                >
                  <div>
                    <Link
                      href={`/industries/${slugify(v.label)}`}
                      className="text-sm font-semibold hover:text-primary transition-colors"
                    >
                      {v.label}
                    </Link>
                    <p className="text-[10px] text-muted-foreground">
                      {v.brands.length} brands &middot; {stats.total.toLocaleString()} products
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <a
                      href={`/api/reports?vertical=${v.id}&format=csv`}
                      download
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[10px] font-medium transition-colors hover:bg-muted"
                      title={`Download ${v.label} CSV`}
                    >
                      <Download className="h-3 w-3" /> CSV
                    </a>
                    <a
                      href={`/api/reports?vertical=${v.id}&format=json`}
                      download
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[10px] font-medium transition-colors hover:bg-muted"
                      title={`Download ${v.label} JSON`}
                    >
                      <Download className="h-3 w-3" /> JSON
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* What's included */}
        <div className="mt-12 rounded-xl border border-border bg-muted/20 p-6">
          <h2 className="text-sm font-semibold mb-4">What&apos;s included in each report</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Brand directory", desc: "Every tracked brand with domain and industry" },
              { title: "Product counts", desc: "Total products per store, updated continuously" },
              { title: "Activity data", desc: "Latest changes: price drops, new products, restocks" },
              { title: "Change classification", desc: "Each change categorised by type for analysis" },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="text-xs font-semibold">{item.title}</h3>
                <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold">Want live data instead of snapshots?</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Track any Shopify store in real-time with price alerts and product monitoring.
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
