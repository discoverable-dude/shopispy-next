"use client";

import Link from "next/link";
import { Check, Star, Zap, Crown, Users, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/providers/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/hooks/useCurrency";
import { FadeInView, StaggerContainer, StaggerItem, HoverScale } from "@/components/motion";

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
      description: "Lead Gen / Hook",
      icon: <Star className="h-6 w-6" />,
      gradient: "from-green-500/10 to-emerald-500/10",
      border: "border-green-500/20 hover:border-green-500/40",
      buttonClass: "bg-green-600 hover:bg-green-700 text-white",
      features: [
        "Track 1 competitor store",
        "10 product scrapes per month",
        "Basic product data only",
        "Summary dashboard",
        "New product alerts (weekly)",
        "CSV export locked",
      ],
    },
    {
      name: "Lite",
      price: formatPrice("lite"),
      period: "month",
      description: "Low-Barrier Upgrade",
      icon: <Zap className="h-5 w-5" />,
      gradient: "from-cyan-500/10 to-blue-500/10",
      border: "border-cyan-500/20 hover:border-cyan-500/40",
      buttonClass: "bg-cyan-600 hover:bg-cyan-700 text-white",
      features: [
        "Track 1 competitor store",
        "Up to 200 products per store",
        "Full product data",
        "Daily scraping",
        "Daily price & product alerts",
        "CSV export enabled",
        "Email support",
      ],
    },
    {
      name: "Starter",
      price: formatPrice("starter"),
      period: "month",
      description: "Perfect for Small Brands",
      icon: <Zap className="h-6 w-6" />,
      gradient: "from-blue-500/10 to-indigo-500/10",
      border: "border-blue-500/20 hover:border-blue-500/40",
      buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
      features: [
        "Track 2 competitor stores",
        "Up to 500 products/store",
        "Enhanced product data",
        "Weekly price monitoring",
        "Weekly new product alerts",
        "CSV export enabled",
        "Email support",
      ],
    },
    {
      name: "Pro",
      price: formatPrice("pro"),
      period: "month",
      description: "Growth-Stage eCommerce",
      icon: <Crown className="h-6 w-6" />,
      gradient: "from-orange-500/10 to-amber-500/10",
      border: "border-orange-500/30 hover:border-orange-500/50 ring-2 ring-orange-500/20",
      buttonClass: "bg-orange-600 hover:bg-orange-700 text-white",
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
      description: "Large Brands & Agencies",
      icon: <Users className="h-6 w-6" />,
      gradient: "from-red-500/10 to-rose-500/10",
      border: "border-red-500/20 hover:border-red-500/40",
      buttonClass: "bg-red-600 hover:bg-red-700 text-white",
      features: [
        "Unlimited competitor stores",
        "Custom scrape frequency (hourly)",
        "Full enterprise data access",
        "Custom data enrichment",
        "Slack, webhook, email, SMS alerts",
        "Competitor comparison dashboards",
        "Export history & versioning",
        "Dedicated support & onboarding",
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-16 p-4 py-12">
      {/* Header */}
      <FadeInView className="space-y-6 text-center">
        <h1 className="bg-gradient-primary bg-clip-text text-5xl font-bold text-transparent">
          Choose Your Plan
        </h1>
        <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
          Unlock the full potential of Shopify store intelligence with flexible pricing for every
          business size.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Currency:</span>
          <Select value={currency.code} onValueChange={changeCurrency}>
            <SelectTrigger className="w-32">
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

      {/* Stats */}
      <div className="flex items-center justify-center gap-8">
        {[
          { value: "10k+", label: "Products Tracked" },
          { value: "500+", label: "Active Users" },
          { value: "99.9%", label: "Uptime" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-bold text-primary">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Cards */}
      <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        {plans.map((plan, index) => (
          <StaggerItem key={index}>
            <HoverScale>
              <Card
                className={`relative flex h-full flex-col border-2 bg-gradient-to-br ${plan.gradient} ${plan.border} transition-all`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="pb-4 text-center">
                  <div className="mb-2 flex justify-center">{plan.icon}</div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold">
                      {plan.price}
                      {plan.name !== "Enterprise" && (
                        <span className="text-sm font-normal text-muted-foreground">
                          /{plan.period}
                        </span>
                      )}
                    </div>
                    {plan.name === "Enterprise" && (
                      <div className="text-sm text-muted-foreground">{plan.period}</div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col space-y-4">
                  <ul className="flex-1 space-y-2">
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto space-y-3">
                    {subscribed && subscriptionTier === plan.name ? (
                      <Button
                        className="w-full bg-green-600 text-white hover:bg-green-700"
                        size="lg"
                        onClick={handleManageSubscription}
                      >
                        Manage Subscription
                      </Button>
                    ) : (
                      <Button
                        className={`w-full ${plan.buttonClass}`}
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
                            ? "Get Started"
                            : `Subscribe to ${plan.name}`}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </HoverScale>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* CTA */}
      <FadeInView>
        <div className="rounded-lg bg-gradient-primary p-8 text-center text-white space-y-6">
          <h3 className="text-3xl font-bold">Ready to Outsmart Your Competition?</h3>
          <p className="mx-auto max-w-2xl text-lg text-white/90">
            Join hundreds of successful brands using ShopiSpy to monitor competitors and optimize
            pricing.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/auth">
              <Button size="lg" className="bg-green-600 font-semibold text-white hover:bg-green-700">
                Start Free Trial
              </Button>
            </Link>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
              onClick={() =>
                window.open("mailto:demo@shopispy.com?subject=Schedule Demo Request", "_blank")
              }
            >
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-white/70">
            No credit card required &middot; Free plan available &middot; Cancel anytime
          </p>
        </div>
      </FadeInView>
    </div>
  );
}
