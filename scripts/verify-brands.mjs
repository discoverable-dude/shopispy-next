#!/usr/bin/env node
// Probes each brand domain for /products.json to verify Shopify status.
// Outputs: research/brand-verification.json

import { VERTICALS } from '../src/lib/brands.ts';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CONCURRENCY = 20;
const TIMEOUT_MS = 8000;

async function probe(domain) {
  const url = `https://${domain}/products.json?limit=1`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ShopiSpy-Verify/1.0)',
        'Accept': 'application/json',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);
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
    return { ok: true, status: res.status, reason: 'shopify', productCount: data.products.length };
  } catch (err) {
    clearTimeout(timeout);
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
  const allBrands = [];
  for (const v of VERTICALS) {
    for (const b of v.brands) {
      allBrands.push({ industry: v.id, industryLabel: v.label, name: b.name, domain: b.domain });
    }
  }

  console.log(`Probing ${allBrands.length} brands with concurrency=${CONCURRENCY}...`);
  const start = Date.now();

  let done = 0;
  const results = await pool(
    allBrands,
    async (brand) => {
      const result = await probe(brand.domain);
      done++;
      if (done % 25 === 0) {
        console.log(`  ${done}/${allBrands.length} probed (${Math.round((done / allBrands.length) * 100)}%)`);
      }
      return { ...brand, ...result };
    },
    CONCURRENCY
  );

  const elapsed = Math.round((Date.now() - start) / 1000);
  console.log(`\nDone in ${elapsed}s`);

  const verified = results.filter(r => r.ok);
  const failed = results.filter(r => !r.ok);

  console.log(`Verified Shopify: ${verified.length}/${results.length}`);
  console.log(`Failed: ${failed.length}`);

  // Group failures by reason
  const reasons = {};
  for (const f of failed) {
    reasons[f.reason] = (reasons[f.reason] || 0) + 1;
  }
  console.log('\nFailure breakdown:');
  for (const [reason, count] of Object.entries(reasons).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${reason}: ${count}`);
  }

  const outPath = resolve('research/brand-verification.json');
  writeFileSync(outPath, JSON.stringify({
    verifiedAt: new Date().toISOString(),
    total: results.length,
    verified: verified.length,
    failed: failed.length,
    results,
  }, null, 2));
  console.log(`\nWritten to ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
