"use client";

import Link from "next/link";
import { Check, Globe, ArrowRight, Database, Bell, Download, BarChart3, Zap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/providers/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/hooks/useCurrency";
import { ALL_BRANDS, VERTICALS, TOTAL_PRODUCTS } from "@/lib/brands";
import { BrandIcon } from "@/components/marketing/BrandIcon";
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/motion";

export function PricingContent() {
  const { user, subscribed, subscriptionTier } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { currency, formatPrice, changeCurrency, availableCurrencies } = useCurrency();
  const supabase = getSupabaseClient();

  const handleSubscribe = async (plan: string) => {
    if (!user) { router.push("/auth"); return; }
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan, currency: currency.code },
      });
      if (error) { toast({ title: "Error", description: "Failed to create checkout", variant: "destructive" }); return; }
      window.open(data.url, "_blank");
    } catch { toast({ title: "Error", description: "Something went wrong", variant: "destructive" }); }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) { toast({ title: "Error", description: "Failed to open portal", variant: "destructive" }); return; }
      window.open(data.url, "_blank");
    } catch { toast({ title: "Error", description: "Something went wrong", variant: "destructive" }); }
  };

  // Featured brands for the data showcase
  const featuredBrands = ALL_BRANDS.filter((b) =>
    ["gymshark.com", "fentybeauty.com", "liquiddeath.com", "ruggable.com", "nomadgoods.com", "rarebeauty.com", "aloyoga.com", "ridgewallet.com"].includes(b.domain)
  );

  const plans = [
    {
      name: "Free",
      price: `${currency.symbol}0`,
      period: "month",
      tagline: "Explore the data",
      description: "See what ShopiSpy can do. Track one store with basic data.",
      highlight: false,
      features: [
        "1 competitor store",
        "10 scrapes per month",
        "Basic product data (title, price, vendor)",
        "Weekly product alerts",
        "Market dashboard access",
        "Industry reports (CSV)",
      ],
      dataAccess: "Basic — title, price, vendor only",
    },
    {
      name: "Starter",
      price: formatPrice("starter"),
      period: "month",
      tagline: "Start competing",
      description: "Full product intelligence for small brands starting competitive research.",
      highlight: false,
      features: [
        "2 competitor stores",
        "500 products per store",
        "Full product data + variants",
        "Weekly price monitoring",
        "Email alerts",
        "CSV & Excel export",
        `Access to ${ALL_BRANDS.length} brand database`,
        "Industry benchmark reports",
      ],
      dataAccess: "Full — products, variants, images, pricing history",
    },
    {
      name: "Pro",
      price: formatPrice("pro"),
      period: "month",
      tagline: "The competitive edge",
      description: "Advanced intelligence for growth-stage ecommerce. Most popular with scaling brands.",
      highlight: true,
      features: [
        "10 competitor stores",
        "Unlimited products per store",
        "Daily scraping",
        "Complete data + metafields + SKUs",
        "Advanced analytics dashboard",
        "Price alerts by % threshold",
        "Real-time new product alerts",
        "Scheduled exports (CSV, Excel, JSON)",
        "API access (read-only)",
        `Full access to ${VERTICALS.length}-industry database`,
      ],
      dataAccess: "Complete — every Shopify field including metafields & barcodes",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: `from ${currency.symbol}99/mo`,
      tagline: "Full platform access",
      description: "For agencies and large brands managing multiple competitor portfolios.",
      highlight: false,
      features: [
        "Unlimited stores",
        "Custom scrape frequency (hourly)",
        "Every data field Shopify exposes",
        "Slack, webhook, email & SMS alerts",
        "Competitor comparison dashboards",
        "Team seats & permissions",
        "Export history & version tracking",
        "Priority support & onboarding",
        "Custom data enrichment",
        "White-label reports",
      ],
      dataAccess: "Enterprise — all fields + custom enrichment + API",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* Header */}
      <FadeInView className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Pricing</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Intelligence that scales with you
        </h1>
        <p className="mt-3 mx-auto max-w-xl text-muted-foreground">
          Every plan gives you access to data from {ALL_BRANDS.length} tracked brands
          across {VERTICALS.length} industries. {TOTAL_PRODUCTS.toLocaleString()} products monitored.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={currency.code} onValueChange={changeCurrency}>
            <SelectTrigger className="h-8 w-28 border-border/60 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableCurrencies.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FadeInView>

      {/* Data volume showcase */}
      <FadeInView delay={0.1}>
        <div className="mt-12 rounded-2xl border border-border bg-muted/20 p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold">What you get access to</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Every plan includes the ShopiSpy market intelligence platform.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-6">
              {[
                { value: ALL_BRANDS.length.toString(), label: "Brands tracked" },
                { value: VERTICALS.length.toString(), label: "Industries" },
                { value: TOTAL_PRODUCTS.toLocaleString(), label: "Products" },
                { value: "16", label: "Reports" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Brand favicon row */}
          <div className="mt-5 flex items-center gap-2 overflow-hidden">
            {featuredBrands.map((brand) => (
              <BrandIcon key={brand.name} name={brand.name} domain={brand.domain} size="sm" />
            ))}
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted/40 text-[8px] text-muted-foreground">
              +{ALL_BRANDS.length - featuredBrands.length}
            </span>
            <span className="ml-2 text-[10px] text-muted-foreground">brands tracked across all plans</span>
          </div>
        </div>
      </FadeInView>

      {/* Plan cards */}
      <StaggerContainer className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, index) => {
          const isPopular = plan.highlight;
          const isCurrent = subscribed && subscriptionTier === plan.name;

          return (
            <StaggerItem key={index}>
              <Card className={`relative flex h-full flex-col rounded-2xl transition-all ${
                isPopular ? "border-2 border-primary shadow-md shadow-primary/5" : "border border-border/60"
              }`}>
                {isPopular && (
                  <Badge className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-[10px] px-2.5 py-0.5">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="pb-2 pt-6">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
                    {plan.tagline}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {plan.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                    {plan.name !== "Enterprise" && (
                      <span className="text-xs text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>
                  {plan.name === "Enterprise" && (
                    <p className="text-[10px] text-muted-foreground">{plan.period}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col pt-3">
                  {/* Data access badge */}
                  <div className="mb-4 rounded-lg border border-border bg-muted/30 p-2.5">
                    <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Data access</p>
                    <p className="mt-0.5 text-[11px] font-medium">{plan.dataAccess}</p>
                  </div>

                  <ul className="flex-1 space-y-2">
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-xs">
                        <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    {isCurrent ? (
                      <Button variant="outline" className="w-full rounded-xl" size="lg" onClick={handleManageSubscription}>
                        Manage Subscription
                      </Button>
                    ) : (
                      <Button
                        variant={isPopular ? "default" : "outline"}
                        className={`w-full rounded-xl ${isPopular ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : ""}`}
                        size="lg"
                        onClick={() => {
                          if (plan.name === "Enterprise") window.open("mailto:sales@shopispy.com", "_blank");
                          else if (plan.name !== "Free") handleSubscribe(plan.name.toLowerCase());
                          else router.push("/auth");
                        }}
                      >
                        {plan.name === "Enterprise" ? "Contact Sales" : plan.name === "Free" ? "Get Started Free" : "Subscribe"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* What each tier unlocks */}
      <FadeInView delay={0.1}>
        <div className="mt-16">
          <h2 className="text-center text-xl font-bold">What you can do with ShopiSpy data</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Database, title: "Full product catalogs", desc: `Scrape any store from our ${ALL_BRANDS.length}-brand database. Get every product, variant, price, and image.` },
              { icon: Bell, title: "Price & product alerts", desc: "Get notified via email, Slack, or webhook when competitors change prices or launch products." },
              { icon: Download, title: "Export & reports", desc: `Download CSV, Excel, or JSON. Access benchmark reports across ${VERTICALS.length} industries.` },
              { icon: BarChart3, title: "Analytics & insights", desc: "Pricing trends, catalog growth, competitor benchmarks, and market positioning data." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border/60 p-5">
                <item.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeInView>

      {/* Bottom CTA */}
      <FadeInView>
        <div className="mt-16 rounded-2xl border border-border bg-muted/20 p-8 text-center">
          <h3 className="text-xl font-bold">Not sure which plan?</h3>
          <p className="mt-2 max-w-lg mx-auto text-sm text-muted-foreground">
            Start free, scrape your first competitor store, and see exactly what data you get.
            Upgrade when you need more stores, more scrapes, or deeper data.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/scraper" className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20">
              Try it free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/compare" className="inline-flex h-10 items-center rounded-xl border border-border px-5 text-sm font-medium transition-colors hover:bg-muted">
              Compare brands
            </Link>
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground">
            No credit card required &middot; Free plan forever &middot; Cancel anytime
          </p>
        </div>
      </FadeInView>
    </div>
  );
}
