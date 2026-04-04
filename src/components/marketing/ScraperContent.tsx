"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductTable } from "@/components/dashboard/ProductTable";
import { ProductFilters } from "@/components/dashboard/ProductFilters";
import { useUrlParams } from "@/hooks/useUrlParams";
import { toast } from "sonner";
import { Loader2, Search, BarChart3, Package, DollarSign, Calendar, Clock, Bell, Shield, Zap, TrendingUp, ArrowRight, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { validateStoreUrl } from "@/lib/urlValidation";

export interface Product {
  id: number;
  title: string;
  handle: string;
  product_type: string;
  vendor: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  variants: Array<{
    id: number;
    title: string;
    price: string;
    compare_at_price: string | null;
    inventory_quantity: number;
  }>;
  images: Array<{
    id: number;
    src: string;
    alt: string | null;
  }>;
  tags: string | string[];
}

interface StoreInfo {
  currency: string;
  currencySymbol: string;
  name: string;
  domain: string;
  favicon?: string;
}

export function ScraperContent() {
  const supabase = getSupabaseClient();
  const { user } = useAuth();
  const router = useRouter();
  const { params, clearParams, hasSiteParam } = useUrlParams();
  const [storeUrl, setStoreUrl] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const [storeName, setStoreName] = useState("");
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);

  // No redirect — scraper is accessible to all users

  // Auto-trigger scraping when URL parameter is present
  useEffect(() => {
    if (params.site && !loading && !products.length) {
      setStoreUrl(params.site);
      setTimeout(() => {
        fetchProducts(params.site);
      }, 500);
    }
  }, [params.site, loading, products.length]);

  const fetchFavicon = async (domain: string): Promise<string | undefined> => {
    try {
      const faviconUrls = [
        `https://${domain}/favicon.ico`,
        `https://${domain}/favicon.png`,
        `https://${domain}/apple-touch-icon.png`,
        `https://${domain}/android-chrome-192x192.png`
      ];
      for (const url of faviconUrls) {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          if (response.ok) return url;
        } catch (error) { /* Continue */ }
      }
    } catch (error) {
      console.log('Could not fetch favicon for domain:', domain);
    }
    return undefined;
  };

  // Proxy helper to avoid CORS issues with direct Shopify requests
  const proxyFetch = async (domain: string, endpoint = "products.json", params: Record<string, string> = {}) => {
    const sp = new URLSearchParams({ domain, endpoint, ...params });
    return fetch(`/api/scrape?${sp.toString()}`);
  };

  const detectStoreCurrency = async (domain: string, firstProduct?: any): Promise<StoreInfo> => {
    const currencyMapping: { [key: string]: string } = {
      'USD': '$', 'GBP': '£', 'EUR': '€', 'CAD': 'C$', 'AUD': 'A$', 'JPY': '¥'
    };
    try {
      const shopResponse = await proxyFetch(domain, "shop.json");
      if (shopResponse.ok) {
        const shopData = await shopResponse.json();
        const shop = shopData.shop;
        return {
          currency: shop.currency || 'USD',
          currencySymbol: currencyMapping[shop.currency] || '$',
          name: shop.name || domain,
          domain: domain
        };
      }
    } catch (error) {
      console.log('Could not fetch shop info');
    }
    if (firstProduct && firstProduct.variants && firstProduct.variants[0]) {
      try {
        const cartResponse = await proxyFetch(domain, "cart.json");
        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          if (cartData.currency) {
            return {
              currency: cartData.currency,
              currencySymbol: currencyMapping[cartData.currency] || '$',
              name: domain,
              domain: domain
            };
          }
        }
      } catch (error) {
        console.log('Could not detect currency');
      }
      if (domain.includes('.co.uk')) {
        return { currency: 'GBP', currencySymbol: '£', name: domain, domain: domain };
      }
    }
    return { currency: 'USD', currencySymbol: '$', name: domain, domain: domain };
  };

  const formatPrice = (price: string | number, currency?: string, symbol?: string) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    const currencyCode = currency || storeInfo?.currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: currencyCode, currencyDisplay: 'symbol'
    }).format(numericPrice);
  };

  const validateShopifyStore = async (domain: string): Promise<boolean> => {
    try {
      const response = await proxyFetch(domain, "products.json", { limit: "1" });
      if (!response.ok) return false;
      const data = await response.json();
      return data && typeof data === 'object' && 'products' in data && Array.isArray(data.products);
    } catch (error) {
      return false;
    }
  };

  const fetchProducts = async (urlOverride?: string) => {
    const targetUrl = urlOverride || storeUrl;
    if (!targetUrl.trim()) {
      toast.error("Please enter a Shopify store URL");
      return;
    }

    setLoading(true);
    setLoadingProgress({ current: 0, total: 0 });

    try {
      const urlValidation = validateStoreUrl(targetUrl);
      if (!urlValidation.valid) {
        toast.error(urlValidation.error || 'Invalid URL');
        return;
      }

      let domain = urlValidation.normalized!;
      if (!domain.includes('.')) {
        domain = `${domain}.myshopify.com`;
      }

      const isValidShopifyStore = await validateShopifyStore(domain);
      if (!isValidShopifyStore) {
        toast.error("We couldn't verify that this is a Shopify store. Please try another URL.");
        return;
      }

      const firstResponse = await proxyFetch(domain, "products.json", { limit: "1" });
      if (!firstResponse.ok) throw new Error(`Failed to fetch products: ${firstResponse.status}`);
      const firstData = await firstResponse.json();
      const firstProduct = firstData.products?.[0];

      const detectedStoreInfo = await detectStoreCurrency(domain, firstProduct);
      const favicon = await fetchFavicon(domain);
      const enhancedStoreInfo = { ...detectedStoreInfo, favicon };
      setStoreInfo(enhancedStoreInfo);

      const allProducts: Product[] = [];
      let page = 1;
      let hasMorePages = true;
      const limit = 250;

      while (hasMorePages) {
        setLoadingProgress({ current: page, total: 0 });
        const response = await proxyFetch(domain, "products.json", { limit: String(limit), page: String(page) });
        if (!response.ok) throw new Error(`Failed to fetch products: ${response.status}`);
        const data = await response.json();
        const pageProducts = data.products || [];

        if (pageProducts.length === 0) {
          hasMorePages = false;
        } else {
          allProducts.push(...pageProducts);
          if (pageProducts.length < limit) hasMorePages = false;
          else page++;
        }

        setProducts([...allProducts]);
        setFilteredProducts([...allProducts]);

        if (pageProducts.length > 0) {
          toast.success(`Loaded page ${page}${hasMorePages ? '' : ' (final)'} - ${allProducts.length} total products`, { duration: 2000 });
        }
      }

      setStoreName(domain);

      toast.success(`Completed! Loaded all ${allProducts.length} products from ${detectedStoreInfo.name}`, { duration: 4000 });

      if (hasSiteParam) clearParams();

    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products. Make sure the store URL is correct and publicly accessible.");
    } finally {
      setLoading(false);
      setLoadingProgress({ current: 0, total: 0 });
    }
  };

  const handleFilterChange = (filters: {
    search: string;
    productType: string;
    vendor: string;
    minPrice: number;
    maxPrice: number;
  }) => {
    let filtered = [...products];
    if (filters.search) {
      filtered = filtered.filter(product => {
        const searchTerm = filters.search.toLowerCase();
        const title = product.title.toLowerCase();
        let tagsText = '';
        if (Array.isArray(product.tags)) tagsText = product.tags.join(' ').toLowerCase();
        else if (typeof product.tags === 'string') tagsText = product.tags.toLowerCase();
        return title.includes(searchTerm) || tagsText.includes(searchTerm);
      });
    }
    if (filters.productType && filters.productType !== "all-types") {
      filtered = filtered.filter(product => product.product_type.toLowerCase().includes(filters.productType.toLowerCase()));
    }
    if (filters.vendor && filters.vendor !== "all-vendors") {
      filtered = filtered.filter(product => product.vendor.toLowerCase().includes(filters.vendor.toLowerCase()));
    }
    if (filters.minPrice > 0 || filters.maxPrice > 0) {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.variants[0]?.price || "0");
        return (!filters.minPrice || price >= filters.minPrice) && (!filters.maxPrice || price <= filters.maxPrice);
      });
    }
    setFilteredProducts(filtered);
  };

  const getDashboardStats = () => {
    if (products.length === 0) return null;
    const totalProducts = products.length;
    const totalPrice = products.reduce((sum, product) => sum + parseFloat(product.variants[0]?.price || "0"), 0);
    const averagePrice = totalPrice / totalProducts;
    const sortedByCreated = [...products].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const sortedByUpdated = [...products].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return { totalProducts, averagePrice, mostRecentCreatedProduct: sortedByCreated[0], mostRecentUpdatedProduct: sortedByUpdated[0] };
  };

  const dashboardStats = getDashboardStats();
  const hasProducts = products.length > 0;
  const GUEST_PRODUCT_LIMIT = 10;
  const visibleProducts = !user ? filteredProducts.slice(0, GUEST_PRODUCT_LIMIT) : filteredProducts;
  const hiddenCount = !user ? Math.max(0, filteredProducts.length - GUEST_PRODUCT_LIMIT) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">

      {/* Hero Section — only visible before products are loaded */}
      {!hasProducts && !loading && (
        <>
          <div className="text-center py-12">
            <Badge variant="secondary" className="mb-4 text-sm px-4 py-1.5">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Free to try — no account needed
            </Badge>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Spy on Any Shopify Store
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Enter a competitor&apos;s URL below and instantly see every product, price, and variant in their catalog.
            </p>
          </div>

          {/* URL Input — hero style */}
          <Card className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground border-0 overflow-hidden shadow-glow max-w-3xl mx-auto">
            <CardContent className="p-8">
              <p className="text-center text-primary-foreground/80 text-sm mb-4">
                Enter any Shopify store URL to get started
              </p>
              <div className="flex gap-3">
                <Input
                  placeholder="e.g. gymshark.com, allbirds.com"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && fetchProducts()}
                  className="flex-1 bg-white text-foreground border-0 h-12 text-lg placeholder:text-muted-foreground shadow-md"
                />
                <Button
                  onClick={() => fetchProducts()}
                  disabled={loading}
                  className="bg-white text-primary hover:bg-white/90 px-8 h-12 font-semibold shadow-md"
                >
                  Analyze Store
                </Button>
              </div>
              <div className="mt-5 pt-5 border-t border-primary-foreground/20">
                <p className="text-xs text-primary-foreground/60 mb-3 text-center">Popular stores to try:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['gymshark.com', 'allbirds.com', 'fashion-nova.com', 'mvmt.com'].map((store) => (
                    <Button
                      key={store}
                      variant="outline"
                      size="sm"
                      onClick={() => { setStoreUrl(store); setTimeout(() => fetchProducts(store), 100); }}
                      className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 text-xs"
                    >
                      {store.replace('.com', '')}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="text-center p-6 border-2 border-primary/10 hover:border-primary/20 hover:shadow-glow transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Full Product Catalog</h3>
              <p className="text-muted-foreground text-sm">See every product, variant, price, and image from any Shopify store instantly</p>
            </Card>
            <Card className="text-center p-6 border-2 border-primary/10 hover:border-primary/20 hover:shadow-glow transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Track Competitors</h3>
              <p className="text-muted-foreground text-sm">Monitor price changes, new products, and out-of-stock items automatically</p>
            </Card>
            <Card className="text-center p-6 border-2 border-primary/10 hover:border-primary/20 hover:shadow-glow transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Alerts</h3>
              <p className="text-muted-foreground text-sm">Get notified via email or Slack when competitors make changes</p>
            </Card>
          </div>
        </>
      )}

      {/* Minimal inline input — visible while loading or after products loaded */}
      {(hasProducts || loading) && (
        <div className="flex gap-3 max-w-3xl mx-auto">
          <Input
            placeholder="Enter another Shopify store URL..."
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && fetchProducts()}
            className="flex-1 h-11"
          />
          <Button onClick={() => fetchProducts()} disabled={loading} className="h-11 px-6">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingProgress.current > 0 ? `Page ${loadingProgress.current}...` : "Analyzing..."}
              </>
            ) : (
              "Analyze"
            )}
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading && !hasProducts && (
        <div className="text-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Fetching products{loadingProgress.current > 0 ? ` (page ${loadingProgress.current})` : ''}...</p>
        </div>
      )}

      {/* Signup CTA Banner — shown to unauthenticated users after products load */}
      {hasProducts && !user && (
        <Card className="border-2 border-primary bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 overflow-hidden">
          <CardContent className="py-8 px-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <Badge variant="secondary" className="text-xs">Free Forever Plan</Badge>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  Like what you see? Track this store for free.
                </h2>
                <p className="text-muted-foreground">
                  Create a free account to save this data, track price changes, get alerts when new products drop, and export your findings. No credit card required.
                </p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground justify-center md:justify-start">
                  <span className="flex items-center gap-1.5"><Package className="h-4 w-4 text-primary" /> Track 1 store free</span>
                  <span className="flex items-center gap-1.5"><Bell className="h-4 w-4 text-primary" /> Price &amp; stock alerts</span>
                  <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-primary" /> Historical data</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <Button
                  size="lg"
                  className="px-8 text-base font-semibold"
                  onClick={() => router.push('/auth')}
                >
                  Create Free Account
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground text-center">No credit card required</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {hasProducts && (
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl border border-primary/10">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground"
            >
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground"
            >
              <Package className="h-4 w-4" />
              Products ({filteredProducts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {dashboardStats && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-2 border-primary/10 hover:border-primary/20 hover:shadow-glow transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                      <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {dashboardStats.totalProducts.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/10 hover:border-primary/20 hover:shadow-glow transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Price</CardTitle>
                      <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {formatPrice(dashboardStats.averagePrice)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-2 border-primary/10 hover:border-primary/20 hover:shadow-glow transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="p-1.5 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        Newest Product
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3">
                        {dashboardStats.mostRecentCreatedProduct.images[0] && (
                          <img src={dashboardStats.mostRecentCreatedProduct.images[0].src} alt={dashboardStats.mostRecentCreatedProduct.images[0].alt || dashboardStats.mostRecentCreatedProduct.title} className="w-16 h-16 object-cover rounded-md" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm line-clamp-2">{dashboardStats.mostRecentCreatedProduct.title}</h3>
                          <p className="text-xs text-muted-foreground">{dashboardStats.mostRecentCreatedProduct.vendor}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium">{formatPrice(dashboardStats.mostRecentCreatedProduct.variants[0]?.price || '0')}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Created:</span>
                          <span>{new Date(dashboardStats.mostRecentCreatedProduct.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/10 hover:border-primary/20 hover:shadow-glow transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="p-1.5 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        Recently Updated
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3">
                        {dashboardStats.mostRecentUpdatedProduct.images[0] && (
                          <img src={dashboardStats.mostRecentUpdatedProduct.images[0].src} alt={dashboardStats.mostRecentUpdatedProduct.images[0].alt || dashboardStats.mostRecentUpdatedProduct.title} className="w-16 h-16 object-cover rounded-md" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm line-clamp-2">{dashboardStats.mostRecentUpdatedProduct.title}</h3>
                          <p className="text-xs text-muted-foreground">{dashboardStats.mostRecentUpdatedProduct.vendor}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium">{formatPrice(dashboardStats.mostRecentUpdatedProduct.variants[0]?.price || '0')}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Updated:</span>
                          <span>{new Date(dashboardStats.mostRecentUpdatedProduct.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductFilters products={products} onFilterChange={handleFilterChange} storeInfo={storeInfo} />

            {filteredProducts.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredProducts.length} of {products.length} products
                      {storeName && <span className="ml-1">from <span className="font-medium text-foreground">{storeName}</span></span>}
                    </p>
                    {/* Export locked for guests — CTA to sign up */}
                    {!user && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-muted-foreground"
                        onClick={() => router.push('/auth')}
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Export
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-1">Sign up</Badge>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="relative">
              <ProductTable products={visibleProducts} storeInfo={storeInfo} />
              {!user && hiddenCount > 0 && (
                <div className="relative">
                  <div className="absolute -top-24 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
                  <Card className="border-2 border-primary text-center py-10 px-6 relative z-20">
                    <Lock className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="text-xl font-bold mb-2">
                      +{hiddenCount} more products hidden
                    </h3>
                    <p className="text-muted-foreground mb-5 max-w-md mx-auto">
                      Create a free account to see all {products.length} products, track price changes, and get alerts.
                    </p>
                    <Button size="lg" onClick={() => router.push('/auth')} className="px-8 font-semibold">
                      Create Free Account
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">No credit card required</p>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Second signup CTA — sticky bottom for unauthenticated users viewing products */}
      {hasProducts && !user && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t z-50 py-3 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-sm font-medium hidden sm:block">
              <span className="text-primary font-bold">{products.length} products</span> found — create a free account to track changes and get alerts
            </p>
            <p className="text-sm font-medium sm:hidden">
              <span className="text-primary font-bold">{products.length} products</span> found
            </p>
            <Button size="sm" onClick={() => router.push('/auth')} className="shrink-0">
              Sign Up Free <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Extra padding at bottom for sticky bar */}
      {hasProducts && !user && <div className="h-16" />}
    </div>
  );
}
