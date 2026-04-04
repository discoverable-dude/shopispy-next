"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Globe, Play, AlertCircle, CheckCircle, Loader2, Link2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSubscriptionLimits } from "./SubscriptionLimits";
import { useUrlParams } from "@/hooks/useUrlParams";
import { getSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { validateStoreUrl } from "@/lib/urlValidation";

const MAX_URL_LENGTH = 500;
const RATE_LIMIT_MINUTES = 2;

const checkRateLimit = async (userId: string) => {
  const supabase = getSupabaseClient();
  const cutoffTime = new Date();
  cutoffTime.setMinutes(cutoffTime.getMinutes() - RATE_LIMIT_MINUTES);

  const { data: recentScrapes, error } = await supabase
    .from('user_scrapes')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', cutoffTime.toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw new Error('Unable to verify rate limit');

  if (recentScrapes && recentScrapes.length > 0) {
    const timeSinceLastScrape = Date.now() - new Date(recentScrapes[0].created_at).getTime();
    const minutesRemaining = Math.ceil((RATE_LIMIT_MINUTES * 60 * 1000 - timeSinceLastScrape) / (60 * 1000));
    throw new Error(`Please wait ${minutesRemaining} minute(s) before scraping again`);
  }
};

export const QuickScraper = () => {
  const supabase = getSupabaseClient();
  const { user } = useAuth();
  const { canUseFeature, getUpgradeMessage, usage, tierConfig } = useSubscriptionLimits();
  const { params, clearParams, hasSiteParam } = useUrlParams();
  const [storeUrl, setStoreUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastScrapeResult, setLastScrapeResult] = useState<{
    success: boolean;
    message: string;
    productCount?: number;
  } | null>(null);

  useEffect(() => {
    if (params.site && user && !isLoading) {
      setStoreUrl(params.site);
      setTimeout(() => handleScrape(params.site), 500);
    }
  }, [params.site, user]);

  const handleScrape = async (urlOverride?: string) => {
    const targetUrl = urlOverride || storeUrl;

    if (!user) {
      toast.error('Please log in to scrape stores');
      return;
    }

    if (!targetUrl?.trim()) {
      toast.error('Please enter a store URL');
      return;
    }

    if (targetUrl.length > MAX_URL_LENGTH) {
      toast.error('URL is too long');
      return;
    }

    // Comprehensive URL validation
    const validation = validateStoreUrl(targetUrl.trim());
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid URL');
      return;
    }

    const normalized = validation.normalized!;

    // Check if store was hidden — if so, unhide it instead of counting as new
    const { data: hiddenEntry } = await supabase
      .from('user_hidden_stores')
      .select('id')
      .eq('user_id', user.id)
      .eq('store_url', normalized)
      .maybeSingle();

    if (hiddenEntry) {
      // Unhide the store — doesn't count as a new slot
      await supabase.from('user_hidden_stores').delete().eq('id', hiddenEntry.id);
    } else if (!canUseFeature('scrapes') || !canUseFeature('stores')) {
      const feature = !canUseFeature('stores') ? 'stores' : 'scrapes';
      const upgrade = getUpgradeMessage(feature);
      toast.error(upgrade.description);
      upgrade.action();
      return;
    }

    setIsLoading(true);
    setLastScrapeResult(null);

    try {
      await checkRateLimit(user.id);

      // Call the real scraping edge function
      const { data, error } = await supabase.functions.invoke('scrape-store', {
        body: { storeUrl: targetUrl.trim() },
      });

      if (error) {
        throw new Error(error.message || 'Failed to analyze store');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setLastScrapeResult({
        success: true,
        message: `Successfully analyzed ${data.store?.name || targetUrl}`,
        productCount: data.productCount,
      });

      toast.success(`Found ${data.productCount} products!`);

      // Notify admin via Slack
      supabase.functions.invoke('send-slack-notification', {
        body: {
          type: 'scrape_completed',
          title: 'Store Scrape Completed',
          message: `${user.email} scraped ${data.store?.name || targetUrl} — ${data.productCount} products found`,
          data: {
            store_name: data.store?.name,
            store_url: targetUrl,
            product_count: data.productCount,
            user_email: user.email,
          },
          severity: 'info',
        },
      }).catch(err => console.error('Slack scrape notification failed:', err));

      if (hasSiteParam) {
        clearParams();
      } else {
        setStoreUrl('');
      }

      window.dispatchEvent(new CustomEvent('scrapeCompleted'));
    } catch (error) {
      console.error('Scraping error:', error);
      const message = error instanceof Error ? error.message : 'Failed to analyze store';

      setLastScrapeResult({ success: false, message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const canScrape = canUseFeature('scrapes');
  const canAddStore = canUseFeature('stores');
  const isBlocked = !canScrape || !canAddStore;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5 text-primary" />
          Analyze a Competitor Store
          {hasSiteParam && (
            <Badge variant="secondary" className="ml-auto text-xs">
              <Link2 className="h-3 w-3 mr-1" />
              Auto-triggered
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter any Shopify store URL to fetch their real product catalog
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={isBlocked ? "Upgrade to analyze more stores" : "e.g. gymshark.com, allbirds.com"}
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              className="pl-10"
              disabled={isLoading || isBlocked}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading && !isBlocked) {
                  handleScrape();
                }
              }}
            />
          </div>
          <Button
            onClick={() => handleScrape()}
            disabled={isLoading || !storeUrl.trim() || isBlocked}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>

        {isBlocked && (
          <Alert className="border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">
                {!canAddStore
                  ? `Store limit reached (${usage.stores}/${tierConfig.limits.stores}). `
                  : `Monthly scrape limit reached (${usage.scrapes}/${tierConfig.limits.scrapesPerMonth}). `}
                Upgrade to continue.
              </span>
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/pricing'}>
                Upgrade
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {lastScrapeResult && (
          <Alert className={lastScrapeResult.success ? "border-green-200 bg-green-50" : "border-destructive/20 bg-destructive/5"}>
            {lastScrapeResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            <AlertDescription>
              <p className={`text-sm font-medium ${lastScrapeResult.success ? 'text-green-800' : 'text-destructive'}`}>
                {lastScrapeResult.message}
              </p>
              {lastScrapeResult.productCount !== undefined && (
                <p className="text-xs text-green-600 mt-1">
                  {lastScrapeResult.productCount} products saved to your tracked stores
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
