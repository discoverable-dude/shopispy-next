import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BrandIcon } from "@/components/marketing/BrandIcon";
import { VERTICALS, ALL_BRANDS, TOTAL_PRODUCTS } from "@/lib/brands";
import { getVerticalStats, categoriseChange, getChangeTypeColor, getChangeTypeLabel, slugify, getProductCount, type ChangeType } from "@/lib/brandUtils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Live Market Intelligence",
  description:
    "Real-time Shopify market intelligence across 550+ brands and 11 industries. Track price changes, new product launches, and competitive movements.",
  alternates: { canonical: "/market" },
};

export default function MarketPage() {
  const totalBrands = ALL_BRANDS.length;
  const recentChanges = ALL_BRANDS.filter(
    (b) => ["1h", "2h"].some((t) => b.lastUpdate.includes(t))
  ).length;

  // Activity breakdown
  const changeBreakdown: Record<ChangeType, number> = {
    price_drop: 0, price_increase: 0, new_products: 0, restock: 0, sale: 0, other: 0,
  };
  ALL_BRANDS.forEach((b) => {
    changeBreakdown[categoriseChange(b.latestChange)]++;
  });
  const totalChanges = Object.values(changeBreakdown).reduce((a, b) => a + b, 0);

  // Recent activity
  const recentActivity = ALL_BRANDS
    .filter((b) => ["1h", "2h", "3h"].some((t) => b.lastUpdate.includes(t)))
    .slice(0, 15);

  // Top by size
  const topBySize = [...ALL_BRANDS].sort((a, b) => getProductCount(b) - getProductCount(a)).slice(0, 12);
  const maxProducts = getProductCount(topBySize[0]);

  // Industry chart data
  const industryData = VERTICALS.map((v) => {
    const stats = getVerticalStats(v);
    return { ...v, ...stats };
  }).sort((a, b) => b.total - a.total);
  const maxIndustryProducts = industryData[0]?.total || 1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">Live intelligence</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Shopify Market Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Real-time data across {totalBrands} brands and {VERTICALS.length} industries.
            </p>
          </div>
          <Link
            href="/scraper"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:brightness-110"
          >
            Track your competitors <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { value: totalBrands.toLocaleString(), label: "Brands tracked", sub: `across ${VERTICALS.length} industries` },
            { value: TOTAL_PRODUCTS.toLocaleString(), label: "Products monitored", sub: "updated continuously" },
            { value: String(recentChanges), label: "Changes (2h)", sub: "price + product updates" },
            { value: `${changeBreakdown.price_drop}`, label: "Price drops", sub: "active right now" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border p-4">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium">{s.label}</p>
              <p className="text-[10px] text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Activity type breakdown — visual bar */}
        <div className="mt-8 rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold mb-4">Activity breakdown</h2>
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
            {(Object.entries(changeBreakdown) as [ChangeType, number][])
              .filter(([, count]) => count > 0)
              .map(([type, count]) => (
                <div
                  key={type}
                  className={`h-full transition-all ${
                    type === "new_products" ? "bg-primary" :
                    type === "price_drop" ? "bg-red-500" :
                    type === "price_increase" ? "bg-amber-500" :
                    type === "restock" ? "bg-blue-500" :
                    type === "sale" ? "bg-orange-500" :
                    "bg-muted-foreground/30"
                  }`}
                  style={{ width: `${(count / totalChanges) * 100}%` }}
                  title={`${getChangeTypeLabel(type)}: ${count}`}
                />
              ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {(Object.entries(changeBreakdown) as [ChangeType, number][])
              .filter(([, count]) => count > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <span key={type} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${getChangeTypeColor(type)}`}>
                  {getChangeTypeLabel(type)}: {count}
                </span>
              ))}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,1fr]">
          {/* Left: Activity feed */}
          <div>
            <h2 className="text-sm font-semibold mb-4">Recent activity</h2>
            <div className="space-y-1.5">
              {recentActivity.map((brand) => {
                const changeType = categoriseChange(brand.latestChange);
                return (
                  <Link
                    key={brand.name}
                    href={`/brands/${slugify(brand.name)}`}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-background p-3 transition-colors hover:border-primary/20"
                  >
                    <div className="flex items-center gap-2.5">
                      <BrandIcon name={brand.name} domain={brand.domain} size="sm" />
                      <div>
                        <p className="text-sm font-medium">{brand.name}</p>
                        <p className="text-[10px] text-muted-foreground">{brand.latestChange}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${getChangeTypeColor(changeType)}`}>
                        {getChangeTypeLabel(changeType)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{brand.lastUpdate}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Charts */}
          <div className="space-y-8">
            {/* Industry size chart */}
            <div>
              <h2 className="text-sm font-semibold mb-4">Products by industry</h2>
              <div className="space-y-2">
                {industryData.map((v) => (
                  <Link
                    key={v.id}
                    href={`/industries/${slugify(v.label)}`}
                    className="group flex items-center gap-3"
                  >
                    <span className="w-28 shrink-0 truncate text-xs font-medium group-hover:text-primary transition-colors">
                      {v.label}
                    </span>
                    <div className="flex-1 h-5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70 group-hover:bg-primary transition-colors"
                        style={{ width: `${(v.total / maxIndustryProducts) * 100}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-[10px] text-muted-foreground">
                      {v.total.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Largest stores */}
            <div>
              <h2 className="text-sm font-semibold mb-4">Largest stores</h2>
              <div className="space-y-1.5">
                {topBySize.map((brand, i) => {
                  const count = getProductCount(brand);
                  return (
                    <Link
                      key={brand.name}
                      href={`/brands/${slugify(brand.name)}`}
                      className="group flex items-center gap-3"
                    >
                      <span className="w-5 text-right text-[10px] font-mono text-muted-foreground">{i + 1}</span>
                      <BrandIcon name={brand.name} domain={brand.domain} size="sm" />
                      <span className="w-32 shrink-0 truncate text-xs font-medium group-hover:text-primary transition-colors">{brand.name}</span>
                      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent/70 group-hover:bg-accent transition-colors"
                          style={{ width: `${(count / maxProducts) * 100}%` }}
                        />
                      </div>
                      <span className="w-14 text-right text-[10px] text-muted-foreground">{brand.products}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Use cases */}
        <div className="mt-16">
          <h2 className="text-center text-2xl font-bold tracking-tight">Who uses market intelligence?</h2>
          <p className="mt-2 text-center text-muted-foreground">ShopiSpy powers competitive strategy for every type of ecommerce team.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Brand Owners", desc: "Monitor competitor pricing and react in real-time to stay competitive in your market." },
              { title: "eCommerce Managers", desc: "Track product launches across your category and benchmark your catalog against rivals." },
              { title: "Marketing Teams", desc: "Spot competitor promotions and sales before they impact your campaigns." },
              { title: "Agencies", desc: "Provide clients with competitive intelligence reports across multiple industries." },
            ].map((uc) => (
              <div key={uc.title} className="rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold">{uc.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-border bg-muted/20 p-8 text-center">
          <h3 className="text-xl font-bold">Start tracking your competitors</h3>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
            Enter any Shopify store URL and get instant product data, price alerts, and competitive insights. Free plan available.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/scraper"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20"
            >
              Try it free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/compare"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Compare brands
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
