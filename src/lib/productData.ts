import { createPublicClient } from "./supabase/public";
import { VERTICALS } from "./brands";

function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

async function pageAll<T>(
  run: (from: number, to: number) => PromiseLike<{ data: T[] | null }>
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await run(from, from + 999);
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}

// ── Real products for a brand (title, price, discount, image) ───────────────
export interface BrandProduct {
  id: number;
  title: string;
  url: string;
  price: number | null;
  compareAt: number | null;
  onSale: boolean;
  image: string | null;
}

export interface CatalogHighlight {
  title: string;
  url: string;
  date: string | null;
  price: number | null;
}

export interface BrandCatalog {
  products: BrandProduct[];
  insights: {
    priceSample: number;
    minPrice: number | null;
    maxPrice: number | null;
    avgPrice: number | null;
    onSaleCount: number;
    newest: CatalogHighlight | null;
    oldest: CatalogHighlight | null;
    topCategories: { name: string; count: number }[];
  };
}

const EMPTY_CATALOG: BrandCatalog = {
  products: [],
  insights: { priceSample: 0, minPrice: null, maxPrice: null, avgPrice: null, onSaleCount: 0, newest: null, oldest: null, topCategories: [] },
};

// Lowest ("from") price across a product's variants.
function productPrice(p: any): { price: number | null; onSale: boolean } {
  const prices = (p.product_variants || []).map((v: any) => v.price).filter((x: any) => x != null);
  const compares = (p.product_variants || []).map((v: any) => v.compare_at_price).filter((x: any) => x != null);
  const price = prices.length ? Math.min(...prices) : null;
  const compareAt = compares.length ? Math.max(...compares) : null;
  return { price, onSale: !!(price != null && compareAt != null && compareAt > price) };
}

export async function fetchBrandCatalog(domain: string, gridLimit = 12): Promise<BrandCatalog> {
  const supabase = createPublicClient();
  const d = normalizeDomain(domain);
  const highlight = (p: any): CatalogHighlight | null =>
    p ? { title: p.title, url: `https://${d}/products/${p.handle}`, date: p.created_at ?? null, price: productPrice(p).price } : null;

  const { data: store } = await supabase
    .from("stores").select("id").eq("store_url", d).limit(1).maybeSingle();
  if (!store) return EMPTY_CATALOG;

  // Bounded, parallel — one store, so this stays cheap.
  const [gridRes, oldestRes, priceRes, catRes] = await Promise.all([
    supabase.from("products")
      .select("id, title, handle, created_at, product_variants(price, compare_at_price), product_images(src)")
      .eq("store_id", store.id).order("created_at", { ascending: false, nullsFirst: false }).limit(24),
    supabase.from("products")
      .select("title, handle, created_at, product_variants(price)")
      .eq("store_id", store.id).order("created_at", { ascending: true, nullsFirst: false }).limit(1),
    supabase.from("products")
      .select("product_variants(price, compare_at_price)").eq("store_id", store.id).limit(800),
    supabase.from("products").select("product_type").eq("store_id", store.id).limit(5000),
  ]);

  const gridData = gridRes.data || [];
  if (gridData.length === 0) return EMPTY_CATALOG;

  const products: BrandProduct[] = gridData.slice(0, gridLimit).map((p: any) => {
    const { price, onSale } = productPrice(p);
    const compares = (p.product_variants || []).map((v: any) => v.compare_at_price).filter((x: any) => x != null);
    return {
      id: p.id, title: p.title, url: `https://${d}/products/${p.handle}`,
      price, compareAt: compares.length ? Math.max(...compares) : null, onSale,
      image: p.product_images?.[0]?.src || null,
    };
  });

  // Price range across a broader sample (per-product "from" price).
  const sample = (priceRes.data || []).map((p: any) => productPrice(p));
  const prices = sample.map((s) => s.price).filter((x): x is number => x != null);
  const onSaleCount = sample.filter((s) => s.onSale).length;

  // Top categories by product_type.
  const catCounts = new Map<string, number>();
  for (const p of catRes.data || []) {
    const t = (p.product_type || "").trim();
    if (t) catCounts.set(t, (catCounts.get(t) || 0) + 1);
  }
  const topCategories = [...catCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count }));

  return {
    products,
    insights: {
      priceSample: prices.length,
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
      avgPrice: prices.length ? Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100 : null,
      onSaleCount,
      newest: highlight(gridData[0]),
      oldest: highlight((oldestRes.data || [])[0]),
      topCategories,
    },
  };
}

// ── Recent activity across a set of brands (industry detail feed) ───────────
export interface ActivityItem {
  brand: string;
  domain: string;
  changeType: string;
  productTitle: string | null;
  oldValue: string | null;
  newValue: string | null;
  detectedAt: string;
}

export async function fetchVerticalActivity(
  brands: { name: string; domain: string }[],
  limit = 12
): Promise<ActivityItem[]> {
  const supabase = createPublicClient();
  const domainToName = new Map(brands.map((b) => [normalizeDomain(b.domain), b.name]));

  const { data: stores } = await supabase
    .from("stores").select("id, store_url").in("store_url", [...domainToName.keys()]);
  if (!stores || stores.length === 0) return [];
  const storeIdToDomain = new Map(stores.map((s) => [s.id, normalizeDomain(s.store_url)]));

  const { data: changes } = await supabase
    .from("product_changes")
    .select("store_id, change_type, product_title, old_value, new_value, detected_at")
    .in("store_id", stores.map((s) => s.id))
    .order("detected_at", { ascending: false })
    .limit(limit);
  if (!changes) return [];

  return changes.map((c: any) => {
    const domain = storeIdToDomain.get(c.store_id) || "";
    return {
      brand: domainToName.get(domain) || domain,
      domain,
      changeType: c.change_type,
      productTitle: c.product_title,
      oldValue: c.old_value,
      newValue: c.new_value,
      detectedAt: c.detected_at,
    };
  });
}

// ── Real per-vertical product totals (for the index + market pages) ─────────
// Index/market pages otherwise sum static "—" counts → 0. This aggregates the
// latest product_fetches.total_products per store, mapped to its vertical.
export interface LiveCounts {
  byDomain: Map<string, number>; // normalized domain -> latest product count
  byVertical: Map<string, { total: number; brandsWithData: number }>;
}

export async function fetchLiveCounts(): Promise<LiveCounts> {
  const supabase = createPublicClient();

  const domainToVertical = new Map<string, string>();
  for (const v of VERTICALS) for (const b of v.brands) domainToVertical.set(normalizeDomain(b.domain), v.label);

  const stores = await pageAll<{ id: string; store_url: string }>((from, to) =>
    supabase.from("stores").select("id, store_url").range(from, to)
  );
  const storeIdToDomain = new Map(stores.map((s) => [s.id, normalizeDomain(s.store_url)]));

  const fetches = await pageAll<{ store_id: string; total_products: number | null }>((from, to) =>
    supabase.from("product_fetches").select("store_id, total_products, fetched_at")
      .order("fetched_at", { ascending: false }).range(from, to)
  );
  const latestByStore = new Map<string, number>();
  for (const f of fetches) if (!latestByStore.has(f.store_id)) latestByStore.set(f.store_id, f.total_products || 0);

  // Big stores (hit the 5,000-page cap) get an exact products-table count so
  // their full deep-scraped catalog shows instead of the capped total_products.
  const bigStoreIds = [...latestByStore.entries()].filter(([, c]) => c >= 5000).map(([id]) => id);
  for (let i = 0; i < bigStoreIds.length; i += 25) {
    await Promise.all(
      bigStoreIds.slice(i, i + 25).map(async (id) => {
        const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("store_id", id);
        if (count != null) latestByStore.set(id, count);
      })
    );
  }

  const byDomain = new Map<string, number>();
  const byVertical = new Map<string, { total: number; brandsWithData: number }>();
  for (const [storeId, count] of latestByStore) {
    const domain = storeIdToDomain.get(storeId) || "";
    byDomain.set(domain, Math.max(byDomain.get(domain) || 0, count));
    const vertical = domainToVertical.get(domain);
    if (!vertical) continue;
    const cur = byVertical.get(vertical) || { total: 0, brandsWithData: 0 };
    cur.total += count;
    if (count > 0) cur.brandsWithData += 1;
    byVertical.set(vertical, cur);
  }
  return { byDomain, byVertical };
}

// ── Real headline stats for marketing pages (homepage, /reports, hero lines) ─
export interface HeadlineStats {
  totalProducts: number;
  liveBrands: number;
  totalBrands: number;
  verticals: number;
}

export async function fetchHeadlineStats(): Promise<HeadlineStats> {
  const { byDomain, byVertical } = await fetchLiveCounts();
  let totalProducts = 0;
  for (const c of byVertical.values()) totalProducts += c.total;
  let liveBrands = 0;
  for (const c of byDomain.values()) if (c > 0) liveBrands++;
  const totalBrands = VERTICALS.reduce((n, v) => n + v.brands.length, 0);
  return { totalProducts, liveBrands, totalBrands, verticals: VERTICALS.length };
}
