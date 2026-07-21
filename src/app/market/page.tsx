import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus, ShoppingBag, BarChart3, Megaphone, Users, Download, Zap, TrendingUp, Eye } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BrandIcon } from "@/components/marketing/BrandIcon";
import { VERTICALS, ALL_BRANDS } from "@/lib/brands";
import {
  categoriseChange,
  getChangeTypeColor,
  getChangeTypeLabel,
  slugify,
  getTopBrands,
  type ChangeType,
} from "@/lib/brandUtils";
import { fetchLiveCounts } from "@/lib/productData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/motion";
import { MarketHeroClient } from "@/components/marketing/MarketHeroClient";
import { MarketActivityBar, type ActivitySegment } from "@/components/marketing/MarketActivityBar";
import { LargestStoresChart, type StoreBar } from "@/components/marketing/LargestStoresChart";

export const metadata: Metadata = {
  title: "Live Market Intelligence",
  description:
    "Real-time Shopify market intelligence across 550+ brands and 11 industries. Track price changes, new product launches, and competitive movements.",
  alternates: { canonical: "/market" },
};

function PlusIcon({ className }: { className?: string }) {
  return (
    <Plus
      className={`absolute h-6 w-6 text-muted-foreground/40 ${className}`}
      strokeWidth={1}
    />
  );
}

export const revalidate = 300;

export default async function MarketPage() {
  const { byDomain, byVertical } = await fetchLiveCounts();
  const countFor = (b: { domain: string }) => byDomain.get(b.domain) ?? 0;
  const totalBrands = ALL_BRANDS.length;
  const totalProducts = [...byVertical.values()].reduce((a, v) => a + v.total, 0);

  // Activity breakdown
  const changeBreakdown: Record<ChangeType, number> = {
    price_drop: 0,
    price_increase: 0,
    new_products: 0,
    restock: 0,
    sale: 0,
    other: 0,
  };
  ALL_BRANDS.forEach((b) => {
    changeBreakdown[categoriseChange(b.latestChange)]++;
  });
  const totalChanges = Object.values(changeBreakdown).reduce((a, b) => a + b, 0);

  // Build activity segments for client component
  const barColorMap: Record<ChangeType, string> = {
    new_products: "bg-primary",
    price_drop: "bg-red-500",
    price_increase: "bg-amber-500",
    restock: "bg-blue-500",
    sale: "bg-orange-500",
    other: "bg-muted-foreground/30",
  };
  const activitySegments: ActivitySegment[] = (
    Object.entries(changeBreakdown) as [ChangeType, number][]
  ).map(([type, count]) => ({
    type,
    label: getChangeTypeLabel(type),
    count,
    colorClass: getChangeTypeColor(type),
    barColor: barColorMap[type],
  }));

  // Top 15 by size (real live counts)
  const topBySize = [...ALL_BRANDS]
    .sort((a, b) => countFor(b) - countFor(a))
    .slice(0, 15);
  const maxProducts = countFor(topBySize[0]) || 1;
  const storeData: StoreBar[] = topBySize.map((b) => ({
    name: b.name,
    domain: b.domain,
    slug: slugify(b.name),
    products: countFor(b) >= 5000 ? "5,000+" : countFor(b).toLocaleString(),
    count: countFor(b),
  }));

  // Industry data (real per-vertical totals)
  const industryData = VERTICALS.map((v) => {
    const t = byVertical.get(v.label) ?? { total: 0, brandsWithData: 0 };
    const top3 = getTopBrands(v, 3);
    return {
      ...v,
      total: t.total,
      brandCount: v.brands.length,
      recentlyUpdated: t.brandsWithData,
      avg: v.brands.length ? Math.round(t.total / v.brands.length) : 0,
      top3,
    };
  }).sort((a, b) => b.total - a.total);
  const maxIndustryProducts = industryData[0]?.total || 1;

  // Use cases
  const useCases = [
    {
      icon: ShoppingBag,
      title: "Brand Owners",
      desc: "Monitor competitor pricing in real-time and react before your margins erode. Know the moment a rival launches, discounts, or restocks.",
    },
    {
      icon: BarChart3,
      title: "eCommerce Managers",
      desc: "Benchmark your catalog against hundreds of stores. Track product launches across your category and spot gaps before competitors fill them.",
    },
    {
      icon: Megaphone,
      title: "Marketing Teams",
      desc: "Detect competitor promotions and flash sales the instant they go live. Time your campaigns to capitalise on market shifts.",
    },
    {
      icon: Users,
      title: "Agencies",
      desc: "Deliver competitive intelligence reports across multiple verticals. Impress clients with data they cannot get anywhere else.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ────────────────────── HERO ────────────────────── */}
      <section className="relative overflow-hidden bg-dot-pattern mask-fade-b">
        <div className="mx-auto max-w-5xl px-6 pb-20 pt-24 text-center">
          <FadeInView>
            <Badge variant="secondary" className="mb-4 text-xs">
              Live intelligence — updated every hour
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Real-time Shopify
              <br />
              market intelligence
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Track pricing, product launches, and competitive movements across{" "}
              <strong className="text-foreground">{totalBrands}+ brands</strong>,{" "}
              <strong className="text-foreground">{VERTICALS.length} industries</strong>, and{" "}
              <strong className="text-foreground">{totalProducts.toLocaleString()} products</strong>.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-xl gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:brightness-110">
                <Link href="/scraper">
                  Start tracking free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-xl gap-2">
                <Link href="/reports">
                  <Download className="h-4 w-4" />
                  Download reports
                </Link>
              </Button>
            </div>
          </FadeInView>

          <MarketHeroClient
            brandCount={totalBrands}
            industryCount={VERTICALS.length}
            productCount={totalProducts}
          />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <Separator />

        {/* ────────────────── WHY MARKET INTELLIGENCE ────────────────── */}
        <section className="py-16">
          <FadeInView>
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Why market intelligence matters
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
                In ecommerce, the brands that move first win. Here&apos;s how real-time data changes the game.
              </p>
            </div>
          </FadeInView>
          <StaggerContainer className="mt-10 grid gap-4 sm:grid-cols-3" staggerDelay={0.08}>
            <StaggerItem>
              <Card className="h-full bg-gradient-to-br from-red-500/5 to-transparent">
                <CardHeader>
                  <Zap className="h-8 w-8 text-red-500" />
                  <CardTitle className="text-base">React before your competitors</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    By the time you notice a competitor&apos;s price change manually, they&apos;ve already captured your customers. Real-time intelligence means you see changes within hours, not weeks.
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="h-full bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <CardTitle className="text-base">Data-driven pricing decisions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Stop guessing what to charge. With pricing data from {totalBrands}+ brands across {VERTICALS.length} industries, you can benchmark your pricing against the market — not just your gut feeling.
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="h-full bg-gradient-to-br from-blue-500/5 to-transparent">
                <CardHeader>
                  <Eye className="h-8 w-8 text-blue-500" />
                  <CardTitle className="text-base">Spot opportunities others miss</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    New product launches, stockouts, seasonal sales — every competitor move is a potential opportunity. ShopiSpy surfaces these signals so you can act on them first.
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </section>

        <Separator />

        {/* ────────────────── ACTIVITY BREAKDOWN ────────────────── */}
        <section className="py-16">
          <FadeInView>
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Market activity at a glance
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
                Right now, across our database of {totalBrands} brands, here&apos;s what&apos;s happening in the Shopify market:
              </p>
            </div>
          </FadeInView>
          <FadeInView delay={0.15}>
            <div className="mx-auto mt-8 max-w-3xl">
              <MarketActivityBar segments={activitySegments} total={totalChanges} />
            </div>
          </FadeInView>
        </section>

        <Separator />

        {/* ────────────────── INDUSTRY RANKINGS ────────────────── */}
        <section className="py-16">
          <FadeInView>
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {VERTICALS.length} industries. One dashboard.
              </h2>
              <p className="mt-2 text-muted-foreground">
                Every vertical ranked by catalog size, with live brand coverage.
              </p>
            </div>
          </FadeInView>

          <StaggerContainer
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            staggerDelay={0.07}
          >
            {industryData.map((v) => {
              const pctOfMax = Math.round((v.total / maxIndustryProducts) * 100);
              return (
                <StaggerItem key={v.id}>
                  <Link href={`/industries/${slugify(v.label)}`} className="block group">
                    <Card className="h-full transition-colors hover:border-primary/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base group-hover:text-primary transition-colors">
                          {v.label}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{v.brandCount} brands</span>
                          <span>&middot;</span>
                          <span>{v.total.toLocaleString()} products</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Progress value={pctOfMax} className="h-2" />
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex -space-x-1.5">
                            {v.top3.map((brand) => (
                              <BrandIcon
                                key={brand.name}
                                name={brand.name}
                                domain={brand.domain}
                                size="sm"
                                className="ring-2 ring-background"
                              />
                            ))}
                          </div>
                          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground/50 transition-colors group-hover:text-primary">
                            View
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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

        <Separator />

        {/* ────────────────── LARGEST STORES ────────────────── */}
        <section className="py-16">
          <FadeInView>
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Largest stores we track
              </h2>
              <p className="mt-2 text-muted-foreground">
                The top 15 Shopify stores by product catalog size, updated continuously.
              </p>
            </div>
          </FadeInView>
          <FadeInView delay={0.1}>
            <div className="mx-auto mt-8 max-w-3xl">
              <LargestStoresChart stores={storeData} maxCount={maxProducts} />
            </div>
          </FadeInView>
        </section>

        <Separator />

        {/* ────────────────── USE CASES ────────────────── */}
        <section className="py-16">
          <FadeInView>
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Who uses market intelligence?
              </h2>
              <p className="mt-2 text-muted-foreground">
                ShopiSpy powers competitive strategy for every type of ecommerce team.
              </p>
            </div>
          </FadeInView>
          <StaggerContainer
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            staggerDelay={0.08}
          >
            {useCases.map((uc) => (
              <StaggerItem key={uc.title}>
                <Card className="h-full">
                  <CardHeader>
                    <uc.icon className="h-8 w-8 text-primary" />
                    <CardTitle className="text-base">{uc.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {uc.desc}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </div>

      {/* ────────────────── CTA ────────────────── */}
      <section className="px-6 py-24">
        <FadeInView>
          <div className="mx-auto max-w-4xl">
            <div className="relative border-y border-border">
              {/* Plus icons at corners */}
              <PlusIcon className="-top-3 -left-3" />
              <PlusIcon className="-top-3 -right-3" />
              <PlusIcon className="-bottom-3 -left-3" />
              <PlusIcon className="-bottom-3 -right-3" />

              {/* Dashed center vertical line */}
              <div className="absolute inset-y-0 left-1/2 -translate-x-px border-l border-dashed border-border" />

              {/* Radial gradient background */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(35% 80% at 25% 0%, hsl(var(--foreground) / .06), transparent)",
                }}
              />

              {/* Content */}
              <div className="relative px-8 py-16 text-center sm:px-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Want to track YOUR competitors?
                </h2>
                <p className="mt-4 mx-auto max-w-xl text-lg text-muted-foreground">
                  Enter any Shopify store URL and get instant product data, price
                  alerts, and competitive insights. Free plan available.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-xl gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:brightness-110"
                  >
                    <Link href="/scraper" className="group">
                      Start tracking for free
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 rounded-xl">
                    <Link href="/compare">Compare brands</Link>
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
          </div>
        </FadeInView>
      </section>

      <Footer />
    </div>
  );
}
