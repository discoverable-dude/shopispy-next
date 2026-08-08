import { VERTICALS } from "@/lib/brands";
import { fetchStatsForDomains } from "@/lib/brandStats";
import { fetchBrandBenchmarks } from "@/lib/productData";
import { hasPaidForReport } from "@/lib/stripe";

// The whole-market benchmark can touch every tracked brand, so give it room.
export const maxDuration = 120;

function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}
function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Every brand across every vertical, benchmarked (the "Complete Market Report").
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Paywall: require a paid Stripe session for the market report, or an admin key.
  const adminKey = process.env.ADMIN_SETUP_KEY;
  const isAdmin = adminKey && searchParams.get("key") === adminKey;
  if (!isAdmin && !(await hasPaidForReport(searchParams.get("session_id"), "market", "all"))) {
    return new Response("Payment required — purchase this report to download.", { status: 402 });
  }

  // Flatten every brand once, keeping its vertical label alongside.
  const allBrands = VERTICALS.flatMap((v) =>
    v.brands.map((b) => ({ vertical: v.label, name: b.name, domain: b.domain })),
  );
  const domains = allBrands.map((b) => b.domain);

  const [statsMap, benchmarks] = await Promise.all([
    fetchStatsForDomains(domains),
    fetchBrandBenchmarks(allBrands.map((b) => ({ domain: b.domain }))),
  ]);

  const cols = ["Industry", "Brand", "Domain", "Products", "From Price", "Avg Price", "Highest Price", "On Sale %", "Top Category", "Last Updated", "Latest Change"];
  const rows = allBrands.map((b) => {
    const key = normalizeDomain(b.domain);
    const s = statsMap.get(key) || { productCount: 0, lastFetchedAt: null, latestChange: null };
    const bm = benchmarks.get(key) || { minPrice: null, avgPrice: null, maxPrice: null, onSalePct: 0, topCategory: "" };
    const change = s.latestChange
      ? `${s.latestChange.change_type}${s.latestChange.product_title ? `: ${s.latestChange.product_title}` : ""}`
      : "";
    return { vertical: b.vertical, name: b.name, domain: b.domain, count: s.productCount, bm, last: s.lastFetchedAt || "", change };
  }).sort((a, b) => (a.vertical === b.vertical ? b.count - a.count : a.vertical.localeCompare(b.vertical)));

  const lines = [cols.join(",")];
  for (const r of rows) {
    lines.push([
      r.vertical, r.name, r.domain, r.count,
      r.bm.minPrice ?? "", r.bm.avgPrice ?? "", r.bm.maxPrice ?? "", r.bm.onSalePct, r.bm.topCategory,
      r.last, r.change,
    ].map(csvCell).join(","));
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="shopispy-complete-market-benchmark.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
