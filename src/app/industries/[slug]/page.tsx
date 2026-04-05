import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-medium text-muted-foreground">Total Products</p>
            <p className="mt-1 text-2xl font-bold">{stats.total.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-medium text-muted-foreground">Avg per Store</p>
            <p className="mt-1 text-2xl font-bold">{stats.avg.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-medium text-muted-foreground">Recently Updated</p>
            <p className="mt-1 text-2xl font-bold">{stats.recentlyUpdated}</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-medium text-muted-foreground">Brand Count</p>
            <p className="mt-1 text-2xl font-bold">{stats.brandCount}</p>
          </div>
        </div>

        {/* Top 10 Brands */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-bold tracking-tight">
            Top 10 {vertical.label} Brands
          </h2>
          <div className="space-y-3">
            {topBrands.map((brand, i) => {
              const changeType = categoriseChange(brand.latestChange);
              const changeColor = getChangeTypeColor(changeType);
              const changeLabel = getChangeTypeLabel(changeType);

              return (
                <div
                  key={brand.name}
                  className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    #{i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/brands/${slugify(brand.name)}`}
                        className="truncate font-semibold hover:text-primary transition-colors"
                      >
                        {brand.name}
                      </Link>
                      <span className="hidden text-sm text-muted-foreground sm:inline">
                        {brand.domain}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {brand.latestChange}
                    </p>
                  </div>
                  <div className="hidden items-center gap-4 sm:flex">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${changeColor}`}
                    >
                      {changeLabel}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{brand.products}</p>
                    <p className="text-xs text-muted-foreground">{brand.lastUpdate} ago</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* All 50 Brands */}
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
                  className="rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{brand.name}</p>
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

        {/* CTA */}
        <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
          <h3 className="text-lg font-bold">Track these stores</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get instant alerts when {vertical.label.toLowerCase()} brands change prices,
            launch new products, or run sales.
          </p>
          <Link
            href="/scraper"
            className="mt-4 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start Tracking
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
