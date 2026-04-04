"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ExternalLink, Calendar, Package, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ScrapeData {
  id: string;
  store_url: string;
  total_products: number;
  scrape_date: string;
  store_name?: string;
}

export const RecentScrapes = () => {
  const supabase = getSupabaseClient();
  const { user } = useAuth();
  const [scrapes, setScrapes] = useState<ScrapeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRecentScrapes();

      // Set up real-time subscription for new scrapes
      const channel = supabase
        .channel('user-scrapes-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_scrapes',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Refresh scrapes when new one is added
            fetchRecentScrapes();
          }
        )
        .subscribe();

      // Listen for scrapes from QuickScraper
      const handleScrapeCompleted = () => {
        fetchRecentScrapes();
      };

      window.addEventListener('scrapeCompleted', handleScrapeCompleted);

      return () => {
        supabase.removeChannel(channel);
        window.removeEventListener('scrapeCompleted', handleScrapeCompleted);
      };
    }
  }, [user]);

  const fetchRecentScrapes = async (isRefresh = false) => {
    if (!user) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Get recent scrapes
      const { data: recentScrapes, error } = await supabase
        .from('user_scrapes')
        .select('*')
        .eq('user_id', user.id)
        .order('scrape_date', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching scrapes:', error);
        return;
      }

      // Get all stores for normalized URL matching
      const { data: allStores } = await supabase
        .from('stores')
        .select('store_url, store_name');

      const normalizeUrl = (url: string) =>
        url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

      const scrapesWithStoreNames = (recentScrapes || []).map((scrape) => {
        const normalizedScrapeUrl = normalizeUrl(scrape.store_url);
        const matchedStore = (allStores || []).find(
          (s) => normalizeUrl(s.store_url) === normalizedScrapeUrl
        );
        return {
          ...scrape,
          store_name: matchedStore?.store_name || scrape.store_url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
        };
      });

      setScrapes(scrapesWithStoreNames);
    } catch (error) {
      console.error('Error fetching recent scrapes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStoreDomain = (url: string) => {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    } catch {
      return url;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recent Analysis
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchRecentScrapes(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : scrapes.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No competitor analysis yet</p>
            <p className="text-sm text-muted-foreground">
              Start analyzing competitor stores to see your data here
            </p>
            <Button
              className="mt-4"
              onClick={() => window.location.href = '/'}
            >
              <Search className="h-4 w-4 mr-2" />
              Analyze Your First Store
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {scrapes.map((scrape) => (
              <div
                key={scrape.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{scrape.store_name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {scrape.total_products} products
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(scrape.scrape_date), { addSuffix: true })}
                      </div>
                      <span>{getStoreDomain(scrape.store_url)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(scrape.store_url.startsWith('http') ? scrape.store_url : `https://${scrape.store_url}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            {scrapes.length >= 5 && (
              <div className="text-center pt-4 border-t">
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View All Analysis History
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        {scrapes.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {scrapes.reduce((sum, scrape) => sum + scrape.total_products, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Products Analyzed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {new Set(scrapes.map(s => s.store_url)).size}
                </div>
                <div className="text-xs text-muted-foreground">Unique Stores</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
