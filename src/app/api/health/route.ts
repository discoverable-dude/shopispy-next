import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Health check route — verifies all service connections
// GET /api/health

export async function GET() {
  const checks: Record<string, { status: string; detail?: string }> = {};

  // 1. Supabase connection
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      checks.supabase = { status: "error", detail: "Missing env vars" };
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { count, error } = await supabase
        .from("stores")
        .select("id", { count: "exact", head: true });
      if (error) {
        checks.supabase = { status: "error", detail: error.message };
      } else {
        checks.supabase = { status: "ok", detail: `${count} stores in DB` };
      }
    }
  } catch (e: any) {
    checks.supabase = { status: "error", detail: e.message };
  }

  // 2. Supabase Service Role (needed for cron + admin)
  checks.serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? { status: "ok", detail: "Configured" }
    : { status: "missing", detail: "SUPABASE_SERVICE_ROLE_KEY not set — cron and admin won't work" };

  // 3. Stripe
  checks.stripe = process.env.STRIPE_SECRET_KEY
    ? { status: "ok", detail: "STRIPE_SECRET_KEY configured" }
    : { status: "missing", detail: "STRIPE_SECRET_KEY not set — payments won't work" };

  checks.stripeWebhook = process.env.STRIPE_WEBHOOK_SECRET
    ? { status: "ok", detail: "STRIPE_WEBHOOK_SECRET configured" }
    : { status: "missing", detail: "STRIPE_WEBHOOK_SECRET not set — webhooks won't verify" };

  // 4. Cron secret
  checks.cronSecret = process.env.CRON_SECRET
    ? { status: "ok", detail: "CRON_SECRET configured" }
    : { status: "missing", detail: "CRON_SECRET not set — cron endpoint unprotected" };

  // 5. Admin setup key
  checks.adminSetup = process.env.ADMIN_SETUP_KEY
    ? { status: "ok", detail: "ADMIN_SETUP_KEY configured" }
    : { status: "missing", detail: "ADMIN_SETUP_KEY not set — /api/admin/setup disabled" };

  // 6. Supabase edge functions reachable
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (url) {
      const resp = await fetch(`${url}/functions/v1/check-subscription`, {
        method: "OPTIONS",
      });
      checks.edgeFunctions = { status: "ok", detail: `Reachable (${resp.status})` };
    }
  } catch (e: any) {
    checks.edgeFunctions = { status: "error", detail: e.message };
  }

  // Overall status
  const allOk = Object.values(checks).every((c) => c.status === "ok");
  const hasCritical = Object.values(checks).some((c) => c.status === "error");

  return NextResponse.json({
    status: hasCritical ? "unhealthy" : allOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    checks,
    envSummary: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "missing",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "missing",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "set" : "missing",
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "set" : "missing",
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? "set" : "missing",
      CRON_SECRET: process.env.CRON_SECRET ? "set" : "missing",
      ADMIN_SETUP_KEY: process.env.ADMIN_SETUP_KEY ? "set" : "missing",
    },
  });
}
