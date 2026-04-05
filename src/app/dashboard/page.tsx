"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, Package, Bell, Activity, Crown, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { QuickScraper } from "@/components/dashboard/QuickScraper";
import { RecentScrapes } from "@/components/dashboard/RecentScrapes";
import { UsageBar } from "@/components/dashboard/UpgradePrompt";
import { useSubscriptionLimits } from "@/components/dashboard/SubscriptionLimits";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

const Overview = () => {
  const supabase = getSupabaseClient();
  const { user, subscribed, subscriptionTier } = useAuth();
  const { usage, tierConfig, tierName } = useSubscriptionLimits();
  const [stats, setStats] = useState({ stores: 0, products: 0, alerts: 0 });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const [scrapesRes, hiddenRes, alertsRes] = await Promise.all([
        supabase
          .from("user_scrapes")
          .select("store_url, total_products")
          .eq("user_id", user.id),
        supabase
          .from("user_hidden_stores")
          .select("store_url")
          .eq("user_id", user.id),
        supabase
          .from("product_alerts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .is("read_at", null),
      ]);

      const normalizeUrl = (url: string) =>
        url
          .toLowerCase()
          .replace(/^https?:\/\//, "")
          .replace(/^www\./, "")
          .replace(/\/$/, "");
      const hiddenSet = new Set(
        (hiddenRes.data || []).map((s) => normalizeUrl(s.store_url))
      );

      const activeStores = new Set(
        (scrapesRes.data || [])
          .map((s) => normalizeUrl(s.store_url))
          .filter((url) => !hiddenSet.has(url))
      );
      const totalProducts = (scrapesRes.data || [])
        .filter((s) => !hiddenSet.has(normalizeUrl(s.store_url)))
        .reduce((sum, s) => sum + (s.total_products || 0), 0);

      setStats({
        stores: activeStores.size,
        products: totalProducts,
        alerts: alertsRes.count || 0,
      });
    };

    fetchStats();
    const handleRefresh = () => fetchStats();
    window.addEventListener("scrapeCompleted", handleRefresh);
    return () => window.removeEventListener("scrapeCompleted", handleRefresh);
  }, [user]);

  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  const statCards = [
    {
      label: "Tracked Stores",
      value: stats.stores,
      icon: Store,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Total Products",
      value: stats.products,
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Unread Alerts",
      value: stats.alerts,
      icon: Bell,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      label: "Scrapes This Month",
      value: usage.scrapes,
      icon: Activity,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here is what is happening with your competitor intelligence.
          </p>
        </div>
        <Badge
          variant="outline"
          className="gap-1.5 rounded-lg border-border/60 px-3 py-1.5 text-xs font-medium"
        >
          <Crown className="h-3 w-3 text-primary" />
          {tierConfig.displayName}
          {tierConfig.nextTier && (
            <button
              onClick={() => (window.location.href = "/pricing")}
              className="ml-1 text-primary hover:underline"
            >
              Upgrade
            </button>
          )}
        </Badge>
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

      {/* Plan usage */}
      <Card className="rounded-xl border-border/60">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Plan Usage
            </h2>
            <span className="text-xs text-muted-foreground">
              {tierConfig.displayName} Plan
            </span>
          </div>
          <UsageBar
            label="Stores tracked"
            current={usage.stores}
            limit={tierConfig.limits.stores}
          />
          <UsageBar
            label="Scrapes this month"
            current={usage.scrapes}
            limit={tierConfig.limits.scrapesPerMonth}
          />
        </CardContent>
      </Card>

      {/* Quick Scraper section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Quick Scraper</h2>
        <QuickScraper />
      </div>

      {/* Recent Activity section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Recent Activity
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => (window.location.href = "/dashboard/stores")}
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        <RecentScrapes />
      </div>
    </div>
  );
};

export default Overview;
