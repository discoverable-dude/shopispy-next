import { createPublicClient } from "./supabase/public";
import type { Brand } from "./brands";

export interface BrandStats {
  productCount: number;
  lastFetchedAt: string | null;
  latestChange: {
    change_type: string;
    product_title: string | null;
    old_value: string | null;
    new_value: string | null;
    detected_at: string;
  } | null;
}

export interface EnrichedBrand extends Brand {
  stats: BrandStats;
}

function normalizeDomain(domain: string): string {
  return domain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

/**
 * Fetch live stats for a batch of brand domains in one round-trip.
 * Returns a Map keyed by normalized domain → BrandStats.
 * Brands not found in the DB get zero-value stats (product count 0, no latest change).
 */
export async function fetchStatsForDomains(
  domains: string[]
): Promise<Map<string, BrandStats>> {
  const result = new Map<string, BrandStats>();

  if (domains.length === 0) return result;

  const normalized = Array.from(new Set(domains.map(normalizeDomain)));

  // Seed map with zero-value stats for every requested domain
  for (const d of normalized) {
    result.set(d, { productCount: 0, lastFetchedAt: null, latestChange: null });
  }

  let supabase;
  try {
    supabase = createPublicClient();
  } catch {
    // If Supabase is unavailable (e.g. build-time without env vars), return empty stats
    return result;
  }

  // 1. Fetch matching stores
  const { data: stores } = await supabase
    .from("stores")
    .select("id, store_url")
    .in("store_url", normalized);

  if (!stores || stores.length === 0) return result;

  const storeIdToUrl = new Map<string, string>(
    stores.map((s) => [s.id, normalizeDomain(s.store_url)])
  );
  const storeIds = stores.map((s) => s.id);

  // 2. Product counts per store — use a single count query per store is too slow,
  // so fetch all product IDs with store_id and tally in memory.
  const { data: products } = await supabase
    .from("products")
    .select("store_id")
    .in("store_id", storeIds);

  const productCounts = new Map<string, number>();
  for (const p of products || []) {
    const id = p.store_id as string;
    productCounts.set(id, (productCounts.get(id) || 0) + 1);
  }

  // 3. Latest fetch time per store
  const { data: fetches } = await supabase
    .from("product_fetches")
    .select("store_id, fetched_at")
    .in("store_id", storeIds)
    .order("fetched_at", { ascending: false });

  const latestFetchByStore = new Map<string, string>();
  for (const f of fetches || []) {
    const id = f.store_id as string;
    if (!latestFetchByStore.has(id)) {
      latestFetchByStore.set(id, f.fetched_at as string);
    }
  }

  // 4. Latest change per store (most recent detected_at)
  const { data: changes } = await supabase
    .from("product_changes")
    .select("store_id, change_type, product_title, old_value, new_value, detected_at")
    .in("store_id", storeIds)
    .order("detected_at", { ascending: false })
    .limit(500);

  const latestChangeByStore = new Map<string, BrandStats["latestChange"]>();
  for (const c of changes || []) {
    const id = c.store_id as string;
    if (!latestChangeByStore.has(id)) {
      latestChangeByStore.set(id, {
        change_type: c.change_type,
        product_title: c.product_title,
        old_value: c.old_value,
        new_value: c.new_value,
        detected_at: c.detected_at as string,
      });
    }
  }

  // Build final map keyed by domain
  for (const [id, url] of storeIdToUrl) {
    result.set(url, {
      productCount: productCounts.get(id) || 0,
      lastFetchedAt: latestFetchByStore.get(id) || null,
      latestChange: latestChangeByStore.get(id) || null,
    });
  }

  return result;
}

/**
 * Fetch stats for a single brand domain.
 */
export async function fetchStatsForDomain(domain: string): Promise<BrandStats> {
  const map = await fetchStatsForDomains([domain]);
  return (
    map.get(normalizeDomain(domain)) || {
      productCount: 0,
      lastFetchedAt: null,
      latestChange: null,
    }
  );
}

/**
 * Format a product count for display, e.g. 2847 → "2,847"
 * Returns "—" if count is 0 (meaning not yet tracked).
 */
export function formatProductCount(count: number): string {
  if (count === 0) return "—";
  return count.toLocaleString();
}

/**
 * Format a timestamp as a short relative "time ago" string, e.g. "2h", "1d", "just now".
 * Returns "—" if the timestamp is null.
 */
export function formatTimeAgo(iso: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  if (diffMs < 0) return "just now";

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;

  const years = Math.floor(days / 365);
  return `${years}y`;
}

/**
 * Format a latest change record as a human-readable string.
 */
export function formatLatestChange(
  change: BrandStats["latestChange"]
): string {
  if (!change) return "Tracking starts soon";

  switch (change.change_type) {
    case "new_product":
      return change.product_title
        ? `New: "${change.product_title}"`
        : "New product added";
    case "removed_product":
      return change.product_title
        ? `Removed: "${change.product_title}"`
        : "Product removed";
    case "price_change": {
      const oldP = parseFloat(change.old_value || "0");
      const newP = parseFloat(change.new_value || "0");
      if (!oldP || !newP) return "Price change detected";
      const diff = newP - oldP;
      const pct = Math.round((diff / oldP) * 100);
      if (diff < 0) return `Price drop ${pct}%`;
      return `Price increase +${pct}%`;
    }
    case "stock_change":
      return change.new_value === "true" ? "Back in stock" : "Out of stock";
    default:
      return "Catalog updated";
  }
}

/**
 * Merge a static Brand definition with live stats to produce a view-model
 * that has the same shape the existing UI code expects (products, lastUpdate,
 * latestChange are strings).
 */
export function enrichBrand(
  brand: Brand,
  statsMap: Map<string, BrandStats>
): Brand & { stats: BrandStats } {
  const key = normalizeDomain(brand.domain);
  const stats = statsMap.get(key) || {
    productCount: 0,
    lastFetchedAt: null,
    latestChange: null,
  };

  return {
    ...brand,
    products: formatProductCount(stats.productCount),
    lastUpdate: formatTimeAgo(stats.lastFetchedAt),
    latestChange: formatLatestChange(stats.latestChange),
    stats,
  };
}
