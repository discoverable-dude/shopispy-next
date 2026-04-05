import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { VERTICALS } from "@/lib/brands";
import { getTopBrands } from "@/lib/brandUtils";

// Returns live intelligence data — merges real Supabase data with static brand database
export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch recent scrapes from Supabase
    const { data: recentScrapes } = await supabase
      .from("user_scrapes")
      .select("store_url, total_products, scrape_date")
      .order("scrape_date", { ascending: false })
      .limit(50);

    // Fetch recent alerts
    const { data: recentAlerts } = await supabase
      .from("product_alerts")
      .select("store_url, alert_type, product_title, created_at, old_value, new_value")
      .order("created_at", { ascending: false })
      .limit(20);

    // Fetch total store count
    const { count: totalStores } = await supabase
      .from("stores")
      .select("id", { count: "exact", head: true });

    // Fetch total product count
    const { count: totalProducts } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true });

    // Fetch total scrape count
    const { count: totalScrapes } = await supabase
      .from("user_scrapes")
      .select("id", { count: "exact", head: true });

    // Fetch total alert count
    const { count: totalAlerts } = await supabase
      .from("product_alerts")
      .select("id", { count: "exact", head: true });

    // Build response with real + static data
    return NextResponse.json({
      // Real DB stats (fallback to static if empty)
      stats: {
        trackedStores: totalStores || VERTICALS.reduce((s, v) => s + v.brands.length, 0),
        totalProducts: totalProducts || 0,
        totalScrapes: totalScrapes || 0,
        totalAlerts: totalAlerts || 0,
      },
      // Recent real activity
      recentScrapes: recentScrapes || [],
      recentAlerts: (recentAlerts || []).map((a) => ({
        storeUrl: a.store_url,
        type: a.alert_type,
        product: a.product_title,
        oldValue: a.old_value,
        newValue: a.new_value,
        time: a.created_at,
      })),
      // Static brand highlights per vertical
      verticalHighlights: VERTICALS.map((v) => ({
        id: v.id,
        label: v.label,
        brandCount: v.brands.length,
        topBrands: getTopBrands(v, 3).map((b) => ({
          name: b.name,
          domain: b.domain,
          products: b.products,
        })),
      })),
    });
  } catch (error) {
    console.error("Intelligence API error:", error);
    // Fallback to static data on error
    return NextResponse.json({
      stats: {
        trackedStores: VERTICALS.reduce((s, v) => s + v.brands.length, 0),
        totalProducts: 0,
        totalScrapes: 0,
        totalAlerts: 0,
      },
      recentScrapes: [],
      recentAlerts: [],
      verticalHighlights: VERTICALS.map((v) => ({
        id: v.id,
        label: v.label,
        brandCount: v.brands.length,
        topBrands: getTopBrands(v, 3).map((b) => ({
          name: b.name,
          domain: b.domain,
          products: b.products,
        })),
      })),
    });
  }
}
