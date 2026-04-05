import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BrandIcon } from "@/components/marketing/BrandIcon";
import { VERTICALS } from "@/lib/brands";
import {
  getVerticalBySlug,
  getTopBrands,
  getVerticalStats,
  slugify,
  getProductCount,
  categoriseChange,
  getChangeTypeColor,
  getChangeTypeLabel,
  getAllVerticalSlugs,
  type ChangeType,
} from "@/lib/brandUtils";

export async function generateStaticParams() {
  return getAllVerticalSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vertical = getVerticalBySlug(slug);
  if (!vertical) return {};

  return {
    title: `Top ${vertical.label} Shopify Stores | ShopiSpy`,
    description: `Track the top 50 ${vertical.label.toLowerCase()} Shopify stores. Monitor products, pricing changes, and new launches across ${vertical.brands.length} brands.`,
    alternates: { canonical: `/industries/${slug}` },
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vertical = getVerticalBySlug(slug);

  if (!vertical) {
    notFound();
  }

  const stats = getVerticalStats(vertical);
  const topBrands = getTopBrands(vertical, 10);
  const allBrands = vertical.brands;

  // Product size distribution - top 10 brands for bar chart
  const maxProducts = Math.max(...topBrands.map(getProductCount));

  // Activity breakdown - categorise all brands
  const changeCounts: Record<string, number> = {};
  for (const brand of allBrands) {
    const type = categoriseChange(brand.latestChange);
    changeCounts[type] = (changeCounts[type] || 0) + 1;
  }

  const activityPills: { type: ChangeType; label: string; count: number; color: string }[] = (
    Object.entries(changeCounts) as [ChangeType, number][]
  )
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({
      type,
      label: getChangeTypeLabel(type),
      count,
      color: getChangeTypeColor(type),
    }));

  // Bar colors for the product size chart
  const barColors = [
    "bg-primary",
    "bg-primary/90",
    "bg-primary/80",
    "bg-primary/70",
    "bg-primary/60",
    "bg-primary/55",
    "bg-primary/50",
    "bg-primary/45",
    "bg-primary/40",
    "bg-primary/35",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted-foreground">
          <Link href="/industries" className="hover:text-foreground transition-colors">
            Industries
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{vertical.label}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {vertical.label}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Top {allBrands.length} {vertical.label} Shopify stores tracked by ShopiSpy
          </p>
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{allBrands.length} brands</span>
            <span className="text-border">|</span>
            <span>{stats.total.toLocaleString()} total products</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-5">
            <p className="text-sm font-medium text-muted-foreground">Total Products</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{stats.total.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-border bg-gradient-to-br from-blue-500/5 to-transparent p-5">
            <p className="text-sm font-medium text-muted-foreground">Avg per Store</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{stats.avg.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-border bg-gradient-to-br from-green-500/5 to-transparent p-5">
            <p className="text-sm font-medium text-muted-foreground">Recently Updated</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{stats.recentlyUpdated}</p>
          </div>
          <div className="rounded-xl border border-border bg-gradient-to-br from-amber-500/5 to-transparent p-5">
            <p className="text-sm font-medium text-muted-foreground">Brand Count</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{stats.brandCount}</p>
          </div>
        </div>

        {/* Activity Breakdown */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold tracking-tight">Activity Breakdown</h2>
          <div className="flex flex-wrap gap-3">
            {activityPills.map(({ type, label, count, color }) => (
              <span
                key={type}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${color}`}
              >
                <span className="text-lg">{count}</span>
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* Product Size Distribution */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-bold tracking-tight">Product Size Distribution</h2>
          <div className="rounded-xl border border-border p-6">
            <div className="space-y-3">
              {topBrands.map((brand, i) => {
                const count = getProductCount(brand);
                const pct = maxProducts > 0 ? (count / maxProducts) * 100 : 0;
                return (
                  <div key={brand.name} className="flex items-center gap-3">
                    <Link
                      href={`/brands/${slugify(brand.name)}`}
                      className="w-32 shrink-0 truncate text-sm font-medium hover:text-primary transition-colors"
                    >
                      {brand.name}
                    </Link>
                    <div className="relative flex-1 h-7 rounded-md bg-muted/50 overflow-hidden">
                      <div
                        className={`h-full rounded-md ${barColors[i] || "bg-primary/30"} transition-all duration-500`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums">
                      {brand.products}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Top 10 Brands */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-bold tracking-tight">
            Top 10 {vertical.label} Brands
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {topBrands.map((brand, i) => {
              const changeType = categoriseChange(brand.latestChange);
              const changeColor = getChangeTypeColor(changeType);
              const changeLabel = getChangeTypeLabel(changeType);
              const count = getProductCount(brand);
              const pct = maxProducts > 0 ? (count / maxProducts) * 100 : 0;

              return (
                <Link
                  key={brand.name}
                  href={`/brands/${slugify(brand.name)}`}
                  className="group rounded-xl border border-border p-5 transition-all hover:bg-muted/50 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      #{i + 1}
                    </span>
                    <BrandIcon name={brand.name} domain={brand.domain} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold group-hover:text-primary transition-colors">
                        {brand.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{brand.domain}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold tabular-nums">{brand.products}</p>
                      <p className="text-xs text-muted-foreground">{brand.lastUpdate} ago</p>
                    </div>
                  </div>

                  {/* Mini product bar */}
                  <div className="mt-3 h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/40"
                      style={{ width: `${Math.max(pct, 3)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${changeColor}`}
                    >
                      {changeLabel}
                    </span>
                    <p className="text-xs text-muted-foreground truncate max-w-[60%] text-right">
                      {brand.latestChange}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-bold tracking-tight">
            Why track {vertical.label} brands?
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-gradient-to-br from-red-500/5 to-transparent p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-lg">
                $
              </div>
              <h3 className="font-semibold">Monitor competitor pricing</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                See exactly when competitors drop or raise prices. React faster than the market and
                protect your margins with real-time pricing intelligence.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
                +
              </div>
              <h3 className="font-semibold">Spot new product launches first</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Get notified within hours when any brand in {vertical.label.toLowerCase()} launches
                new products. Understand trends before they go mainstream.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-gradient-to-br from-blue-500/5 to-transparent p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-lg">
                #
              </div>
              <h3 className="font-semibold">Benchmark your catalog size</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Compare your product count and assortment against the top {vertical.label.toLowerCase()} stores.
                Identify gaps in your catalog and opportunities to expand.
              </p>
            </div>
          </div>
        </section>

        {/* CTA - Track these stores */}
        <section className="mb-16 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-8 sm:p-10 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Track these stores on ShopiSpy
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Get real-time alerts when any of these {allBrands.length} brands change prices, launch
            products, or update their catalog. Free plan available.
          </p>
          <Link
            href="/scraper"
            className="mt-6 inline-block rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start Tracking for Free
          </Link>
        </section>

        {/* All Brands */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-bold tracking-tight">
            All {allBrands.length} Brands
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allBrands.map((brand) => {
              const changeType = categoriseChange(brand.latestChange);
              const changeColor = getChangeTypeColor(changeType);
              const changeLabel = getChangeTypeLabel(changeType);

              return (
                <Link
                  key={brand.name}
                  href={`/brands/${slugify(brand.name)}`}
                  className="group rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3">
                    <BrandIcon name={brand.name} domain={brand.domain} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium group-hover:text-primary transition-colors">
                        {brand.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{brand.domain}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold">{brand.products}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${changeColor}`}
                    >
                      {changeLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {brand.lastUpdate} ago
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
