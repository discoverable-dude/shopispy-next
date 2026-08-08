import { VERTICALS } from "@/lib/brands";
import { slugify } from "@/lib/brandUtils";
import { fetchStatsForDomains } from "@/lib/brandStats";

function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}
function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Per-brand benchmark for a whole vertical (the "Industry Snapshot").
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const vertical = VERTICALS.find((v) => slugify(v.label) === slug || v.id === slug);
  if (!vertical) return new Response("Industry not found", { status: 404 });

  const statsMap = await fetchStatsForDomains(vertical.brands.map((b) => b.domain));

  const cols = ["Brand", "Domain", "Products", "Last Updated", "Latest Change"];
  const rows = vertical.brands.map((b) => {
    const s = statsMap.get(normalizeDomain(b.domain)) || { productCount: 0, lastFetchedAt: null, latestChange: null };
    const change = s.latestChange
      ? `${s.latestChange.change_type}${s.latestChange.product_title ? `: ${s.latestChange.product_title}` : ""}`
      : "";
    return { name: b.name, domain: b.domain, count: s.productCount, last: s.lastFetchedAt || "", change };
  }).sort((a, b) => b.count - a.count);

  const lines = [cols.join(",")];
  for (const r of rows) lines.push([r.name, r.domain, r.count, r.last, r.change].map(csvCell).join(","));

  const filename = `shopispy-${slugify(vertical.label)}-industry-benchmark.csv`;
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
