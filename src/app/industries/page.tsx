import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VERTICALS } from "@/lib/brands";
import { slugify, getVerticalStats, getTopBrands } from "@/lib/brandUtils";

export const metadata: Metadata = {
  title: "Industries | ShopiSpy",
  description:
    "Browse Shopify stores by industry. Track products, prices, and launches across fashion, beauty, food, electronics, and more.",
  alternates: { canonical: "/industries" },
};

export default function IndustriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Industries</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Browse {VERTICALS.length} industries with{" "}
            {VERTICALS.reduce((sum, v) => sum + v.brands.length, 0)} tracked Shopify stores
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VERTICALS.map((vertical) => {
            const stats = getVerticalStats(vertical);
            const top3 = getTopBrands(vertical, 3);

            return (
              <Link
                key={vertical.id}
                href={`/industries/${slugify(vertical.label)}`}
                className="group rounded-xl border border-border p-5 transition-colors hover:bg-muted/50"
              >
                <h2 className="font-semibold group-hover:text-primary transition-colors">
                  {vertical.label}
                </h2>
                <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{vertical.brands.length} brands</span>
                  <span className="text-border">|</span>
                  <span>{stats.total.toLocaleString()} products</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {top3.map((brand) => (
                    <span
                      key={brand.name}
                      className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {brand.name}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
