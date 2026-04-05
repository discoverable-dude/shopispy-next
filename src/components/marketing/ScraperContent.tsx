"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Package, ArrowRight, ChevronDown, Globe, Check,
  AlertTriangle, Store, BarChart3, Tag, Users, Layers,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
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
  images: Array<{ id: number; src: string; alt: string | null }>;
  tags: string | string[];
}

interface StoreInfo {
  name: string;
  domain: string;
  currency: string;
  currencySymbol: string;
}

type ScrapePhase = "idle" | "validating" | "detecting" | "scanning" | "complete" | "error";

const CURRENCY_MAP: Record<string, string> = {
  USD: "$", GBP: "\u00a3", EUR: "\u20ac", CAD: "C$", AUD: "A$",
  JPY: "\u00a5", NZD: "NZ$", SEK: "kr", NOK: "kr", DKK: "kr",
  CHF: "CHF", HKD: "HK$", SGD: "S$", INR: "\u20b9", BRL: "R$",
};

const EXAMPLES = [
  { name: "Gymshark", domain: "gymshark.com" },
  { name: "Fenty Beauty", domain: "fentybeauty.com" },
  { name: "Liquid Death", domain: "liquiddeath.com" },
  { name: "Ridge Wallet", domain: "ridgewallet.com" },
  { name: "Ruggable", domain: "ruggable.com" },
];

// Detect user's locale currency
function getUserCurrency(): { code: string; symbol: string } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const locale = navigator.language || "en-US";
    // Rough mapping by timezone/locale
    if (locale.startsWith("en-GB") || tz.includes("London")) return { code: "GBP", symbol: "\u00a3" };
    if (locale.startsWith("en-AU") || tz.includes("Australia")) return { code: "AUD", symbol: "A$" };
    if (locale.startsWith("en-CA") || tz.includes("Toronto")) return { code: "CAD", symbol: "C$" };
    if (tz.includes("Europe") && !tz.includes("London")) return { code: "EUR", symbol: "\u20ac" };
    if (tz.includes("Asia/Tokyo")) return { code: "JPY", symbol: "\u00a5" };
  } catch { /* fallback */ }
  return { code: "USD", symbol: "$" };
}

// Approximate exchange rates (static, good enough for display)
const RATES_TO_USD: Record<string, number> = {
  USD: 1, GBP: 1.27, EUR: 1.09, CAD: 0.74, AUD: 0.66,
  JPY: 0.0067, NZD: 0.61, SEK: 0.097, NOK: 0.094, DKK: 0.146,
  CHF: 1.12, HKD: 0.128, SGD: 0.75, INR: 0.012, BRL: 0.2,
};

function convertPrice(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  const usd = amount * (RATES_TO_USD[from] || 1);
  return usd / (RATES_TO_USD[to] || 1);
}

function formatMoney(amount: number, symbol: string): string {
  return `${symbol}${amount.toFixed(2)}`;
}

// ── Progress step component ──
function ProgressStep({ label, status, detail }: {
  label: string;
  status: "pending" | "active" | "done" | "error";
  detail?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3"
    >
      <div className="mt-0.5">
        {status === "done" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Check className="h-3 w-3" />
          </motion.div>
        )}
        {status === "active" && (
          <div className="relative flex h-5 w-5 items-center justify-center">
            <span className="absolute h-5 w-5 animate-ping rounded-full bg-primary/30" />
            <span className="relative h-3 w-3 rounded-full bg-primary" />
          </div>
        )}
        {status === "pending" && (
          <div className="h-5 w-5 rounded-full border-2 border-border" />
        )}
        {status === "error" && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
            <AlertTriangle className="h-3 w-3" />
          </div>
        )}
      </div>
      <div>
        <p className={`text-sm font-medium ${status === "active" ? "text-foreground" : status === "done" ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
          {label}
        </p>
        {detail && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-xs text-muted-foreground"
          >
            {detail}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

export function ScraperContent() {
  const { user } = useAuth();
  const [storeUrl, setStoreUrl] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [phase, setPhase] = useState<ScrapePhase>("idle");
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [scanProgress, setScanProgress] = useState({ page: 0, found: 0 });
  const [phaseDetail, setPhaseDetail] = useState("");
  const [showInUserCurrency, setShowInUserCurrency] = useState(false);
  const [savedToDb, setSavedToDb] = useState(false);
  const userCurrency = useRef(getUserCurrency());
  const storeCurrencyDiffers = storeInfo ? storeInfo.currency !== userCurrency.current.code : false;

  const proxyFetch = async (domain: string, endpoint = "products.json", params: Record<string, string> = {}) => {
    const sp = new URLSearchParams({ domain, endpoint, ...params });
    return fetch(`/api/scrape?${sp.toString()}`);
  };

  const displayPrice = (price: string, storeCurrency?: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return "N/A";
    if (showInUserCurrency && storeCurrency && storeCurrency !== userCurrency.current.code) {
      const converted = convertPrice(num, storeCurrency, userCurrency.current.code);
      return formatMoney(converted, userCurrency.current.symbol);
    }
    return formatMoney(num, storeInfo?.currencySymbol || "$");
  };

  const fetchProducts = async (urlOverride?: string) => {
    const target = urlOverride || storeUrl;
    if (!target.trim()) { toast.error("Enter a Shopify store URL"); return; }

    setProducts([]);
    setStoreInfo(null);
    setShowAll(false);
    setScanProgress({ page: 0, found: 0 });
    setShowInUserCurrency(false);
    setSavedToDb(false);

    // Phase 1: Validate
    setPhase("validating");
    setPhaseDetail("Checking URL format...");
    const validation = validateStoreUrl(target);
    if (!validation.valid) {
      setPhase("error"); setPhaseDetail(validation.error || "Invalid URL");
      toast.error(validation.error || "Invalid URL"); return;
    }
    let domain = validation.normalized!;
    if (!domain.includes(".")) domain = `${domain}.myshopify.com`;

    setPhaseDetail(`Verifying ${domain} is a Shopify store...`);
    await new Promise((r) => setTimeout(r, 300));

    try {
      // Validate store exists first (always via proxy — fast check)
      const testResp = await proxyFetch(domain, "products.json", { limit: "1" });
      if (!testResp.ok) {
        setPhase("error"); setPhaseDetail("Couldn't reach this store");
        toast.error("Couldn't reach this store. Check the URL."); return;
      }
      const testData = await testResp.json();
      if (!testData?.products || !Array.isArray(testData.products)) {
        setPhase("error"); setPhaseDetail("Not a Shopify store");
        toast.error("This doesn't appear to be a Shopify store."); return;
      }

      // Phase 2: Detect store info
      setPhase("detecting");
      setPhaseDetail("Reading store metadata...");

      let info: StoreInfo = { name: domain, domain, currency: "USD", currencySymbol: "$" };
      try {
        const shopResp = await proxyFetch(domain, "shop.json");
        if (shopResp.ok) {
          const shopData = await shopResp.json();
          const shop = shopData.shop;
          const cur = shop.currency || "USD";
          info = { name: shop.name || domain, domain, currency: cur, currencySymbol: CURRENCY_MAP[cur] || cur };
          setPhaseDetail(`Found: ${info.name} (${info.currency})`);
        }
      } catch { /* fallback */ }
      setStoreInfo(info);
      await new Promise((r) => setTimeout(r, 400));

      // Phase 3: Scan products
      setPhase("scanning");

      // ── Authenticated: use Supabase edge function (persists to DB) ──
      if (user) {
        setPhaseDetail("Scanning via ShopiSpy engine...");
        setScanProgress({ page: 1, found: 0 });

        const supabase = getSupabaseClient();
        const { data, error } = await supabase.functions.invoke("scrape-store", {
          body: { storeUrl: domain },
        });

        if (error || data?.error) {
          // Fall back to proxy if edge function fails
          console.warn("Edge function failed, falling back to proxy:", error || data?.error);
          await fetchViaProxy(domain, info);
          return;
        }

        // Edge function succeeded — fetch products from proxy for display
        // (the edge function only returns count, not full product data)
        setScanProgress({ page: 1, found: data.productCount || 0 });
        setPhaseDetail(`Saved ${data.productCount} products to your dashboard`);
        setSavedToDb(true);

        // Now fetch products for display via proxy
        await fetchViaProxy(domain, info);

        // Send Slack notification
        supabase.functions.invoke("send-slack-notification", {
          body: {
            type: "scrape_completed",
            title: "Store Scraped",
            message: `${info.name} scraped: ${products.length || data.productCount} products`,
            data: { store_name: info.name, store_url: domain, product_count: data.productCount },
            severity: "info",
          },
        }).catch(() => {});

      } else {
        // ── Anonymous: proxy only (no persistence) ──
        await fetchViaProxy(domain, info);
      }

    } catch (err) {
      setPhase("error");
      setPhaseDetail("Something went wrong");
      toast.error("Failed to scan store. Please try again.");
      console.error(err);
    }
  };

  // Fetch products via the Next.js API proxy (for display)
  const fetchViaProxy = async (domain: string, info: StoreInfo) => {
    const all: Product[] = [];
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      setPhaseDetail(`Fetching page ${page}...`);
      setScanProgress({ page, found: all.length });
      const resp = await proxyFetch(domain, "products.json", { limit: "250", page: String(page) });
      if (!resp.ok) break;
      const data = await resp.json();
      const pageProducts = data.products || [];
      all.push(...pageProducts);
      setScanProgress({ page, found: all.length });
      hasMore = pageProducts.length === 250;
      page++;
      if (page > 20) break;
    }

    setProducts(all);
    setPhase("complete");
    setPhaseDetail(`${all.length.toLocaleString()} products found`);
    if (all.length === 0) toast.info("No products found.");
    else toast.success(`Found ${all.length.toLocaleString()} products from ${info.name}`);

    if (info.currency !== userCurrency.current.code) {
      setShowInUserCurrency(false);
    }
  };

  const loading = phase === "validating" || phase === "detecting" || phase === "scanning";
  const visibleProducts = showAll ? products : products.slice(0, user ? products.length : 12);
  const gatedCount = !user ? Math.max(0, products.length - 12) : 0;

  const avgPrice = products.length > 0
    ? products.reduce((sum, p) => sum + parseFloat(p.variants?.[0]?.price || "0"), 0) / products.length
    : 0;

  const vendorCount = new Set(products.map((p) => p.vendor)).size;
  const typeCount = new Set(products.filter((p) => p.product_type).map((p) => p.product_type)).size;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* Header */}
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Free tool</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Spy on any Shopify store
        </h1>
        <p className="mt-3 max-w-lg mx-auto text-muted-foreground">
          Enter a competitor&apos;s URL and see every product, price, and variant — in seconds, for free.
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto mt-10 max-w-xl">
        <form onSubmit={(e) => { e.preventDefault(); fetchProducts(); }} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              placeholder="e.g. gymshark.com"
              className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Scanning..." : "Analyze"}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <span className="text-xs text-muted-foreground">Try:</span>
          {EXAMPLES.map((s) => (
            <button
              key={s.domain}
              onClick={() => { setStoreUrl(s.domain); fetchProducts(s.domain); }}
              disabled={loading}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground disabled:opacity-40"
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrape progress panel ── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mx-auto mt-12 max-w-md"
          >
            <div className="rounded-2xl border border-border bg-background p-6 shadow-lg shadow-black/[0.03]">
              {/* Animated progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>
                    {phase === "validating" && "Validating..."}
                    {phase === "detecting" && "Detecting store..."}
                    {phase === "scanning" && `Scanning page ${scanProgress.page}...`}
                  </span>
                  {phase === "scanning" && (
                    <span className="font-mono text-primary">{scanProgress.found.toLocaleString()} found</span>
                  )}
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{
                      width: phase === "validating" ? "20%" : phase === "detecting" ? "40%" : `${Math.min(95, 40 + scanProgress.page * 12)}%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Step list */}
              <div className="space-y-3">
                <ProgressStep
                  label="Validate URL"
                  status={phase === "validating" ? "active" : "done"}
                  detail={phase === "validating" ? phaseDetail : undefined}
                />
                <ProgressStep
                  label="Detect store info"
                  status={phase === "detecting" ? "active" : (phase as string) === "scanning" || (phase as string) === "complete" ? "done" : "pending"}
                  detail={phase === "detecting" ? phaseDetail : storeInfo ? `${storeInfo.name} (${storeInfo.currency})` : undefined}
                />
                <ProgressStep
                  label="Scan product catalog"
                  status={phase === "scanning" ? "active" : (phase as string) === "complete" ? "done" : "pending"}
                  detail={phase === "scanning" ? `${scanProgress.found.toLocaleString()} products found so far...` : undefined}
                />
              </div>

              {/* Animated product tiles appearing */}
              {phase === "scanning" && scanProgress.found > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-5 grid grid-cols-4 gap-1.5"
                >
                  {Array.from({ length: Math.min(12, scanProgress.found) }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="aspect-square rounded-md bg-muted animate-pulse"
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error state ── */}
      <AnimatePresence>
        {phase === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-12 max-w-md text-center"
          >
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8">
              <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
              <p className="mt-3 text-sm font-medium">{phaseDetail}</p>
              <p className="mt-1 text-xs text-muted-foreground">Check the URL and try again.</p>
              <button
                onClick={() => setPhase("idle")}
                className="mt-4 rounded-lg border border-border px-4 py-2 text-xs font-medium transition-colors hover:bg-muted"
              >
                Try another store
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ── */}
      <AnimatePresence>
        {phase === "complete" && products.length > 0 && storeInfo && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-12"
          >
            {/* Store summary header */}
            <div className="rounded-2xl border border-border bg-muted/20 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary" />
                    <h2 className="text-lg font-semibold">{storeInfo.name}</h2>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{storeInfo.domain}</p>

                  {/* Saved to DB indicator */}
                  {savedToDb && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2 flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5"
                    >
                      <Check className="h-3.5 w-3.5 text-primary" />
                      <p className="text-xs text-primary font-medium">
                        Saved to your dashboard &mdash;{" "}
                        <Link href="/dashboard/stores" className="underline">view tracked stores</Link>
                      </p>
                    </motion.div>
                  )}

                  {/* Currency notice */}
                  {storeCurrencyDiffers && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-500/20 dark:bg-amber-500/10"
                    >
                      <Globe className="h-3.5 w-3.5 text-amber-600" />
                      <p className="text-xs text-amber-800 dark:text-amber-400">
                        This store uses <strong>{storeInfo.currency}</strong>. Your local currency is <strong>{userCurrency.current.code}</strong>.
                      </p>
                      <button
                        onClick={() => setShowInUserCurrency(!showInUserCurrency)}
                        className="ml-auto whitespace-nowrap rounded-md border border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-medium text-amber-800 transition-colors hover:bg-amber-200 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300"
                      >
                        {showInUserCurrency ? `Show in ${storeInfo.currency}` : `Convert to ${userCurrency.current.code}`}
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: Package, value: products.length.toLocaleString(), label: "Products" },
                    { icon: Tag, value: displayPrice(avgPrice.toFixed(2), storeInfo.currency), label: "Avg. price" },
                    { icon: Users, value: String(vendorCount), label: "Vendors" },
                    { icon: Layers, value: String(typeCount), label: "Types" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-border bg-background p-3 text-center">
                      <s.icon className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                      <p className="text-lg font-bold">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product grid */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.03 } } }}
              className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {visibleProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                  className="group rounded-xl border border-border/60 bg-background p-4 transition-all hover:border-primary/20 hover:shadow-sm"
                >
                  <div className="flex gap-3">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0].src}
                        alt={product.title}
                        className="h-16 w-16 rounded-lg border border-border object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-muted">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.title}</p>
                      <p className="text-xs text-muted-foreground">{product.vendor}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary">
                          {displayPrice(product.variants?.[0]?.price || "0", storeInfo.currency)}
                        </span>
                        {product.variants?.[0]?.compare_at_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {displayPrice(product.variants[0].compare_at_price, storeInfo.currency)}
                          </span>
                        )}
                        {showInUserCurrency && storeCurrencyDiffers && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                            ~{userCurrency.current.code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {product.variants && product.variants.length > 1 && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Layers className="h-3 w-3" />
                      {product.variants.length} variants
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Gate */}
            {!user && gatedCount > 0 && !showAll && (
              <div className="relative mt-2">
                <div className="pointer-events-none absolute -top-20 inset-x-0 h-20 bg-gradient-to-t from-background to-transparent" />
                <div className="rounded-2xl border border-border bg-muted/20 p-8 text-center">
                  <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">+{gatedCount.toLocaleString()} more products hidden</p>
                  <p className="mt-1 text-sm text-muted-foreground">Sign up free to see the full catalog and track this store.</p>
                  <Link
                    href="/auth"
                    className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:brightness-110"
                  >
                    Sign up free <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}

            {user && products.length > 12 && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                Show all {products.length.toLocaleString()} products
                <ChevronDown className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {phase === "idle" && products.length === 0 && (
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            { icon: BarChart3, title: "Full product catalog", desc: "Every product, variant, and price in any Shopify store." },
            { icon: Store, title: "Track competitors", desc: "Save stores and monitor changes over time from your dashboard." },
            { icon: Globe, title: "Multi-currency", desc: "Prices displayed in the store's currency with automatic conversion to yours." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border/60 p-5 text-center">
              <f.icon className="mx-auto h-5 w-5 text-primary mb-2" />
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
