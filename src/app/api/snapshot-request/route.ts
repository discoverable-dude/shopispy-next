import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { normalizeDomainInput, probeShopify, isValidEmail, storeUrlVariants } from "@/lib/snapshotRequest";

export const maxDuration = 30;

// Max brand-new stores we will add per rolling 24h, whoever asks. Protects the
// scraper and database from someone submitting thousands of domains.
const GLOBAL_NEW_STORES_PER_DAY = 60;
const PER_IP_PER_HOUR = 5;
const PER_EMAIL_PER_DAY = 3;

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { sb: createClient(url, key, { auth: { persistSession: false } }), url, key };
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

// The snapshot_requests table is optional (scripts/snapshot-requests.sql). If it
// has not been created yet we carry on without logging or per-IP/email limits.
function tableMissing(err: any): boolean {
  return !!err && (err.code === "42P01" || err.code === "PGRST205" || /snapshot_requests/.test(err.message || ""));
}

async function findStore(sb: any, domain: string) {
  const { data } = await sb.from("stores").select("id, store_url").in("store_url", storeUrlVariants(domain)).limit(1);
  return data?.[0] || null;
}

async function latestProductCount(sb: any, storeId: string): Promise<number> {
  const { data } = await sb
    .from("product_fetches")
    .select("total_products")
    .eq("store_id", storeId)
    .order("fetched_at", { ascending: false })
    .limit(1);
  return data?.[0]?.total_products || 0;
}

// Poll target for the form: has this store's first scrape landed yet?
export async function GET(request: Request) {
  const domain = normalizeDomainInput(new URL(request.url).searchParams.get("domain") || "");
  if (!domain) return json({ error: "Invalid domain" }, 400);
  const a = admin();
  if (!a) return json({ error: "Not configured" }, 503);
  const store = await findStore(a.sb, domain);
  if (!store) return json({ ready: false, products: 0 });
  const products = await latestProductCount(a.sb, store.id);
  return json({ ready: products > 0, products, domain: store.store_url.replace(/^https?:\/\//, "").replace(/^www\./, "") });
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  // Honeypot: real people never fill this hidden field. Pretend success.
  if (typeof body?.company === "string" && body.company.trim() !== "") return json({ status: "added", domain: "" });

  const domain = normalizeDomainInput(body?.domain);
  if (!domain) return json({ error: "That does not look like a store domain. Try something like brand.com" }, 400);
  if (!isValidEmail(body?.email)) return json({ error: "Please enter a valid email so we can send your snapshot link" }, 400);
  const email = body.email.trim().toLowerCase();

  const a = admin();
  if (!a) return json({ error: "Requests are not switched on yet. Please try again shortly." }, 503);
  const { sb, url, key } = a;

  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 32);

  // Already tracked? Then no scrape is needed, send them straight to the buy button.
  const existing = await findStore(sb, domain);
  if (existing) {
    const products = await latestProductCount(sb, existing.id);
    const stored = existing.store_url.replace(/^https?:\/\//, "").replace(/^www\./, "");
    await sb.from("snapshot_requests").insert({ domain, email, ip_hash: ipHash, already_tracked: true, store_id: existing.id, is_shopify: true, status: "tracked" });
    return json({ status: products > 0 ? "tracked" : "added", domain: stored });
  }

  // Rate limits (global cap always; per-IP and per-email when the table exists).
  const dayAgo = new Date(Date.now() - 864e5).toISOString();
  const hourAgo = new Date(Date.now() - 36e5).toISOString();
  const { count: newToday } = await sb.from("stores").select("id", { count: "exact", head: true }).gte("created_at", dayAgo);
  if ((newToday || 0) >= GLOBAL_NEW_STORES_PER_DAY) {
    return json({ error: "We are adding a lot of brands today. Please try again tomorrow." }, 429);
  }
  const ipQ = await sb.from("snapshot_requests").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", hourAgo);
  if (!tableMissing(ipQ.error) && (ipQ.count || 0) >= PER_IP_PER_HOUR) {
    return json({ error: "Too many requests from your connection. Please try again in an hour." }, 429);
  }
  const emQ = await sb.from("snapshot_requests").select("id", { count: "exact", head: true }).eq("email", email).gte("created_at", dayAgo);
  if (!tableMissing(emQ.error) && (emQ.count || 0) >= PER_EMAIL_PER_DAY) {
    return json({ error: "You have reached today's request limit. Please try again tomorrow." }, 429);
  }

  // Must be a real Shopify store, otherwise there is nothing to snapshot.
  const shopify = await probeShopify(domain);
  if (!shopify) {
    await sb.from("snapshot_requests").insert({ domain, email, ip_hash: ipHash, is_shopify: false, status: "not_shopify" });
    return json({ status: "not_shopify" });
  }

  const { data: created, error: insErr } = await sb
    .from("stores")
    .insert({ store_url: domain, store_name: domain })
    .select("id")
    .single();
  let storeId: string | null = created?.id || null;
  if (insErr) {
    // Unique race: someone else added it a moment ago.
    const again = await findStore(sb, domain);
    storeId = again?.id || null;
    if (!storeId) return json({ error: "Could not add that store. Please try again." }, 500);
  }

  // Kick off the first scrape. The worker acknowledges immediately and keeps going in the background.
  let scrapeStarted = false;
  try {
    const res = await fetch(`${url}/functions/v1/scheduled-scrape`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ store_id: storeId }),
      signal: AbortSignal.timeout(10000),
    });
    scrapeStarted = res.ok;
  } catch {
    scrapeStarted = false;
  }

  await sb.from("snapshot_requests").insert({
    domain, email, ip_hash: ipHash, is_shopify: true, store_id: storeId, status: "added",
    notes: scrapeStarted ? null : "scrape trigger failed, daily cron will pick it up",
  });

  // Tell the team (best effort): every request is a demand signal.
  fetch(`${url}/functions/v1/send-slack-notification`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "store_added",
      title: "Snapshot requested for an unlisted brand",
      message: `${email} asked for ${domain}`,
      data: { domain, email },
      severity: "success",
    }),
  }).catch(() => {});

  return json({ status: "added", domain });
}
