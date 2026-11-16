import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { normalizeDomainInput, probeShopify, isValidEmail, storeUrlVariants } from "@/lib/snapshotRequest";

export const maxDuration = 30;

// Limits. Whoever asks, we cap what the form can cause per rolling 24h.
const GLOBAL_REQUESTS_PER_DAY = 200; // queued + added requests, all visitors
const GLOBAL_NEW_STORES_PER_DAY = 60; // brand-new stores actually added (auto-add mode)
const PER_IP_PER_HOUR = 5;
const PER_EMAIL_PER_DAY = 3;
const SLACK_PINGS_PER_HOUR = 20;

// Visitor-added stores are scraped into the SHARED products tables. Until the
// ownership triggers in scripts/launch-fixes.sql are live (and the scrape worker
// pins resolved IPs too), a hostile site could return another brand's product
// ids and overwrite that brand's rows. So auto-adding is OFF unless
// SNAPSHOT_AUTO_ADD=1; by default requests are logged and the team is pinged.
const AUTO_ADD = process.env.SNAPSHOT_AUTO_ADD === "1";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { sb: createClient(url, key, { auth: { persistSession: false } }), url, key };
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

// Client IP from headers the platform sets itself. On Vercel x-real-ip and
// x-vercel-forwarded-for are written by the edge and cannot be forged by the
// caller; the leftmost x-forwarded-for entry can be, so it is only used as the
// last resort and we take the LAST hop (added by the nearest proxy), not the first.
function clientIp(request: Request): string {
  const h = request.headers;
  const direct = h.get("x-real-ip") || h.get("x-vercel-forwarded-for");
  if (direct) return direct.split(",")[0].trim();
  const xff = (h.get("x-forwarded-for") || "").split(",").map((x) => x.trim()).filter(Boolean);
  return xff[xff.length - 1] || "unknown";
}

// Strip Slack mrkdwn and link syntax so submitted text cannot inject formatting or links.
function slackSafe(text: string): string {
  return text.replace(/[<>&*_~`|\\]/g, "").slice(0, 120);
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

async function ping(url: string, key: string, title: string, message: string, data: Record<string, string>) {
  try {
    await fetch(`${url}/functions/v1/send-slack-notification`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ type: "store_added", title, message, data, severity: "success" }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    /* best effort */
  }
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
  if (typeof body?.company === "string" && body.company.trim() !== "") return json({ status: "queued", domain: "" });

  const domain = normalizeDomainInput(body?.domain);
  if (!domain) return json({ error: "That does not look like a store domain. Try something like brand.com" }, 400);
  if (!isValidEmail(body?.email)) return json({ error: "Please enter a valid email so we can send your snapshot link" }, 400);
  const email = body.email.trim().toLowerCase();

  const a = admin();
  if (!a) return json({ error: "Requests are not switched on yet. Please try again shortly." }, 503);
  const { sb, url, key } = a;

  const ipHash = createHash("sha256").update(clientIp(request)).digest("hex").slice(0, 32);
  const dayAgo = new Date(Date.now() - 864e5).toISOString();
  const hourAgo = new Date(Date.now() - 36e5).toISOString();

  // Already tracked? No scrape needed and nothing to log: send them to the buy button.
  const existing = await findStore(sb, domain);
  if (existing) {
    const products = await latestProductCount(sb, existing.id);
    const stored = existing.store_url.replace(/^https?:\/\//, "").replace(/^www\./, "");
    return json({ status: products > 0 ? "tracked" : "added", domain: stored });
  }

  // ---- Limits. These read the requests table, so in queue mode (where the
  // table is the only record and the only cap) a missing table fails CLOSED. ----
  const ipQ = await sb.from("snapshot_requests").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", hourAgo);
  const emQ = await sb.from("snapshot_requests").select("id", { count: "exact", head: true }).eq("email", email).gte("created_at", dayAgo);
  const allQ = await sb.from("snapshot_requests").select("id", { count: "exact", head: true }).in("status", ["queued", "added"]).gte("created_at", dayAgo);
  // Fail CLOSED: if any limit query errors for ANY reason (missing table, timeout,
  // permissions) we cannot enforce the caps, so refuse rather than let it through.
  // (HEAD count queries return no error body, so we cannot rely on an error code.)
  const missing = !!(ipQ.error || emQ.error || allQ.error) || ipQ.count == null || emQ.count == null || allQ.count == null;
  if (missing) {
    return json({ error: "Brand requests are not switched on yet. Please check back shortly." }, 503);
  }
  if ((ipQ.count || 0) >= PER_IP_PER_HOUR) return json({ error: "Too many requests from your connection. Please try again in an hour." }, 429);
  if ((emQ.count || 0) >= PER_EMAIL_PER_DAY) return json({ error: "You have reached today's request limit. Please try again tomorrow." }, 429);
  if ((allQ.count || 0) >= GLOBAL_REQUESTS_PER_DAY) return json({ error: "We have had a lot of requests today. Please try again tomorrow." }, 429);
  if (AUTO_ADD) {
    const { count: newToday } = await sb.from("stores").select("id", { count: "exact", head: true }).gte("created_at", dayAgo);
    if ((newToday || 0) >= GLOBAL_NEW_STORES_PER_DAY) return json({ error: "We are adding a lot of brands today. Please try again tomorrow." }, 429);
  }

  // Must be a real Shopify store, otherwise there is nothing to snapshot.
  const shopify = await probeShopify(domain);
  if (!shopify) {
    await sb.from("snapshot_requests").insert({ domain, email, ip_hash: ipHash, is_shopify: false, status: "not_shopify" });
    return json({ status: "not_shopify" });
  }

  // Slack only for the first few requests each hour so a flood cannot spam the channel.
  const { count: pingedLastHour } = await sb.from("snapshot_requests").select("id", { count: "exact", head: true }).in("status", ["queued", "added"]).gte("created_at", hourAgo);
  const canPing = (pingedLastHour || 0) < SLACK_PINGS_PER_HOUR;

  if (!AUTO_ADD) {
    await sb.from("snapshot_requests").insert({ domain, email, ip_hash: ipHash, is_shopify: true, status: "queued" });
    if (canPing) await ping(url, key, "Snapshot requested: brand needs adding", `${slackSafe(email)} asked for ${slackSafe(domain)}`, { domain, email: slackSafe(email) });
    return json({ status: "queued", domain });
  }

  const { data: created, error: insErr } = await sb.from("stores").insert({ store_url: domain, store_name: domain }).select("id").single();
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
  if (canPing) await ping(url, key, "Snapshot requested for an unlisted brand", `${slackSafe(email)} asked for ${slackSafe(domain)}`, { domain, email: slackSafe(email) });

  return json({ status: "added", domain });
}
