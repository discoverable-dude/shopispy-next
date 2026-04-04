"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart3, Crown, TrendingUp, AlertTriangle, Lock } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useSubscriptionLimits } from "./SubscriptionLimits";

interface UsageCounterProps {
  onScrapeUsed?: () => void;
}

export const UsageCounter = ({ onScrapeUsed }: UsageCounterProps) => {
  const supabase = getSupabaseClient();
  const { user, subscribed, subscriptionTier = 'free' } = useAuth();
  const { usage, tierConfig, canUseFeature, getLimit } = useSubscriptionLimits();
  const [loading, setLoading] = useState(true);

  const currentScrapes = usage.scrapes;
  const scrapeLimit = tierConfig.limits.scrapesPerMonth;
  const storeLimit = tierConfig.limits.stores;
  const currentStores = usage.stores;

  const usagePercentage = scrapeLimit > 0 ? (currentScrapes / scrapeLimit) * 100 : 0;
  const isNearLimit = usagePercentage >= 80 && usagePercentage < 100;
  const isAtLimit = !canUseFeature('scrapes');
  const isCritical = usagePercentage >= 90;

  useEffect(() => {
    if (user) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user, usage]);

  const recordScrape = async (storeUrl: string, totalProducts: number) => {
    if (!user) return;

    // Check if user can use scraping feature
    if (!canUseFeature('scrapes')) {
      return false; // Blocked
    }

    try {
      const { error } = await supabase
        .from('user_scrapes')
        .insert({
          user_id: user.id,
          store_url: storeUrl,
          total_products: totalProducts
        });

      if (error) {
        console.error('Error recording scrape:', error);
        return false;
      }

      onScrapeUsed?.();
      return true;
    } catch (error) {
      console.error('Error recording scrape:', error);
      return false;
    }
  };

  // Expose the recordScrape function to parent components
  useEffect(() => {
    (window as any).recordScrape = recordScrape;
  }, [user]);

  if (!user || loading) {
    return null;
  }

  if (subscribed && subscriptionTier !== 'free') {
    return (
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Crown className="h-4 w-4 text-primary" />
            {subscriptionTier} Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-gradient-to-r from-primary to-primary/80">
                {scrapeLimit === -1 ? 'Unlimited Scrapes' : `${scrapeLimit} Scrapes/Month`}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {storeLimit === -1 ? 'Unlimited Stores' : `${storeLimit} Store${storeLimit === 1 ? '' : 's'}`}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Current usage: {currentScrapes} scrapes, {currentStores} stores
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className={`transition-all duration-200 ${
        isAtLimit ? 'border-red-500/50 bg-red-50/50 ring-1 ring-red-200' :
        isCritical ? 'border-orange-500/50 bg-orange-50/50 ring-1 ring-orange-200' :
        isNearLimit ? 'border-yellow-500/50 bg-yellow-50/50' :
        'border-border'
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4" />
            Free Plan Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Scrapes Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monthly Scrapes</span>
                <span className="text-sm text-muted-foreground">
                  {currentScrapes}/{scrapeLimit}
                </span>
              </div>
              <Progress
                value={usagePercentage}
                className={`h-3 transition-all duration-200 ${
                  isAtLimit ? 'bg-red-100' :
                  isCritical ? 'bg-orange-100' :
                  isNearLimit ? 'bg-yellow-100' :
                  'bg-muted'
                }`}
              />
              {usagePercentage >= 80 && (
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className={`font-medium ${
                    isAtLimit ? 'text-red-600' :
                    isCritical ? 'text-orange-600' : 'text-yellow-600'
                  }`}>
                    {isAtLimit ? 'Limit reached!' :
                     isCritical ? 'Almost full!' : 'Approaching limit'}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-5 px-2 text-xs ${
                      isAtLimit ? 'text-red-600 hover:text-red-700' :
                      'text-orange-600 hover:text-orange-700'
                    }`}
                    onClick={() => window.location.href = '/pricing'}
                  >
                    Upgrade
                  </Button>
                </div>
              )}
            </div>

            {/* Stores Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tracked Stores</span>
                <span className="text-sm text-muted-foreground">
                  {currentStores}/{storeLimit}
                </span>
              </div>
              <Progress
                value={storeLimit > 0 ? (currentStores / storeLimit) * 100 : 0}
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Limit Warning */}
      {currentStores >= storeLimit && (
        <Alert className="border-red-200 bg-red-50">
          <Lock className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-800">Store limit reached!</p>
                <p className="text-sm text-red-600">
                  Upgrade to track more competitor stores
                </p>
              </div>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => window.location.href = '/pricing'}
              >
                <Crown className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isAtLimit && (
        <Alert className="border-red-500/50 bg-red-50/50 ring-1 ring-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 mb-1">
                  Scrape Limit Reached!
                </p>
                <p className="text-xs text-red-600 mb-3">
                  You've used all {scrapeLimit} monthly scrapes. Upgrade to continue competitor analysis.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 h-7"
                    onClick={() => window.location.href = '/pricing'}
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Upgrade Now
                  </Button>
                  <Badge variant="outline" className="border-red-200 text-red-600">
                    From £19/month
                  </Badge>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isCritical && !isAtLimit && (
        <Alert className="border-orange-500/50 bg-orange-50/50">
          <TrendingUp className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">
                  {scrapeLimit - currentScrapes} scrapes remaining
                </p>
                <p className="text-xs text-orange-600">
                  Upgrade now to avoid interruption to your competitor analysis
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-orange-200 text-orange-700 hover:bg-orange-100 h-7"
                onClick={() => window.location.href = '/pricing'}
              >
                <Crown className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
