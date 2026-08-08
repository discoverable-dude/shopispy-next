import { createPublicClient } from "@/lib/supabase/public";

function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}
function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Full product-level catalog export for one brand (the "Company Snapshot").
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domainParam = searchParams.get("domain");
  if (!domainParam) return new Response("domain query param required", { status: 400 });

  const d = normalizeDomain(domainParam);
  const supabase = createPublicClient();

  const { data: store } = await supabase
    .from("stores").select("id").eq("store_url", d).limit(1).maybeSingle();
  if (!store) return new Response("Store not found", { status: 404 });

  const cols = ["Product", "Category", "Vendor", "Tags", "From Price", "Compare At Price", "On Sale", "In Stock", "URL", "Image", "First Seen", "Last Updated"];
  const rows: string[] = [cols.join(",")];

  for (let from = 0; ; from += 1000) {
    const { data } = await supabase
      .from("products")
      .select("title, handle, product_type, vendor, tags, created_at, updated_at, product_variants(price, compare_at_price, available), product_images(src)")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false, nullsFirst: false })
      .range(from, from + 999);
    if (!data || data.length === 0) break;

    for (const p of data as any[]) {
      const prices = (p.product_variants || []).map((v: any) => v.price).filter((x: any) => x != null);
      const comps = (p.product_variants || []).map((v: any) => v.compare_at_price).filter((x: any) => x != null);
      const price = prices.length ? Math.min(...prices) : null;
      const comp = comps.length ? Math.max(...comps) : null;
      const onSale = price != null && comp != null && comp > price;
      const inStock = (p.product_variants || []).some((v: any) => v.available);
      rows.push([
        p.title, p.product_type, p.vendor, (p.tags || []).join("; "),
        price ?? "", comp ?? "", onSale ? "Yes" : "No", inStock ? "Yes" : "No",
        `https://${d}/products/${p.handle}`, p.product_images?.[0]?.src || "",
        p.created_at || "", p.updated_at || "",
      ].map(csvCell).join(","));
    }
    if (data.length < 1000) break;
  }

  const filename = `shopispy-${d.replace(/[^a-z0-9]+/gi, "-")}-catalog.csv`;
  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
