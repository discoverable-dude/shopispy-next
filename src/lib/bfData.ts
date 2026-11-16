// Live data for the /black-friday landing page. Everything here is read from
// the real tracking tables (no placeholders) and the page that calls it is ISR
// cached for an hour, so this runs at most once per hour per region.

import { createPublicClient } from "@/lib/supabase/public";
import { VERTICALS, ALL_BRANDS } from "@/lib/brands";
import { slugify } from "@/lib/brandUtils";
import { fetchHeadlineStats, fetchBrandBenchmarks } from "@/lib/productData";
import { fetchStatsForDomains } from "@/lib/brandStats";

function norm(d: string | null | undefined): string {
  return (d || "").toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "").trim();
}

const domainToVertical = new Map<string, string>();
const domainToBrand = new Map<string, { name: string; slug: string }>();
for (const v of VERTICALS) {
  for (const b of v.brands) {
    domainToVertical.set(norm(b.domain), v.label);
    domainToBrand.set(norm(b.domain), { name: b.name, slug: slugify(b.name) });
  }
}

export interface Mover {
  brand: string;
  slug: string | null;
  product: string;
  from: number;
  to: number;
  pct: number; // negative = drop
}
export interface CuttingBrand {
  brand: string;
  slug: string | null;
  domain: string;
  drops: number;
  avgCutPct: number;
}
export interface IndustryDiscount {
  label: string;
  slug: string;
  brands: number;
  onSalePct: number;
  avgDepth: number;
  sample: number;
}
export interface BrandPreviewRow {
  product: string;
  category: string;
  vendor: string;
  price: number | null;
  compareAt: number | null;
  onSale: boolean;
  inStock: boolean;
}
export interface IndustryPreviewRow {
  brand: string;
  products: number;
  minPrice: number | null;
  avgPrice: number | null;
  onSalePct: number;
  topCategory: string;
}

export interface BfData {
  generatedAt: string;
  totals: {
    brands: number;
    products: number;
    industries: number;
    variants: number | null;
    images: number | null;
    priceChanges: number | null;
  };
  discount: { sample: number; sampleStores: number; onSalePct: number; avgDepth: number };
  byIndustry: IndustryDiscount[];
  week: {
    priceChanges: number;
    drops: number;
    rises: number;
    newProducts: number | null;
    topDrops: Mover[];
    cutting: CuttingBrand[];
  };
  brandPreview: { brand: string; domain: string; totalRows: number; rows: BrandPreviewRow[] } | null;
  industryPreview: { label: string; brands: number; rows: IndustryPreviewRow[] } | null;
}

// Table row estimates (cheap, planner based). Null if the anon role can't see them.
async function estCount(sb: any, table: string): Promise<number | null> {
  try {
    const { count, error } = await sb.from(table).select("id", { count: "estimated", head: true });
    if (error || count == null) return null;
    return count;
  } catch {
    return null;
  }
}

async function loadStores(sb: any): Promise<{ id: string; store_url: string; created_at: string }[]> {
  const out: any[] = [];
  for (let from = 0; from < 5000; from += 1000) {
    const { data } = await sb.from("stores").select("id, store_url, created_at").range(from, from + 999);
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}

// Discount depth: stratified, deterministic sample of variants spread evenly
// across the whole id range (primary-key range scans, so each query is fast).
async function sampleDiscounts(sb: any, storeVertical: Map<string, string | null>) {
  const [lo, hi] = await Promise.all([
    sb.from("product_variants").select("id").order("id", { ascending: true }).limit(1),
    sb.from("product_variants").select("id").order("id", { ascending: false }).limit(1),
  ]);
  const min = Number(lo.data?.[0]?.id);
  const max = Number(hi.data?.[0]?.id);
  const empty = { sample: 0, sampleStores: 0, onSalePct: 0, avgDepth: 0, byVertical: new Map<string, { n: number; sale: number; depth: number }>() };
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return empty;

  const K = 80;
  const PER = 350;
  const starts = Array.from({ length: K }, (_, i) => Math.floor(min + ((i + 0.5) / K) * (max - min)));

  let n = 0, sale = 0, depthSum = 0;
  const stores = new Set<string>();
  const byVertical = new Map<string, { n: number; sale: number; depth: number }>();

  const CONC = 10;
  for (let i = 0; i < starts.length; i += CONC) {
    await Promise.all(
      starts.slice(i, i + CONC).map(async (start) => {
        const { data } = await sb
          .from("product_variants")
          .select("price, compare_at_price, products(store_id)")
          .gte("id", start)
          .order("id", { ascending: true })
          .limit(PER);
        for (const v of data || []) {
          const price = Number(v.price);
          if (!(price > 0)) continue;
          n++;
          const sid: string | undefined = v.products?.store_id;
          if (sid) stores.add(sid);
          const vert = sid ? storeVertical.get(sid) : null;
          const agg = vert ? byVertical.get(vert) || { n: 0, sale: 0, depth: 0 } : null;
          if (agg) agg.n++;
          const comp = Number(v.compare_at_price);
          if (comp > price) {
            const depth = ((comp - price) / comp) * 100;
            if (depth > 0 && depth <= 90) {
              sale++;
              depthSum += depth;
              if (agg) { agg.sale++; agg.depth += depth; }
            }
          }
          if (agg && vert) byVertical.set(vert, agg);
        }
      })
    );
  }
  return {
    sample: n,
    sampleStores: stores.size,
    onSalePct: n ? Math.round((sale / n) * 1000) / 10 : 0,
    avgDepth: sale ? Math.round((depthSum / sale) * 10) / 10 : 0,
    byVertical,
  };
}

// Price movement over the last 7 days, from the change log.
async function weekMovers(sb: any, storeDomain: Map<string, string>, freshStoreIds: Set<string>) {
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const rows: any[] = [];
  for (let page = 0; page < 25; page++) {
    const { data } = await sb
      .from("product_changes")
      .select("product_title, old_value, new_value, store_id")
      .eq("change_type", "price_change")
      .gte("detected_at", since)
      .order("detected_at", { ascending: false })
      .range(page * 1000, page * 1000 + 999);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < 1000) break;
  }

  let drops = 0, rises = 0;
  const best = new Map<string, Mover & { dom: string }>();
  const perStore = new Map<string, { drops: number; cutSum: number }>();
  for (const r of rows) {
    const from = parseFloat(r.old_value), to = parseFloat(r.new_value);
    if (!(from > 0) || !(to > 0) || from === to) continue;
    const pct = ((to - from) / from) * 100;
    if (pct < 0) drops++; else rises++;
    if (pct >= 0 || pct < -90 || from < 5) continue; // ignore anomalies and pennies
    const dom = storeDomain.get(r.store_id) || "";
    const brand = domainToBrand.get(dom);
    const key = `${dom}|${r.product_title}`;
    const prev = best.get(key);
    if (!prev || pct < prev.pct) {
      best.set(key, { dom, brand: brand?.name || dom, slug: brand?.slug || null, product: r.product_title || "", from, to, pct });
    }
    if (pct <= -5) {
      const s = perStore.get(r.store_id) || { drops: 0, cutSum: 0 };
      s.drops++; s.cutSum += pct;
      perStore.set(r.store_id, s);
    }
  }

  // Top drops: biggest first, at most 2 per brand so one sale cannot own the list.
  const perBrand = new Map<string, number>();
  const topDrops: Mover[] = [];
  for (const m of [...best.values()].filter((m) => m.pct <= -10).sort((a, b) => a.pct - b.pct)) {
    const c = perBrand.get(m.dom) || 0;
    if (c >= 2) continue;
    perBrand.set(m.dom, c + 1);
    const { dom: _d, ...rest } = m;
    topDrops.push(rest);
    if (topDrops.length >= 8) break;
  }

  // Only brands that are in our listed set, so every row can link to a real
  // brand page and buy button (stores added by visitors are excluded).
  const cutting: CuttingBrand[] = [...perStore.entries()]
    .filter(([sid, s]) => s.drops >= 3 && !freshStoreIds.has(sid) && domainToBrand.has(storeDomain.get(sid) || ""))
    .map(([sid, s]) => {
      const dom = storeDomain.get(sid) || "";
      const brand = domainToBrand.get(dom)!;
      return { brand: brand.name, slug: brand.slug, domain: dom, drops: s.drops, avgCutPct: Math.round(Math.abs(s.cutSum / s.drops)) };
    })
    .sort((a, b) => b.drops - a.drops)
    .slice(0, 8);

  // New products this week, excluding stores we only just started tracking
  // (their first scrape logs the whole catalogue as "new").
  let newProducts: number | null = null;
  try {
    const { count } = await sb
      .from("product_changes")
      .select("id", { count: "exact", head: true })
      .eq("change_type", "new_product")
      .gte("detected_at", since);
    if (count != null) newProducts = count;
    if (newProducts != null && freshStoreIds.size) {
      const { count: freshCount } = await sb
        .from("product_changes")
        .select("id", { count: "exact", head: true })
        .eq("change_type", "new_product")
        .gte("detected_at", since)
        .in("store_id", [...freshStoreIds]);
      newProducts = Math.max(0, newProducts - (freshCount || 0));
    }
  } catch {
    newProducts = null;
  }

  return { priceChanges: drops + rises, drops, rises, newProducts, topDrops, cutting };
}

// The page does a lot of work in parallel, so one query can transiently time
// out. Retry once rather than blanking a whole section.
async function withRetry<T>(fn: () => PromiseLike<{ data?: any; count?: number | null; error?: any }>, ok: (r: any) => boolean) {
  let r = await fn();
  if (!ok(r)) {
    await new Promise((res) => setTimeout(res, 400));
    r = await fn();
  }
  return r;
}

async function brandPreview(sb: any, domain: string, name: string) {
  const { data: store } = await sb.from("stores").select("id").eq("store_url", domain).limit(1).maybeSingle();
  if (!store) return null;
  const [rowsRes, countRes] = await Promise.all([
    withRetry(
      () =>
        sb.from("products")
          .select("title, product_type, vendor, product_variants(price, compare_at_price, available)")
          .eq("store_id", store.id)
          .order("updated_at", { ascending: false, nullsFirst: false })
          .limit(6),
      (r) => !r.error && (r.data || []).length > 0
    ),
    withRetry(
      () => sb.from("products").select("id", { count: "exact", head: true }).eq("store_id", store.id),
      (r) => !r.error && r.count != null
    ),
  ]);
  const rows: BrandPreviewRow[] = (rowsRes.data || []).map((p: any) => {
    const prices = (p.product_variants || []).map((v: any) => v.price).filter((x: any) => x != null);
    const comps = (p.product_variants || []).map((v: any) => v.compare_at_price).filter((x: any) => x != null);
    const price = prices.length ? Math.min(...prices) : null;
    const compareAt = comps.length ? Math.max(...comps) : null;
    return {
      product: p.title,
      category: p.product_type || "",
      vendor: p.vendor || "",
      price,
      compareAt,
      onSale: price != null && compareAt != null && compareAt > price,
      inStock: (p.product_variants || []).some((v: any) => v.available),
    };
  });
  if (rows.length === 0) return null; // never show an empty "sample"
  return { brand: name, domain, totalRows: countRes.count || rows.length, rows };
}

async function industryPreview(label: string) {
  const v = VERTICALS.find((x) => x.label === label);
  if (!v) return null;
  const candidates = v.brands.slice(0, 14);
  const [stats, bench] = await Promise.all([
    fetchStatsForDomains(candidates.map((b) => b.domain)),
    fetchBrandBenchmarks(candidates.map((b) => ({ domain: b.domain }))),
  ]);
  const rows: IndustryPreviewRow[] = candidates
    .map((b) => {
      const k = norm(b.domain);
      const s = stats.get(k);
      const bm = bench.get(k);
      return {
        brand: b.name,
        products: s?.productCount || 0,
        minPrice: bm?.minPrice ?? null,
        avgPrice: bm?.avgPrice ?? null,
        onSalePct: bm?.onSalePct ?? 0,
        topCategory: bm?.topCategory || "",
      };
    })
    .filter((r) => r.products > 0 && r.avgPrice != null)
    .sort((a, b) => b.products - a.products)
    .slice(0, 6);
  return { label, brands: v.brands.length, rows };
}

export async function fetchBlackFridayData(): Promise<BfData> {
  const sb: any = createPublicClient();

  const stores = await loadStores(sb);
  const storeDomain = new Map<string, string>(stores.map((s) => [s.id, norm(s.store_url)]));
  const storeVertical = new Map<string, string | null>(stores.map((s) => [s.id, domainToVertical.get(norm(s.store_url)) || null]));
  const weekAgo = Date.now() - 7 * 864e5;
  const freshStoreIds = new Set(stores.filter((s) => new Date(s.created_at).getTime() > weekAgo).map((s) => s.id));

  const [headline, disc, week, variants, images, changes, bPrev, iPrev] = await Promise.all([
    fetchHeadlineStats(),
    sampleDiscounts(sb, storeVertical),
    weekMovers(sb, storeDomain, freshStoreIds),
    estCount(sb, "product_variants"),
    estCount(sb, "product_images"),
    estCount(sb, "product_changes"),
    brandPreview(sb, "aloyoga.com", "Alo Yoga").catch(() => null),
    industryPreview("Fashion").catch(() => null),
  ]);

  const byIndustry: IndustryDiscount[] = VERTICALS.map((v) => {
    const a = disc.byVertical.get(v.label);
    return {
      label: v.label,
      slug: slugify(v.label),
      brands: v.brands.length,
      onSalePct: a && a.n ? Math.round((a.sale / a.n) * 1000) / 10 : 0,
      avgDepth: a && a.sale ? Math.round((a.depth / a.sale) * 10) / 10 : 0,
      sample: a?.n || 0,
    };
  }).sort((a, b) => b.avgDepth - a.avgDepth);

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      brands: headline.totalBrands,
      products: headline.totalProducts,
      industries: headline.verticals,
      variants,
      images,
      priceChanges: changes,
    },
    discount: { sample: disc.sample, sampleStores: disc.sampleStores, onSalePct: disc.onSalePct, avgDepth: disc.avgDepth },
    byIndustry,
    week,
    brandPreview: bPrev,
    industryPreview: iPrev,
  };
}

// Plain list for the client-side brand search.
export const PICKER_BRANDS = ALL_BRANDS.map((b) => ({ name: b.name, domain: norm(b.domain), industry: b.vertical.label }));
