import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VERTICALS, ALL_BRANDS, TOTAL_PRODUCTS } from "@/lib/brands";
import { getVerticalStats, categoriseChange, getChangeTypeColor, getChangeTypeLabel, slugify, getProductCount } from "@/lib/brandUtils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Live Market Intelligence",
  description:
    "Real-time Shopify market intelligence across 550+ brands and 11 industries. Track price changes, new product launches, and competitive movements.",
  alternates: { canonical: "/market" },
};

export default function MarketPage() {
  // Aggregate stats
  const totalBrands = ALL_BRANDS.length;
  const recentChanges = ALL_BRANDS.filter(
    (b) => b.lastUpdate.includes("1h") || b.lastUpdate.includes("2h")
  ).length;
  const priceDrops = ALL_BRANDS.filter((b) => {
    const lower = b.latestChange.toLowerCase();
    return lower.includes("-%") || lower.includes("price drop") || lower.includes("reduced") || lower.includes("clearance");
  }).length;
  const newProducts = ALL_BRANDS.filter((b) => {
    const lower = b.latestChange.toLowerCase();
    return lower.includes("new") || lower.includes("launch") || lower.includes("added");
  }).length;

  // Recent activity feed — brands updated in last 3h
  const recentActivity = ALL_BRANDS
    .filter((b) => ["1h", "2h", "3h"].some((t) => b.lastUpdate.includes(t)))
    .slice(0, 20);

  // Top brands by size
  const topBySize = [...ALL_BRANDS].sort((a, b) => getProductCount(b) - getProductCount(a)).slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Live intelligence</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Shopify Market Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Real-time competitive intelligence across {totalBrands} brands and {VERTICALS.length} industries.
          </p>
        </div>

        {/* Global stats */}
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { value: totalBrands.toLocaleString(), label: "Brands tracked" },
            { value: TOTAL_PRODUCTS.toLocaleString(), label: "Products monitored" },
            { value: String(recentChanges), label: "Changes (last 2h)" },
            { value: String(priceDrops), label: "Price drops active" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr,1fr]">
          {/* Left: Activity feed */}
          <div>
            <h2 className="text-sm font-semibold mb-4">Recent activity</h2>
            <div className="space-y-2">
              {recentActivity.map((brand) => {
                const changeType = categoriseChange(brand.latestChange);
                return (
                  <Link
                    key={brand.name}
                    href={`/brands/${slugify(brand.name)}`}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-background p-3 transition-colors hover:border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/40 text-xs font-bold text-primary">
                        {brand.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{brand.name}</p>
                        <p className="text-[10px] text-muted-foreground">{brand.latestChange}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getChangeTypeColor(changeType)}`}>
                        {getChangeTypeLabel(changeType)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{brand.lastUpdate}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Industry breakdown + top brands */}
          <div className="space-y-8">
            {/* Industry breakdown */}
            <div>
              <h2 className="text-sm font-semibold mb-4">By industry</h2>
              <div className="space-y-2">
                {VERTICALS.map((v) => {
                  const stats = getVerticalStats(v);
                  return (
                    <Link
                      key={v.id}
                      href={`/industries/${slugify(v.label)}`}
                      className="flex items-center justify-between rounded-xl border border-border/60 p-3 transition-colors hover:border-primary/20"
                    >
                      <div>
                        <p className="text-sm font-medium">{v.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {v.brands.length} brands &middot; {stats.total.toLocaleString()} products
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{stats.recentlyUpdated}</p>
                        <p className="text-[10px] text-muted-foreground">active now</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Largest stores */}
            <div>
              <h2 className="text-sm font-semibold mb-4">Largest stores tracked</h2>
              <div className="space-y-1.5">
                {topBySize.map((brand, i) => (
                  <Link
                    key={brand.name}
                    href={`/brands/${slugify(brand.name)}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/30"
                  >
                    <span className="w-5 text-right text-xs font-mono text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium flex-1">{brand.name}</span>
                    <span className="text-xs text-muted-foreground">{brand.products} products</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-border bg-muted/20 p-8 text-center">
          <h3 className="text-xl font-bold">Want to track your own competitors?</h3>
          <p className="mt-2 text-muted-foreground">
            Enter any Shopify store URL and get instant product data, price alerts, and competitive insights.
          </p>
          <Link
            href="/scraper"
            className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:brightness-110"
          >
            Try it free
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
