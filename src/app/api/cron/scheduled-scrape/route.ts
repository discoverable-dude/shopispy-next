import { NextResponse } from "next/server";

// Runs on a Vercel Cron schedule (see vercel.json). Invokes the Supabase
// `scheduled-scrape` edge function which fetches /products.json for every
// tracked store, diffs the catalog, and writes product_changes,
// price_history, and inventory_history rows.
//
// The underlying edge function is idempotent: running it twice in a row is
// safe (the diff produces no new change rows), so coexisting with a Supabase
// pg_cron job is harmless — it just wastes Shopify /products.json requests.
// Disable one side once you've confirmed the other runs reliably.

// Scraping 600+ stores can exceed the default 10s serverless timeout.
export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      console.error("[CRON] SUPABASE_SERVICE_ROLE_KEY not set");
      return NextResponse.json(
        { error: "Service role key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/scheduled-scrape`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[CRON] scheduled-scrape failed:", data);
      return NextResponse.json(
        { error: "Scheduled scrape failed", detail: data },
        { status: response.status }
      );
    }

    console.log("[CRON] scheduled-scrape completed:", data);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: data,
    });
  } catch (error) {
    console.error("[CRON] Unexpected error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
