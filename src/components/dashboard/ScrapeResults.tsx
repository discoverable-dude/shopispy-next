"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Download,
  Search,
  ExternalLink,
  Package,
  Lock,
  Eye,
  Store,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  Crown,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSubscriptionLimits } from "./SubscriptionLimits";
import { UpgradePrompt } from "./UpgradePrompt";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { DataPreviewModal } from "./DataPreviewModal";
import { StoreAnalytics } from "./StoreAnalytics";
import { generateCSV, generateXLSX, generateJSON, downloadFile } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface TrackedStore {
  normalizedUrl: string;
  displayName: string;
  storeUrl: string;
  storeId: string;
  totalProducts: number;
  lastAnalyzed: string;
  products: any[];
}

const normalizeStoreUrl = (url: string) =>
  url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

export const ScrapeResults = () => {
  const supabase = getSupabaseClient();
  const { user, subscribed, subscriptionTier = 'free' } = useAuth();
  const { canUseFeature, tierConfig } = useSubscriptionLimits();
  const canExport = tierConfig.limits.exports;
  const { toast } = useToast();
  const [stores, setStores] = useState<TrackedStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStore, setExpandedStore] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [hiddenStoreUrls, setHiddenStoreUrls] = useState<Set<string>>(new Set());
  const [deletingStore, setDeletingStore] = useState<string | null>(null);

  const tier = user ? (subscribed ? subscriptionTier?.toLowerCase() ?? "free" : 'free') : 'guest';

  useEffect(() => {
    if (user) {
      fetchStoreData();
    }
    const handleScrapeCompleted = () => fetchStoreData();
    window.addEventListener('scrapeCompleted', handleScrapeCompleted);
    return () => window.removeEventListener('scrapeCompleted', handleScrapeCompleted);
  }, [user]);

  const handleDeleteStore = async (store: TrackedStore) => {
    if (!user) return;
    setDeletingStore(store.normalizedUrl);
    try {
      // Insert into hidden stores
      await supabase.from('user_hidden_stores').upsert({
        user_id: user.id,
        store_url: store.normalizedUrl,
      }, { onConflict: 'user_id,store_url' });

      setHiddenStoreUrls(prev => new Set([...prev, store.normalizedUrl]));
      setStores(prev => prev.filter(s => s.normalizedUrl !== store.normalizedUrl));
      toast({
        title: "Store removed",
        description: `${store.displayName} has been removed from your tracked stores. It still counts toward your monthly store limit.`,
      });
    } catch (error) {
      console.error('Error hiding store:', error);
      toast({ title: "Error", description: "Failed to remove store. Please try again.", variant: "destructive" });
    } finally {
      setDeletingStore(null);
    }
  };

  const fetchStoreData = async (isRefresh = false) => {
    if (!user) return;
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // Fetch hidden stores, user scrapes, and all stores in parallel
      const [{ data: hiddenData }, { data: userScrapes }, { data: allStores }] = await Promise.all([
        supabase.from('user_hidden_stores').select('store_url').eq('user_id', user.id),
        supabase.from('user_scrapes').select('*').eq('user_id', user.id).order('scrape_date', { ascending: false }),
        supabase.from('stores').select('*'),
      ]);

      const hiddenSet = new Set((hiddenData || []).map(d => normalizeStoreUrl(d.store_url)));
      setHiddenStoreUrls(hiddenSet);

      // Group scrapes by normalized URL, skip hidden stores
      const storeMap = new Map<string, { scrape: any; store: any }>();
      for (const scrape of userScrapes || []) {
        const normalized = normalizeStoreUrl(scrape.store_url);
        if (hiddenSet.has(normalized)) continue;
        if (!storeMap.has(normalized)) {
          const matchedStore = (allStores || []).find(
            (s) => normalizeStoreUrl(s.store_url) === normalized
          );
          storeMap.set(normalized, { scrape, store: matchedStore });
        }
      }

      // Fetch products for each unique store
      const trackedStores: TrackedStore[] = await Promise.all(
        Array.from(storeMap.entries()).map(async ([normalized, { scrape, store }]) => {
          let products: any[] = [];
          if (store) {
            // Try all matching store IDs
            const matchingStoreIds = (allStores || [])
              .filter((s) => normalizeStoreUrl(s.store_url) === normalized)
              .map((s) => s.id);

            for (const storeId of matchingStoreIds) {
              const { data } = await supabase
                .from('products')
                .select('*, product_variants(*), product_images(*)')
                .eq('store_id', storeId)
                .order('inserted_at', { ascending: false })
                .limit(1000);
              if (data && data.length > 0) {
                products = data.map((p) => ({
                  ...p,
                  variants: p.product_variants || [],
                  images: p.product_images || [],
                }));
                break;
              }
            }
          }

          return {
            normalizedUrl: normalized,
            displayName: store?.store_name || normalized,
            storeUrl: scrape.store_url.startsWith('http') ? scrape.store_url : `https://${scrape.store_url}`,
            storeId: store?.id || '',
            totalProducts: products.length || scrape.total_products,
            lastAnalyzed: scrape.scrape_date,
            products,
          };
        })
      );

      // Filter out hidden stores
      setStores(trackedStores);
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredStores = useMemo(() => {
    if (!searchTerm) return stores;
    const term = searchTerm.toLowerCase();
    return stores
      .map((store) => {
        const storeMatches = store.displayName.toLowerCase().includes(term) || store.normalizedUrl.includes(term);
        const matchedProducts = store.products.filter(
          (p) =>
            p.title?.toLowerCase().includes(term) ||
            p.vendor?.toLowerCase().includes(term) ||
            p.product_type?.toLowerCase().includes(term)
        );
        if (storeMatches) return store;
        if (matchedProducts.length > 0) return { ...store, products: matchedProducts };
        return null;
      })
      .filter(Boolean) as TrackedStore[];
  }, [stores, searchTerm]);

  const totalProducts = useMemo(() => stores.reduce((sum, s) => sum + s.totalProducts, 0), [stores]);

  const handleExport = async (store: TrackedStore, format: 'csv' | 'xlsx' | 'json') => {
    if (!user) return;
    setExportLoading(true);
    try {
      const scrapeCompat = { id: store.normalizedUrl, store_url: store.storeUrl, store_name: store.displayName, total_products: store.totalProducts, scrape_date: store.lastAnalyzed, products: store.products };
      const filename = `${store.displayName}-${store.lastAnalyzed}`;
      switch (format) {
        case 'csv': downloadFile(generateCSV(scrapeCompat), `${filename}.csv`, 'text/csv'); break;
        case 'xlsx': { const xlsxData = await generateXLSX(scrapeCompat); downloadFile(xlsxData, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); break; }
        case 'json': downloadFile(generateJSON(scrapeCompat), `${filename}.json`, 'application/json'); break;
      }
      toast({ title: "Export Complete", description: `Exported ${store.products.length} products as ${format.toUpperCase()}.` });
    } catch {
      toast({ title: "Export Failed", description: "An error occurred. Please try again.", variant: "destructive" });
    } finally {
      setExportLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Sign in to view your tracked stores</p>
          <Button onClick={() => (window.location.href = '/auth')}>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats row + search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {stores.length} {stores.length === 1 ? 'store' : 'stores'}
          </Badge>
          <Badge variant="outline" className="text-sm px-3 py-1">
            {totalProducts} products
          </Badge>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stores or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchStoreData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Store list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredStores.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {stores.length === 0
                ? 'No stores tracked yet. Analyze a store from the Overview page.'
                : 'No stores match your search.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredStores.map((store) => {
            const isExpanded = expandedStore === store.normalizedUrl;
            return (
              <Card key={store.normalizedUrl} className="overflow-hidden">
                {/* Store row */}
                <button
                  className="w-full text-left px-4 py-4 sm:px-6 flex items-center gap-4 hover:bg-accent/50 transition-colors"
                  onClick={() => setExpandedStore(isExpanded ? null : store.normalizedUrl)}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{store.displayName}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="truncate">{store.normalizedUrl}</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(store.lastAnalyzed), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {store.totalProducts} products
                  </Badge>
                  <div className="shrink-0 text-muted-foreground">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {/* Expanded product table */}
                {isExpanded && (
                  <div className="border-t">
                    <div className="px-4 sm:px-6 py-3 flex items-center justify-between bg-muted/30">
                      <p className="text-sm text-muted-foreground">
                        {store.products.length} products loaded
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); window.open(store.storeUrl, '_blank'); }}
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          Visit Store
                        </Button>
                         {user && canExport ? (
                          <DataPreviewModal
                            products={store.products}
                            storeName={store.displayName}
                            onExport={(format) => handleExport(store, format)}
                          >
                            <Button size="sm" disabled={exportLoading}>
                              <Download className="h-3.5 w-3.5 mr-1.5" />
                              Export
                            </Button>
                          </DataPreviewModal>
                        ) : user ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-muted-foreground"
                            onClick={(e) => { e.stopPropagation(); window.location.href = '/pricing'; }}
                          >
                            <Lock className="h-3 w-3" />
                            Export
                            <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-1">Lite+</Badge>
                          </Button>
                        ) : null}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => e.stopPropagation()}
                              disabled={deletingStore === store.normalizedUrl}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove {store.displayName}?</AlertDialogTitle>
                              <AlertDialogDescription className="space-y-2">
                                <span className="block">This will hide the store and its products from your dashboard.</span>
                                <span className="flex items-start gap-2 rounded-md bg-muted p-3 text-sm">
                                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                  <span>This store will still count toward your monthly store limit ({tierConfig.limits.stores === -1 ? 'unlimited' : tierConfig.limits.stores} stores on your {tierConfig.displayName} plan). Removing a store does not free up a slot.</span>
                                </span>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteStore(store)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove Store
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {/* Store Analytics Dashboard */}
                    <StoreAnalytics
                      storeId={store.storeId}
                      storeName={store.displayName}
                      storeUrl={store.storeUrl}
                      products={store.products}
                    />

                    {store.products.length === 0 ? (
                      <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                        No product data available. Try re-analyzing this store.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[240px]">Product</TableHead>
                              <TableHead>Vendor</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="w-12"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {store.products.slice(0, 50).map((product) => (
                              <TableRow key={product.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    {product.images?.[0]?.src && (
                                      <img
                                        src={product.images[0].src}
                                        alt={product.title}
                                        className="w-9 h-9 object-cover rounded shrink-0"
                                        loading="lazy"
                                      />
                                    )}
                                    <div className="min-w-0">
                                      <div className="font-medium text-sm truncate max-w-[240px]">{product.title}</div>
                                      {product.handle && (
                                        <div className="text-xs text-muted-foreground truncate">/{product.handle}</div>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm">{product.vendor || '—'}</span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-muted-foreground">{product.product_type || '—'}</span>
                                </TableCell>
                                <TableCell>
                                  {product.variants?.[0] ? (
                                    <div className="text-sm">
                                      <span className="font-medium">${product.variants[0].price}</span>
                                      {product.variants[0].compare_at_price && (
                                        <span className="text-xs text-muted-foreground line-through ml-1.5">
                                          ${product.variants[0].compare_at_price}
                                        </span>
                                      )}
                                    </div>
                                  ) : '—'}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={product.variants?.[0]?.available !== false ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {product.variants?.[0]?.available !== false ? 'Available' : 'Out of Stock'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      const url = `${store.storeUrl}/products/${product.handle}`;
                                      window.open(url, '_blank');
                                    }}
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {store.products.length > 50 && (
                          <div className="px-6 py-3 text-center text-sm text-muted-foreground border-t">
                            Showing 50 of {store.products.length} products. Export to see all.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
