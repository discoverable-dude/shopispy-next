"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, DollarSign, Package, Crown, Lock, ArrowRight } from "lucide-react";
import { UpgradePrompt } from "@/components/dashboard/UpgradePrompt";
import { useSubscriptionLimits } from "@/components/dashboard/SubscriptionLimits";

const Analytics = () => {
  const { tierConfig } = useSubscriptionLimits();

  const statCards = [
    {
      label: "Total Stores Tracked",
      icon: Package,
      value: "0",
      sub: "Start tracking competitors",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Products Monitored",
      icon: BarChart3,
      value: "0",
      sub: "Across all stores",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Price Changes",
      icon: TrendingUp,
      value: "0",
      sub: "Last 7 days",
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      label: "Avg. Competitor Price",
      icon: DollarSign,
      value: "\u00a30",
      sub: "Across categories",
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  if (!tierConfig.data.analytics) {
    return (
      <div className="space-y-8">
        {/* Page header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-2">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Analytics
            </h1>
          </div>
          <p className="text-sm text-muted-foreground pl-[44px]">
            Track trends and analyse competitor data.
          </p>
        </div>

        {/* Upgrade prompt */}
        <Card className="rounded-2xl border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="rounded-xl bg-primary/10 p-3">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Unlock Advanced Analytics
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Upgrade to Pro for price trend charts, competitor discount
                  patterns, product performance comparisons, and market
                  positioning insights.
                </p>
              </div>
              <Button
                size="sm"
                className="mt-2 gap-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold px-5"
                onClick={() => (window.location.href = "/pricing")}
              >
                <Crown className="h-3.5 w-3.5" />
                Upgrade to Pro
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Blurred preview */}
        <div className="relative">
          <div className="absolute inset-0 z-10 backdrop-blur-sm rounded-2xl" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 opacity-50">
            {statCards.map((stat) => (
              <Card
                key={stat.label}
                className="rounded-xl border-border/60 bg-card"
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={`rounded-lg p-2 ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-semibold tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/10 p-2">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Analytics
          </h1>
        </div>
        <p className="text-sm text-muted-foreground pl-[44px]">
          Track trends and analyse competitor data.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="rounded-xl border-border/60 bg-card"
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming soon card */}
      <Card className="rounded-2xl border-border/60">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-foreground">
              Advanced Analytics Coming Soon
            </h2>
            <p className="text-xs text-muted-foreground">
              Track price trends, identify patterns, and get competitive insights.
            </p>
          </div>
          <ul className="space-y-2.5">
            {[
              "Price trend charts and historical data",
              "Competitor discount pattern analysis",
              "Product performance comparisons",
              "Market positioning insights",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 text-sm text-muted-foreground"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
