import { NextResponse } from "next/server";
import { VERTICALS, ALL_BRANDS, TOTAL_PRODUCTS } from "@/lib/brands";
import { getVerticalStats, getTopBrands, categoriseChange, getChangeTypeLabel, getProductCount } from "@/lib/brandUtils";

// Generate a CSV benchmark report for a given vertical (or all)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const verticalId = searchParams.get("vertical"); // optional filter
  const format = searchParams.get("format") || "csv";

  const verticals = verticalId
    ? VERTICALS.filter((v) => v.id === verticalId)
    : VERTICALS;

  if (verticals.length === 0) {
    return NextResponse.json({ error: "Vertical not found" }, { status: 404 });
  }

  if (format === "csv") {
    const rows: string[] = [
      "Industry,Brand,Domain,Products,Last Update,Latest Change,Change Type",
    ];

    for (const v of verticals) {
      for (const brand of v.brands) {
        const changeType = getChangeTypeLabel(categoriseChange(brand.latestChange));
        rows.push(
          [
            v.label,
            `"${brand.name}"`,
            brand.domain,
            brand.products.replace(/,/g, ""),
            brand.lastUpdate,
            `"${brand.latestChange}"`,
            changeType,
          ].join(",")
        );
      }
    }

    const csv = rows.join("\n");
    const filename = verticalId
      ? `shopispy-${verticalId}-benchmark.csv`
      : "shopispy-full-benchmark.csv";

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  // JSON summary report
  const report = {
    generated: new Date().toISOString(),
    totalBrands: ALL_BRANDS.length,
    totalProducts: TOTAL_PRODUCTS,
    verticals: verticals.map((v) => {
      const stats = getVerticalStats(v);
      const top10 = getTopBrands(v, 10);
      const changeCounts: Record<string, number> = {};
      v.brands.forEach((b) => {
        const type = getChangeTypeLabel(categoriseChange(b.latestChange));
        changeCounts[type] = (changeCounts[type] || 0) + 1;
      });

      return {
        id: v.id,
        name: v.label,
        brandCount: v.brands.length,
        totalProducts: stats.total,
        avgProductsPerStore: stats.avg,
        maxProducts: stats.max,
        minProducts: stats.min,
        recentlyActive: stats.recentlyUpdated,
        activityBreakdown: changeCounts,
        top10: top10.map((b) => ({
          name: b.name,
          domain: b.domain,
          products: getProductCount(b),
          lastUpdate: b.lastUpdate,
          latestChange: b.latestChange,
        })),
      };
    }),
  };

  return NextResponse.json(report);
}
