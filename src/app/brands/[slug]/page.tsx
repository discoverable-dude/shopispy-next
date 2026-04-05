import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BrandIcon } from "@/components/marketing/BrandIcon";
import {
  getBrandBySlug,
  getAllBrandSlugs,
  getRelatedBrands,
  getVerticalStats,
  slugify,
  getProductCount,
  categoriseChange,
  getChangeTypeColor,
  getChangeTypeLabel,
} from "@/lib/brandUtils";

export async function generateStaticParams() {
  return getAllBrandSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) return {};

  return {
    title: `${brand.name} Shopify Store Tracker | ShopiSpy`,
    description: `Track ${brand.name} (${brand.domain}) on ShopiSpy. Monitor ${brand.products} products, get price alerts, and discover new product launches.`,
    alternates: { canonical: `/brands/${slug}` },
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);

  if (!brand) {
    notFound();
  }

  const changeType = categoriseChange(brand.latestChange);
  const changeColor = getChangeTypeColor(changeType);
  const changeLabel = getChangeTypeLabel(changeType);
  const related = getRelatedBrands(brand, brand.vertical, 6);
  const verticalStats = getVerticalStats(brand.vertical);
  const productCount = getProductCount(brand);

  // Industry context bar calculations
  const barMax = verticalStats.max;
  const brandPct = barMax > 0 ? (productCount / barMax) * 100 : 0;
  const avgPct = barMax > 0 ? (verticalStats.avg / barMax) * 100 : 0;

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
          <Link
            href={`/industries/${slugify(brand.vertical.label)}`}
            className="hover:text-foreground transition-colors"
          >
            {brand.vertical.label}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{brand.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-4">
            <BrandIcon name={brand.name} domain={brand.domain} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {brand.name}
                </h1>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {brand.vertical.label}
                </span>
              </div>
              <a
                href={`https://${brand.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {brand.domain} &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                #
              </span>
              <p className="text-sm font-medium text-muted-foreground">Products</p>
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight">{brand.products}</p>
          </div>
          <div className="rounded-xl border border-border bg-gradient-to-br from-blue-500/5 to-transparent p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-sm font-bold text-blue-600">
                ~
              </span>
              <p className="text-sm font-medium text-muted-foreground">Last Update</p>
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight">{brand.lastUpdate} ago</p>
          </div>
          <div className="col-span-2 rounded-xl border border-border bg-gradient-to-br from-amber-500/5 to-transparent p-5 sm:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-sm font-bold text-amber-600">
                !
              </span>
              <p className="text-sm font-medium text-muted-foreground">Latest Change</p>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${changeColor}`}>
                {changeLabel}
              </span>
            </div>
          </div>
        </div>

        {/* About */}
        <section className="mb-10 rounded-xl border border-border p-6">
          <h2 className="text-sm font-medium text-muted-foreground">About</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Track {brand.name} on ShopiSpy to monitor their {brand.products} products, get
            price alerts, and discover new product launches.
          </p>
        </section>

        {/* Recent Activity */}
        <section className="mb-10 rounded-xl border border-border p-6">
          <h2 className="text-sm font-medium text-muted-foreground">Recent Activity</h2>
          <div className="mt-3 flex items-start gap-3">
            <span className={`mt-0.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${changeColor}`}>
              {changeLabel}
            </span>
            <div>
              <p className="text-sm font-medium">{brand.latestChange}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {brand.lastUpdate} ago
              </p>
            </div>
          </div>
        </section>

        {/* Industry Context */}
        <section className="mb-10 rounded-xl border border-border p-6">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">
            Industry Context
          </h2>
          <p className="text-sm leading-relaxed mb-5">
            {brand.name} has <span className="font-semibold">{brand.products}</span> products.
            The average in {brand.vertical.label} is{" "}
            <span className="font-semibold">{verticalStats.avg.toLocaleString()}</span>.
          </p>
          <div className="space-y-3">
            {/* Brand bar */}
            <div className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs font-medium text-right">{brand.name}</span>
              <div className="relative flex-1 h-6 rounded-md bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-md bg-primary transition-all duration-500"
                  style={{ width: `${Math.max(brandPct, 2)}%` }}
                />
              </div>
              <span className="w-14 shrink-0 text-right text-xs font-semibold tabular-nums">
                {brand.products}
              </span>
            </div>
            {/* Average bar */}
            <div className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs font-medium text-right text-muted-foreground">
                Avg
              </span>
              <div className="relative flex-1 h-6 rounded-md bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-md bg-muted-foreground/30 transition-all duration-500"
                  style={{ width: `${Math.max(avgPct, 2)}%` }}
                />
              </div>
              <span className="w-14 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {verticalStats.avg.toLocaleString()}
              </span>
            </div>
            {/* Max bar */}
            <div className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs font-medium text-right text-muted-foreground">
                Max
              </span>
              <div className="relative flex-1 h-6 rounded-md bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-md bg-muted-foreground/20 transition-all duration-500"
                  style={{ width: "100%" }}
                />
              </div>
              <span className="w-14 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {verticalStats.max.toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        {/* How ShopiSpy tracks this brand */}
        <section className="mb-10">
          <h2 className="mb-6 text-xl font-bold tracking-tight">
            How ShopiSpy tracks {brand.name}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-gradient-to-br from-red-500/5 to-transparent p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-lg font-bold text-red-600">
                $
              </div>
              <h3 className="font-semibold">Price monitoring</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Get alerted when {brand.name} changes prices on any of their {brand.products} products.
                Never miss a price drop or increase again.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                +
              </div>
              <h3 className="font-semibold">New product detection</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Know within hours when {brand.name} adds new items to their catalog. Stay ahead of
                their product strategy and launches.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-gradient-to-br from-blue-500/5 to-transparent p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-lg font-bold text-blue-600">
                &darr;
              </div>
              <h3 className="font-semibold">Full catalog export</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Download {brand.name}&apos;s complete product data as CSV, Excel, or JSON. Perfect
                for analysis, reporting, and competitive research.
              </p>
            </div>
          </div>
        </section>

        {/* Enhanced Related Brands */}
        <section className="mb-16">
          <h2 className="mb-4 text-lg font-bold tracking-tight">
            Related {brand.vertical.label} Brands
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rel) => {
              const relChangeType = categoriseChange(rel.latestChange);
              const relChangeColor = getChangeTypeColor(relChangeType);
              const relChangeLabel = getChangeTypeLabel(relChangeType);

              return (
                <Link
                  key={rel.name}
                  href={`/brands/${slugify(rel.name)}`}
                  className="group rounded-xl border border-border p-4 transition-all hover:bg-muted/50 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <BrandIcon name={rel.name} domain={rel.domain} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium group-hover:text-primary transition-colors">
                        {rel.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{rel.domain}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold">{rel.products}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${relChangeColor}`}
                    >
                      {relChangeLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {rel.lastUpdate} ago
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-8 sm:p-10 text-center">
          <h3 className="text-2xl font-bold tracking-tight">Track {brand.name}</h3>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Get instant alerts when {brand.name} changes prices, launches new products, or
            runs sales. Monitor all {brand.products} products in real time. Free plan available.
          </p>
          <Link
            href={`/scraper?site=${brand.domain}`}
            className="mt-6 inline-block rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Track {brand.name}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
