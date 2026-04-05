"use client";

import Link from "next/link";
import { Check, Globe } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/providers/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/hooks/useCurrency";
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/motion";

export function PricingContent() {
  const { user, subscribed, subscriptionTier } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { currency, formatPrice, changeCurrency, availableCurrencies } = useCurrency();
  const supabase = getSupabaseClient();

  const handleSubscribe = async (plan: string) => {
    if (!user) {
      router.push("/auth");
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan, currency: currency.code },
      });
      if (error) {
        toast({ title: "Error", description: "Failed to create checkout session", variant: "destructive" });
        return;
      }
      window.open(data.url, "_blank");
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) {
        toast({ title: "Error", description: "Failed to open customer portal", variant: "destructive" });
        return;
      }
      window.open(data.url, "_blank");
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
  };

  const plans = [
    {
      name: "Free",
      price: `${currency.symbol}0`,
      period: "month",
      description: "Get started with basic competitor tracking.",
      features: [
        "Track 1 competitor store",
        "10 product scrapes per month",
        "Basic product data",
        "Summary dashboard",
        "Weekly new product alerts",
      ],
    },
    {
      name: "Lite",
      price: formatPrice("lite"),
      period: "month",
      description: "Full product data for a single store.",
      features: [
        "Track 1 competitor store",
        "Up to 200 products per store",
        "Full product data",
        "Daily scraping",
        "Daily price & product alerts",
        "CSV export",
        "Email support",
      ],
    },
    {
      name: "Starter",
      price: formatPrice("starter"),
      period: "month",
      description: "Perfect for growing brands tracking competitors.",
      features: [
        "Track 2 competitor stores",
        "Up to 500 products per store",
        "Enhanced product data",
        "Weekly price monitoring",
        "Weekly new product alerts",
        "CSV export",
        "Email support",
      ],
    },
    {
      name: "Pro",
      price: formatPrice("pro"),
      period: "month",
      description: "Advanced intelligence for scaling eCommerce teams.",
      popular: true,
      features: [
        "Track up to 10 stores",
        "Daily scraping",
        "Complete product data + metafields",
        "Advanced competitor analytics",
        "Price alerts by % threshold",
        "Real-time new product alerts",
        "Scheduled exports",
        "API access (read-only)",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: `${currency.symbol}99+/month`,
      description: "For large brands and agencies with custom needs.",
      features: [
        "Unlimited competitor stores",
        "Custom scrape frequency (hourly)",
        "Full enterprise data access",
        "Custom data enrichment",
        "Slack, webhook, email & SMS alerts",
        "Competitor comparison dashboards",
        "Export history & versioning",
        "Dedicated support & onboarding",
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-16">
      {/* Header */}
      <FadeInView className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Choose the plan that fits your business. Start free, upgrade when you need more.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
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

      {/* Plan cards */}
      <StaggerContainer className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, index) => {
          const isPopular = plan.popular;
          const isCurrent = subscribed && subscriptionTier === plan.name;

          return (
            <StaggerItem key={index}>
              <Card
                className={`relative flex h-full flex-col rounded-xl transition-all ${
                  isPopular
                    ? "border-2 border-primary shadow-sm"
                    : "border border-border/60"
                }`}
              >
                {isPopular && (
                  <Badge className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-0.5">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="pb-2 pt-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight text-foreground">
                        {plan.price}
                      </span>
                      {plan.name !== "Enterprise" && (
                        <span className="text-sm text-muted-foreground">
                          /{plan.period}
                        </span>
                      )}
                    </div>
                    {plan.name === "Enterprise" && (
                      <p className="text-xs text-muted-foreground">
                        {plan.period}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {plan.description}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col pt-4">
                  <ul className="flex-1 space-y-2.5">
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {isCurrent ? (
                      <Button
                        variant="outline"
                        className="w-full rounded-lg border-border/60"
                        size="lg"
                        onClick={handleManageSubscription}
                      >
                        Manage Subscription
                      </Button>
                    ) : (
                      <Button
                        variant={isPopular ? "default" : "outline"}
                        className={`w-full rounded-lg ${
                          isPopular
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border-border/60"
                        }`}
                        size="lg"
                        onClick={() => {
                          if (plan.name === "Enterprise") {
                            window.open("mailto:sales@shopispy.com", "_blank");
                          } else if (plan.name !== "Free") {
                            handleSubscribe(plan.name.toLowerCase());
                          } else {
                            router.push("/auth");
                          }
                        }}
                      >
                        {plan.name === "Enterprise"
                          ? "Contact Sales"
                          : plan.name === "Free"
                            ? "Get Started Free"
                            : `Subscribe to ${plan.name}`}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Bottom CTA */}
      <FadeInView>
        <div className="rounded-xl border border-border/60 bg-muted/30 p-8 text-center space-y-4">
          <h3 className="text-xl font-semibold text-foreground">
            Ready to outsmart your competition?
          </h3>
          <p className="mx-auto max-w-lg text-sm text-muted-foreground">
            Join hundreds of brands using ShopiSpy to monitor competitors and optimize pricing. No credit card required.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/auth">
              <Button size="lg" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                Start Free Trial
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="rounded-lg border-border/60"
              onClick={() =>
                window.open("mailto:demo@shopispy.com?subject=Schedule Demo Request", "_blank")
              }
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </FadeInView>
    </div>
  );
}
