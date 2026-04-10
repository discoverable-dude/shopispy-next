import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BrandIcon } from "@/components/marketing/BrandIcon";
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
import { fetchStatsForDomains, enrichBrand } from "@/lib/brandStats";

// Revalidate every hour so live stats stay fresh without a full rebuild.
export const revalidate = 3600;

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
    description: `Track ${brand.name} (${brand.domain}) on ShopiSpy. Monitor their catalog, get price alerts, and discover new product launches in real time.`,
    alternates: { canonical: `/brands/${slug}` },
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const staticBrand = getBrandBySlug(slug);

  if (!staticBrand) {
    notFound();
  }

  // Fetch live stats for the current brand + all brands in its vertical
  // (needed for verticalStats calculation + related brand cards).
  const allVerticalDomains = staticBrand.vertical.brands.map((b) => b.domain);
  const statsMap = await fetchStatsForDomains(allVerticalDomains);

  // Enrich the brand with live data
  const brand = { ...enrichBrand(staticBrand, statsMap), vertical: {
    ...staticBrand.vertical,
    brands: staticBrand.vertical.brands.map((b) => enrichBrand(b, statsMap)),
  }};

  const changeType = categoriseChange(brand.latestChange);
  const changeColor = getChangeTypeColor(changeType);
  const changeLabel = getChangeTypeLabel(changeType);
  const related = getRelatedBrands(brand, brand.vertical, 6);
  const verticalStats = getVerticalStats(brand.vertical);
  const productCount = getProductCount(brand);

  // Industry context bar calculations
  const barMax = verticalStats.max;
  const brandPct = barMax > 0 ? Math.round((productCount / barMax) * 100) : 0;
  const avgPct = barMax > 0 ? Math.round((verticalStats.avg / barMax) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-dot-pattern mask-fade-b" />
          <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6 sm:pt-32">
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

            <FadeInView>
              <div className="flex flex-wrap items-center gap-5">
                <BrandIcon name={brand.name} domain={brand.domain} size="lg" />
                <div>
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    {brand.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <a
                      href={`https://${brand.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {brand.domain} &rarr;
                    </a>
                    <Link href={`/industries/${slugify(brand.vertical.label)}`}>
                      <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/60">
                        {brand.vertical.label}
                      </Badge>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="h-12 rounded-xl gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:brightness-110">
                  <Link href={`/scraper?site=${brand.domain}`}>
                    Track {brand.name}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 rounded-xl">
                  <Link href="/compare">
                    Compare
                  </Link>
                </Button>
              </div>
            </FadeInView>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          {/* ── Stats Row ── */}
          <FadeInView>
            <section className="mb-16">
              <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <StaggerItem>
                  <Card className="bg-gradient-to-br from-primary/5 to-transparent">
                    <CardContent className="p-5">
                      <p className="text-sm font-medium text-muted-foreground">Products</p>
                      <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">{brand.products}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
                <StaggerItem>
                  <Card className="bg-gradient-to-br from-blue-500/5 to-transparent">
                    <CardContent className="p-5">
                      <p className="text-sm font-medium text-muted-foreground">Last Update</p>
                      <p className="mt-1 text-3xl font-bold tracking-tight">{brand.lastUpdate} ago</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
                <StaggerItem>
                  <Card className="col-span-2 bg-gradient-to-br from-amber-500/5 to-transparent sm:col-span-1">
                    <CardContent className="p-5">
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <div className="mt-2">
                        <Badge
                          variant="secondary"
                          className={`${changeColor}`}
                        >
                          {changeLabel}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              </StaggerContainer>
            </section>
          </FadeInView>

          {/* ── Why Track This Brand ── */}
          <FadeInView>
            <section className="mb-16">
              <h2 className="mb-4 text-xl font-bold tracking-tight">
                Why track {brand.name}?
              </h2>
              <Card className="bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    With <strong className="text-foreground">{brand.products}</strong> products in their catalog,{" "}
                    <strong className="text-foreground">{brand.name}</strong> is{" "}
                    {productCount >= verticalStats.avg
                      ? "one of the larger"
                      : "a focused"}{" "}
                    stores in {brand.vertical.label}. Tracking them means you&apos;ll know the moment they change a price, launch a product, or run a promotion — giving you hours or days of lead time to react.
                  </p>
                  <Separator className="my-4" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-background/50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {brand.name} vs {brand.vertical.label} average
                      </p>
                      <p className="mt-2 text-lg font-bold tabular-nums">
                        {brand.products}{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          vs {verticalStats.avg.toLocaleString()} products
                        </span>
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-background/50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Last activity
                      </p>
                      <p className="mt-2 text-lg font-bold tabular-nums">
                        {brand.lastUpdate} ago
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {brand.latestChange}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </FadeInView>

          {/* ── What You'll Get ── */}
          <FadeInView>
            <section className="mb-16">
              <h2 className="mb-2 text-xl font-bold tracking-tight">
                What you&apos;ll get
              </h2>
              <p className="mb-6 text-muted-foreground">
                Start tracking {brand.name} and unlock these capabilities instantly.
              </p>
              <StaggerContainer className="grid gap-4 sm:grid-cols-3">
                <StaggerItem>
                  <Card className="h-full bg-gradient-to-br from-red-500/5 to-transparent">
                    <CardContent className="p-6">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-lg font-bold text-red-600">
                        $
                      </div>
                      <h3 className="font-semibold">Price monitoring</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        Get alerted when {brand.name} changes prices on any of their {brand.products} products.
                        Never miss a price drop or increase again.
                      </p>
                    </CardContent>
                  </Card>
                </StaggerItem>
                <StaggerItem>
                  <Card className="h-full bg-gradient-to-br from-primary/5 to-transparent">
                    <CardContent className="p-6">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                        +
                      </div>
                      <h3 className="font-semibold">New product detection</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        Know within hours when {brand.name} adds new items. Stay ahead of
                        their product strategy and launches.
                      </p>
                    </CardContent>
                  </Card>
                </StaggerItem>
                <StaggerItem>
                  <Card className="h-full bg-gradient-to-br from-blue-500/5 to-transparent">
                    <CardContent className="p-6">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-lg font-bold text-blue-600">
                        &darr;
                      </div>
                      <h3 className="font-semibold">Full catalog export</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        Download {brand.name}&apos;s complete {brand.products}-product catalog as CSV, Excel, or JSON.
                        Perfect for analysis and competitive research.
                      </p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              </StaggerContainer>
            </section>
          </FadeInView>

          {/* ── Industry Context ── */}
          <FadeInView>
            <section className="mb-16">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Industry Context</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                    <span className="font-semibold text-foreground">{brand.name}</span> has{" "}
                    <span className="font-semibold text-foreground">{brand.products}</span> products.
                    The average in {brand.vertical.label} is{" "}
                    <span className="font-semibold text-foreground">{verticalStats.avg.toLocaleString()}</span>.
                    The largest catalog has{" "}
                    <span className="font-semibold text-foreground">{verticalStats.max.toLocaleString()}</span>.
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{brand.name}</span>
                        <span className="font-semibold tabular-nums">{brand.products}</span>
                      </div>
                      <Progress value={brandPct} className="h-3" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Average ({brand.vertical.label})</span>
                        <span className="tabular-nums text-muted-foreground">{verticalStats.avg.toLocaleString()}</span>
                      </div>
                      <Progress value={avgPct} className="h-3 [&>div]:bg-muted-foreground/30" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Maximum</span>
                        <span className="tabular-nums text-muted-foreground">{verticalStats.max.toLocaleString()}</span>
                      </div>
                      <Progress value={100} className="h-3 [&>div]:bg-muted-foreground/20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </FadeInView>

          {/* ── Recent Activity ── */}
          <FadeInView>
            <section className="mb-16">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                    </span>
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <Badge
                      variant="secondary"
                      className={`mt-0.5 shrink-0 ${changeColor}`}
                    >
                      {changeLabel}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{brand.latestChange}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {brand.lastUpdate} ago
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </FadeInView>

          {/* ── Related Brands ── */}
          <FadeInView>
            <section className="mb-16">
              <h2 className="mb-6 text-xl font-bold tracking-tight">
                Related {brand.vertical.label} Brands
              </h2>
              <StaggerContainer className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((rel) => {
                  const relChangeType = categoriseChange(rel.latestChange);
                  const relChangeColor = getChangeTypeColor(relChangeType);
                  const relChangeLabel = getChangeTypeLabel(relChangeType);

                  return (
                    <StaggerItem key={rel.name}>
                      <Link
                        href={`/brands/${slugify(rel.name)}`}
                        className="group block"
                      >
                        <Card className="transition-all hover:bg-muted/50 hover:shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <BrandIcon name={rel.name} domain={rel.domain} size="md" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium group-hover:text-primary transition-colors">
                                  {rel.name}
                                </p>
                                <p className="text-xs text-muted-foreground">{rel.domain}</p>
                              </div>
                              <p className="shrink-0 text-sm font-semibold tabular-nums">{rel.products}</p>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <Badge
                                variant="secondary"
                                className={`text-[10px] ${relChangeColor}`}
                              >
                                {relChangeLabel}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {rel.lastUpdate} ago
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </section>
          </FadeInView>

          {/* ── CTA with plus-icon corners ── */}
          <FadeInView>
            <section className="mb-16">
              <div className="relative border-y border-border">
                <svg className="absolute -top-3 -left-3 h-6 w-6 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <svg className="absolute -top-3 -right-3 h-6 w-6 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <svg className="absolute -bottom-3 -left-3 h-6 w-6 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <svg className="absolute -bottom-3 -right-3 h-6 w-6 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path d="M12 5v14M5 12h14" />
                </svg>

                <div className="absolute inset-y-0 left-1/2 -translate-x-px border-l border-dashed border-border" />

                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(35% 80% at 25% 0%, hsl(var(--foreground) / .06), transparent)",
                  }}
                />

                <div className="relative px-8 py-16 text-center sm:px-16">
                  <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Track {brand.name} for free
                  </h3>
                  <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                    Get instant alerts when {brand.name} changes prices, launches new products, or
                    runs sales. Monitor all {brand.products} products in real time.
                  </p>
                  <div className="mt-8">
                    <Button asChild size="lg" className="h-12 rounded-xl gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:brightness-110">
                      <Link href={`/scraper?site=${brand.domain}`}>
                        Track {brand.name} for Free
                      </Link>
                    </Button>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                    <span>No credit card required</span>
                    <span className="hidden sm:inline">&middot;</span>
                    <span>Free plan forever</span>
                    <span className="hidden sm:inline">&middot;</span>
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </section>
          </FadeInView>
        </div>
      </main>
      <Footer />
    </div>
  );
}
