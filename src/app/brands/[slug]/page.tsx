import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  getBrandBySlug,
  getAllBrandSlugs,
  getRelatedBrands,
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
            className="mt-2 inline-block text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {brand.domain} &rarr;
          </a>
        </div>

        {/* Stats */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-medium text-muted-foreground">Products</p>
            <p className="mt-1 text-2xl font-bold">{brand.products}</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-medium text-muted-foreground">Last Update</p>
            <p className="mt-1 text-2xl font-bold">{brand.lastUpdate} ago</p>
          </div>
          <div className="col-span-2 rounded-xl border border-border p-4 sm:col-span-1">
            <p className="text-sm font-medium text-muted-foreground">Latest Change</p>
            <div className="mt-1 flex items-center gap-2">
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

        {/* Related Brands */}
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
                  className="rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{rel.name}</p>
                      <p className="text-xs text-muted-foreground">{rel.domain}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold">{rel.products}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
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
        <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
          <h3 className="text-lg font-bold">Track {brand.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get instant alerts when {brand.name} changes prices, launches new products, or
            runs sales.
          </p>
          <Link
            href={`/scraper?site=${brand.domain}`}
            className="mt-4 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Track {brand.name}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
