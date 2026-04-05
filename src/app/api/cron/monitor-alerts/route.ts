import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This runs on a Vercel Cron schedule (see vercel.json)
// It triggers the Supabase monitor-alerts edge function which:
// 1. Checks all users with active price alerts
// 2. Compares current prices with stored prices
// 3. Detects new products since last scrape
// 4. Creates product_alert records
// 5. Sends email notifications via Resend
// 6. Sends Slack notifications

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (not a random visitor)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Also allow if no CRON_SECRET is set (dev mode)
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

    // Call the Supabase edge function using the service role key
    const response = await fetch(
      `${supabaseUrl}/functions/v1/monitor-alerts`,
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
      console.error("[CRON] monitor-alerts failed:", data);
      return NextResponse.json(
        { error: "Monitor alerts failed", detail: data },
        { status: response.status }
      );
    }

    console.log("[CRON] monitor-alerts completed:", data);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: data,
    });
  } catch (error) {
    console.error("[CRON] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
