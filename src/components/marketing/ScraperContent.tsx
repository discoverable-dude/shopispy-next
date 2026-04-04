"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search, Package, ArrowRight, ExternalLink, ChevronDown } from "lucide-react";
import { toast } from "sonner";
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
  name: string;
  domain: string;
  currency: string;
  currencySymbol: string;
}

const EXAMPLE_STORES = [
  { name: "Gymshark", domain: "gymshark.com" },
  { name: "Allbirds", domain: "allbirds.com" },
  { name: "ColourPop", domain: "colourpop.com" },
  { name: "MVMT", domain: "mvmtwatches.com" },
];

export function ScraperContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [storeUrl, setStoreUrl] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [showAll, setShowAll] = useState(false);

  const proxyFetch = async (domain: string, endpoint = "products.json", params: Record<string, string> = {}) => {
    const sp = new URLSearchParams({ domain, endpoint, ...params });
    return fetch(`/api/scrape?${sp.toString()}`);
  };

  const fetchProducts = async (urlOverride?: string) => {
    const target = urlOverride || storeUrl;
    if (!target.trim()) { toast.error("Enter a Shopify store URL"); return; }

    setLoading(true);
    setProducts([]);
    setStoreInfo(null);
    setShowAll(false);

    try {
      const validation = validateStoreUrl(target);
      if (!validation.valid) { toast.error(validation.error || "Invalid URL"); setLoading(false); return; }

      let domain = validation.normalized!;
      if (!domain.includes(".")) domain = `${domain}.myshopify.com`;

      // Validate it's a Shopify store
      const testResp = await proxyFetch(domain, "products.json", { limit: "1" });
      if (!testResp.ok) { toast.error("Couldn't reach this store. Check the URL and try again."); setLoading(false); return; }
      const testData = await testResp.json();
      if (!testData?.products || !Array.isArray(testData.products)) {
        toast.error("This doesn't appear to be a Shopify store."); setLoading(false); return;
      }

      // Detect store info
      const currencyMapping: Record<string, string> = { USD: "$", GBP: "\u00a3", EUR: "\u20ac", CAD: "C$", AUD: "A$", JPY: "\u00a5" };
      let info: StoreInfo = { name: domain, domain, currency: "USD", currencySymbol: "$" };
      try {
        const shopResp = await proxyFetch(domain, "shop.json");
        if (shopResp.ok) {
          const shopData = await shopResp.json();
          const shop = shopData.shop;
          info = { name: shop.name || domain, domain, currency: shop.currency || "USD", currencySymbol: currencyMapping[shop.currency] || "$" };
        }
      } catch { /* fallback */ }
      setStoreInfo(info);

      // Fetch all products
      const all: Product[] = [];
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const resp = await proxyFetch(domain, "products.json", { limit: "250", page: String(page) });
        if (!resp.ok) break;
        const data = await resp.json();
        const pageProducts = data.products || [];
        all.push(...pageProducts);
        hasMore = pageProducts.length === 250;
        page++;
        if (page > 20) break; // safety cap
      }

      setProducts(all);
      if (all.length === 0) toast.info("No products found on this store.");
      else toast.success(`Found ${all.length.toLocaleString()} products`);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const visibleProducts = showAll ? products : products.slice(0, user ? products.length : 10);
  const gatedCount = !user ? Math.max(0, products.length - 10) : 0;

  const avgPrice = products.length > 0
    ? (products.reduce((sum, p) => sum + (parseFloat(p.variants?.[0]?.price || "0")), 0) / products.length).toFixed(2)
    : "0";

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Header */}
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Free tool</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Spy on any Shopify store
        </h1>
        <p className="mt-3 text-muted-foreground">
          Enter a competitor&apos;s URL below and instantly see every product, price, and variant in their catalog.
        </p>
      </div>

      {/* Search input */}
      <div className="mx-auto mt-10 max-w-xl">
        <form
          onSubmit={(e) => { e.preventDefault(); fetchProducts(); }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              placeholder="e.g. gymshark.com"
              className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
          </button>
        </form>

        {/* Quick-try buttons */}
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <span className="text-xs text-muted-foreground">Try:</span>
          {EXAMPLE_STORES.map((store) => (
            <button
              key={store.domain}
              onClick={() => { setStoreUrl(store.domain); fetchProducts(store.domain); }}
              disabled={loading}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground disabled:opacity-50"
            >
              {store.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-12 flex flex-col items-center gap-3"
          >
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Scanning store products...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {!loading && products.length > 0 && storeInfo && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-12"
          >
            {/* Store summary */}
            <div className="rounded-xl border border-border bg-muted/30 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{storeInfo.name}</h2>
                  <p className="text-sm text-muted-foreground">{storeInfo.domain}</p>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold">{products.length.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{storeInfo.currencySymbol}{avgPrice}</p>
                    <p className="text-xs text-muted-foreground">Avg. price</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{new Set(products.map(p => p.vendor)).size}</p>
                    <p className="text-xs text-muted-foreground">Vendors</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product grid */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product) => (
                <div
                  key={product.id}
                  className="group rounded-lg border border-border/60 bg-background p-4 transition-colors hover:border-primary/20"
                >
                  <div className="flex gap-3">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0].src}
                        alt={product.title}
                        className="h-16 w-16 rounded-md border border-border object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.title}</p>
                      <p className="text-xs text-muted-foreground">{product.vendor}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary">
                          {storeInfo.currencySymbol}{product.variants?.[0]?.price || "N/A"}
                        </span>
                        {product.variants?.[0]?.compare_at_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {storeInfo.currencySymbol}{product.variants[0].compare_at_price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {product.variants && product.variants.length > 1 && (
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      {product.variants.length} variants
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Gate / Show more */}
            {!user && gatedCount > 0 && !showAll && (
              <div className="relative mt-2">
                <div className="pointer-events-none absolute -top-20 inset-x-0 h-20 bg-gradient-to-t from-background to-transparent" />
                <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
                  <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">
                    +{gatedCount.toLocaleString()} more products hidden
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create a free account to see the full catalog and track this store.
                  </p>
                  <Link
                    href="/auth"
                    className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Sign up free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}

            {user && products.length > 10 && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                Show all {products.length.toLocaleString()} products
                <ChevronDown className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state — feature highlights */}
      {!loading && products.length === 0 && (
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            { title: "Full product catalog", desc: "See every product, variant, and price in any Shopify store." },
            { title: "Track competitors", desc: "Save stores to your dashboard and monitor changes over time." },
            { title: "Get price alerts", desc: "Get notified when competitors change prices or launch products." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border/60 p-5 text-center">
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
