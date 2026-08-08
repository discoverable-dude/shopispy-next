#!/usr/bin/env node
// Smoke test for a ShopiSpy Next deployment.
//
//   BASE_URL=https://<preview>.vercel.app \
//   CRON_SECRET=<secret> \
//   node scripts/smoke.mjs
//
// Exits non-zero on first failure. Does NOT test Stripe / email / OAuth —
// those require real user flows, see DEPLOYMENT.md § 3.

const BASE_URL = process.env.BASE_URL?.replace(/\/$/, "");
const CRON_SECRET = process.env.CRON_SECRET;

if (!BASE_URL) {
  console.error("✗ BASE_URL not set. Example: BASE_URL=https://shopispy-next-abc.vercel.app");
  process.exit(2);
}
if (!CRON_SECRET) {
  console.error("✗ CRON_SECRET not set. Grab it from Vercel env vars.");
  process.exit(2);
}

let failed = 0;
const results = [];

async function check(name, fn) {
  process.stdout.write(`  ${name} ... `);
  try {
    const detail = await fn();
    console.log(`\x1b[32mok\x1b[0m${detail ? `  ${detail}` : ""}`);
    results.push({ name, ok: true });
  } catch (err) {
    console.log(`\x1b[31mFAIL\x1b[0m  ${err.message}`);
    results.push({ name, ok: false, err: err.message });
    failed += 1;
  }
}

console.log(`\nShopiSpy smoke test → ${BASE_URL}\n`);

await check("GET /api/health returns 200", async () => {
  const r = await fetch(`${BASE_URL}/api/health`);
  if (r.status !== 200) throw new Error(`status ${r.status}`);
  const body = await r.json();
  if (body.status === "unhealthy") {
    throw new Error(`unhealthy — ${JSON.stringify(body.checks)}`);
  }
  return `(${body.status})`;
});

await check("cron without auth → 401", async () => {
  const r = await fetch(`${BASE_URL}/api/cron/monitor-alerts`);
  if (r.status !== 401) throw new Error(`expected 401, got ${r.status}`);
});

await check("GET /api/cron/monitor-alerts (authed) → 200", async () => {
  const r = await fetch(`${BASE_URL}/api/cron/monitor-alerts`, {
    headers: { Authorization: `Bearer ${CRON_SECRET}` },
  });
  if (r.status !== 200) {
    const text = await r.text();
    throw new Error(`status ${r.status} — ${text.slice(0, 200)}`);
  }
});

await check("GET /api/cron/scheduled-scrape (authed) → 200", async () => {
  // Long timeout: scraping 600+ stores can take minutes.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 300_000);
  try {
    const r = await fetch(`${BASE_URL}/api/cron/scheduled-scrape`, {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
      signal: controller.signal,
    });
    if (r.status !== 200) {
      const text = await r.text();
      throw new Error(`status ${r.status} — ${text.slice(0, 200)}`);
    }
  } finally {
    clearTimeout(timer);
  }
});

await check("GET /brands renders SSR HTML", async () => {
  const r = await fetch(`${BASE_URL}/brands`);
  if (r.status !== 200) throw new Error(`status ${r.status}`);
  const html = await r.text();
  if (!html.includes("ShopiSpy")) throw new Error("'ShopiSpy' missing from HTML — SSR broken?");
  if (!/<a[^>]+href="\/brands\/[^"]+"/.test(html)) {
    throw new Error("no /brands/<slug> links in SSR output — brand list not rendering");
  }
});

await check("GET a brand detail page renders", async () => {
  const indexHtml = await (await fetch(`${BASE_URL}/brands`)).text();
  const match = indexHtml.match(/href="(\/brands\/[^"]+)"/);
  if (!match) throw new Error("couldn't find a brand link to follow");
  const r = await fetch(`${BASE_URL}${match[1]}`);
  if (r.status !== 200) throw new Error(`${match[1]} → ${r.status}`);
  const html = await r.text();
  if (!html.includes("Shopify Store Tracker")) {
    throw new Error("brand detail page missing expected title marker");
  }
  return `(${match[1]})`;
});

console.log(
  `\n${failed === 0 ? "\x1b[32m✓\x1b[0m all" : `\x1b[31m✗\x1b[0m ${failed}`} of ${results.length} checks ${failed === 0 ? "passed" : "failed"}\n`
);
process.exit(failed === 0 ? 0 : 1);
