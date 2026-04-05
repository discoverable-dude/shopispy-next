import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BrandIcon } from "@/components/marketing/BrandIcon";
import { IndustryStatsClient } from "@/components/marketing/IndustryStatsClient";
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
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

  const maxProducts = Math.max(...topBrands.map(getProductCount));

  // Activity breakdown
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

  const statsData = [
    { label: "Total Products", value: stats.total, formatted: stats.total.toLocaleString(), gradient: "from-primary/5" },
    { label: "Avg per Store", value: stats.avg, formatted: stats.avg.toLocaleString(), gradient: "from-blue-500/5" },
    { label: "Recently Active", value: stats.recentlyUpdated, formatted: stats.recentlyUpdated.toString(), gradient: "from-green-500/5" },
    { label: "Brand Count", value: stats.brandCount, formatted: stats.brandCount.toString(), gradient: "from-amber-500/5" },
  ];

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
              <span className="text-foreground">{vertical.label}</span>
            </nav>

            <FadeInView>
              <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Live data
              </Badge>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {vertical.label} Intelligence
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                Track {allBrands.length} brands and {stats.total.toLocaleString()} products across the {vertical.label.toLowerCase()} vertical. Real-time pricing, launches, and catalog changes.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="h-12 rounded-xl gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:brightness-110">
                  <Link href="/scraper">
                    Track these stores
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 rounded-xl">
                  <Link href={`/industries/${slug}#all-brands`}>
                    Download report
                  </Link>
                </Button>
              </div>
            </FadeInView>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          {/* ── Stats Row (animated) ── */}
          <section className="mb-16">
            <IndustryStatsClient stats={statsData} />
          </section>

          {/* ── Why Track Competitors ── */}
          <FadeInView>
            <section className="mb-16">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h2 className="mb-4 text-xl font-bold tracking-tight">
                    Why track {vertical.label} competitors?
                  </h2>
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    The {vertical.label} market on Shopify is one of the most competitive. With{" "}
                    <strong className="text-foreground">{stats.brandCount} brands</strong> actively
                    updating their catalogs, prices shift daily and new products launch weekly.
                    Without intelligence, you&apos;re flying blind.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>Know when competitors drop prices before your customers do</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>Discover new product launches within hours of going live</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>Benchmark your catalog size and pricing against the top performers</span>
                    </li>
                  </ul>
                </div>
                <div className="flex items-center">
                  <Card className="w-full bg-gradient-to-br from-green-500/5 to-transparent">
                    <CardContent className="p-6 text-center">
                      <p className="text-4xl font-bold tracking-tight text-foreground">
                        {stats.recentlyUpdated}
                      </p>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">
                        brands updated in the last 3 hours
                      </p>
                      <Separator className="my-4" />
                      <p className="mb-3 text-sm text-muted-foreground">
                        That&apos;s{" "}
                        <strong className="text-foreground">
                          {stats.brandCount > 0
                            ? Math.round((stats.recentlyUpdated / stats.brandCount) * 100)
                            : 0}
                          %
                        </strong>{" "}
                        of all {vertical.label} brands we track
                      </p>
                      <Progress
                        value={
                          stats.brandCount > 0
                            ? Math.round((stats.recentlyUpdated / stats.brandCount) * 100)
                            : 0
                        }
                        className="h-3"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          </FadeInView>

          {/* ── Top 10 Ranked List ── */}
          <FadeInView>
            <section className="mb-16">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Top 10 {vertical.label} Brands by Catalog Size
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {topBrands.map((brand, i) => {
                    const changeType = categoriseChange(brand.latestChange);
                    const changeColor = getChangeTypeColor(changeType);
                    const changeLabel = getChangeTypeLabel(changeType);
                    const count = getProductCount(brand);
                    const pct = maxProducts > 0 ? Math.round((count / maxProducts) * 100) : 0;

                    return (
                      <div key={brand.name}>
                        <div className="flex items-center gap-3 py-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary tabular-nums">
                            #{i + 1}
                          </span>
                          <BrandIcon name={brand.name} domain={brand.domain} size="md" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/brands/${slugify(brand.name)}`}
                                className="truncate font-semibold hover:text-primary transition-colors"
                              >
                                {brand.name}
                              </Link>
                              <span className="hidden text-xs text-muted-foreground sm:inline">
                                {brand.domain}
                              </span>
                            </div>
                            <div className="mt-1.5">
                              <Progress value={pct} className="h-2" />
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold tabular-nums">{brand.products}</p>
                            <Badge
                              variant="secondary"
                              className={`mt-1 text-[10px] ${changeColor}`}
                            >
                              {changeLabel}
                            </Badge>
                          </div>
                        </div>
                        {i < topBrands.length - 1 && <Separator />}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </section>
          </FadeInView>

          {/* ── Activity Breakdown ── */}
          <FadeInView>
            <section className="mb-16">
              <h2 className="mb-4 text-xl font-bold tracking-tight">Activity Breakdown</h2>
              <div className="flex flex-wrap gap-3">
                {activityPills.map(({ type, label, count, color }) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className={`gap-2 px-4 py-2 text-sm ${color}`}
                  >
                    <span className="text-lg font-bold">{count}</span>
                    {label}
                  </Badge>
                ))}
              </div>
            </section>
          </FadeInView>

          {/* ── Use Cases ── */}
          <FadeInView>
            <section className="mb-16">
              <h2 className="mb-2 text-xl font-bold tracking-tight">
                Why track {vertical.label} brands?
              </h2>
              <p className="mb-6 text-muted-foreground">
                Stay ahead in {vertical.label.toLowerCase()} with intelligence your competitors wish they had.
              </p>
              <StaggerContainer className="grid gap-4 sm:grid-cols-3">
                <StaggerItem>
                  <Card className="h-full bg-gradient-to-br from-red-500/5 to-transparent">
                    <CardContent className="p-6">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-lg font-bold text-red-600">
                        $
                      </div>
                      <h3 className="font-semibold">Monitor competitor pricing</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        See exactly when competitors drop or raise prices. React faster than the market and
                        protect your margins across {stats.total.toLocaleString()} tracked products.
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
                      <h3 className="font-semibold">Spot new launches first</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        Get notified within hours when any {vertical.label.toLowerCase()} brand launches
                        new products. Understand trends before they go mainstream.
                      </p>
                    </CardContent>
                  </Card>
                </StaggerItem>
                <StaggerItem>
                  <Card className="h-full bg-gradient-to-br from-blue-500/5 to-transparent">
                    <CardContent className="p-6">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-lg font-bold text-blue-600">
                        #
                      </div>
                      <h3 className="font-semibold">Benchmark your catalog</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        Compare your product count against the top {vertical.label.toLowerCase()} stores.
                        The average store here carries {stats.avg.toLocaleString()} products.
                      </p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              </StaggerContainer>
            </section>
          </FadeInView>

          {/* ── All Brands Grid ── */}
          <section id="all-brands" className="mb-16">
            <FadeInView>
              <h2 className="mb-6 text-xl font-bold tracking-tight">
                All {allBrands.length} Brands
              </h2>
            </FadeInView>
            <StaggerContainer className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allBrands.map((brand) => {
                const changeType = categoriseChange(brand.latestChange);
                const changeColor = getChangeTypeColor(changeType);
                const changeLabel = getChangeTypeLabel(changeType);

                return (
                  <StaggerItem key={brand.name}>
                    <Link
                      href={`/brands/${slugify(brand.name)}`}
                      className="group block"
                    >
                      <Card className="transition-all hover:bg-muted/50 hover:shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <BrandIcon name={brand.name} domain={brand.domain} size="md" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium group-hover:text-primary transition-colors">
                                {brand.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{brand.domain}</p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold tabular-nums">{brand.products}</p>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] ${changeColor}`}
                            >
                              {changeLabel}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {brand.lastUpdate} ago
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

          {/* ── CTA with plus-icon corners ── */}
          <FadeInView>
            <section className="mb-16">
              <div className="relative border-y border-border">
                {/* Plus icons at corners */}
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
                    Start tracking {vertical.label.toLowerCase()} brands
                  </h3>
                  <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                    Get real-time alerts when any of these {allBrands.length} brands change prices, launch
                    products, or update their catalog. Free plan available.
                  </p>
                  <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button asChild size="lg" className="h-12 rounded-xl gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:brightness-110">
                      <Link href="/scraper">
                        Start Tracking for Free
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-12 rounded-xl">
                      <Link href="/pricing">
                        View pricing
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
