"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, Package, Bell, Crown } from "lucide-react";
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

      // Only count active (non-hidden) stores for display
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor your competitor intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            <Crown className="h-3 w-3" />
            {tierConfig.displayName} Plan
          </Badge>
          {tierConfig.nextTier && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => (window.location.href = "/pricing")}
            >
              Upgrade
            </Button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Store className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.stores}</p>
              <p className="text-xs text-muted-foreground">Tracked Stores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.products}</p>
              <p className="text-xs text-muted-foreground">Products Tracked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.alerts}</p>
              <p className="text-xs text-muted-foreground">Unread Alerts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage limits */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium">Plan Usage</h3>
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

      {/* Main action: Quick Scraper */}
      <QuickScraper />

      {/* Recent activity */}
      <RecentScrapes />
    </div>
  );
};

export default Overview;
