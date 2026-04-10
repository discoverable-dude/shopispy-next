#!/usr/bin/env node
// Retries failed brands from the previous verification run with lower concurrency
// and exponential backoff. Merges results back into research/brand-verification.json.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CONCURRENCY = 4;
const TIMEOUT_MS = 12000;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1500;

async function probe(domain, attempt = 0) {
  const url = `https://${domain}/products.json?limit=1`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (res.status === 429 && attempt < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, BASE_DELAY_MS * Math.pow(2, attempt)));
      return probe(domain, attempt + 1);
    }

    if (!res.ok) {
      return { ok: false, status: res.status, reason: `HTTP ${res.status}` };
    }
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('json')) {
      return { ok: false, status: res.status, reason: 'not JSON' };
    }
    const data = await res.json();
    if (!Array.isArray(data.products)) {
      return { ok: false, status: res.status, reason: 'no products array' };
    }
    return { ok: true, status: res.status, reason: 'shopify' };
  } catch (err) {
    clearTimeout(timeout);
    if (attempt < MAX_RETRIES && (err.name === 'AbortError' || err.code === 'ECONNRESET' || err.code === 'UND_ERR_CONNECT_TIMEOUT')) {
      await new Promise(r => setTimeout(r, BASE_DELAY_MS * Math.pow(2, attempt)));
      return probe(domain, attempt + 1);
    }
    return { ok: false, status: 0, reason: err.name === 'AbortError' ? 'timeout' : err.code || err.message };
  }
}

async function pool(items, worker, concurrency) {
  const results = new Array(items.length);
  let index = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (true) {
      const i = index++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  const inPath = resolve('research/brand-verification.json');
  const data = JSON.parse(readFileSync(inPath, 'utf8'));

  // Retry 429, timeout, fetch failed, 5xx, not JSON (some Shopify stores hit challenge pages)
  const retryableReasons = new Set(['HTTP 429', 'timeout', 'fetch failed', 'HTTP 500', 'HTTP 502', 'HTTP 503', 'not JSON', 'HTTP 403']);
  const toRetry = data.results.filter(r => !r.ok && retryableReasons.has(r.reason));

  console.log(`Retrying ${toRetry.length} previously failed brands (concurrency=${CONCURRENCY})...`);
  const start = Date.now();
  let done = 0;

  const retried = await pool(
    toRetry,
    async (brand) => {
      const result = await probe(brand.domain);
      done++;
      if (done % 10 === 0) {
        console.log(`  ${done}/${toRetry.length} retried`);
      }
      return { ...brand, ...result };
    },
    CONCURRENCY
  );

  const elapsed = Math.round((Date.now() - start) / 1000);

  // Merge retried results back
  const retriedByDomain = new Map(retried.map(r => [r.domain, r]));
  const merged = data.results.map(r => retriedByDomain.get(r.domain) || r);

  const verified = merged.filter(r => r.ok);
  const failed = merged.filter(r => !r.ok);

  console.log(`\nDone in ${elapsed}s`);
  console.log(`Verified Shopify: ${verified.length}/${merged.length}`);
  console.log(`Still failed: ${failed.length}`);

  const reasons = {};
  for (const f of failed) {
    reasons[f.reason] = (reasons[f.reason] || 0) + 1;
  }
  console.log('\nFinal failure breakdown:');
  for (const [reason, count] of Object.entries(reasons).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${reason}: ${count}`);
  }

  writeFileSync(inPath, JSON.stringify({
    verifiedAt: new Date().toISOString(),
    total: merged.length,
    verified: verified.length,
    failed: failed.length,
    results: merged,
  }, null, 2));
  console.log(`\nUpdated ${inPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
