#!/usr/bin/env node
// Verifies curated typo fixes by probing /products.json for corrected domains.

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Curated fixes: original corrupted domain -> corrected domain
// These were identified by manual review of the typo-candidates output.
// "fr" was spuriously inserted in many domains.
const FIXES = {
  'tifriegehanley.com': 'tiegehanley.com',
  'bfrst.com': 'burstoralcare.com',
  'lfrqcom.myshopify.com': 'livelarq.com',
  'bfrioliteenergy.com': 'bioliteenergy.com',
  'hfrario-usa.com': 'hario-usa.com',
  'grfraza.co': 'graza.co',
  'dfrrinktrade.com': 'drinktrade.com',
  'dfruckychannel.com': 'duckychannel.com',
  'lfreiagear.com': 'leiagear.com',
  'pfrehrdesigns.com': 'pehrdesigns.com',
  'hatchwfraby.com': 'hatch.co',
  'pipfrette.com': 'pipettebaby.com',
  'ffrablefrpets.com': 'fablepets.com',
  'gfrunnerkennels.com': 'gunnerkennels.com',
  'rfrufflandkennels.com': 'rufflandkennels.com',
  'roguefrfitness.com': 'roguefitness.com',
  'tfrriggerpoint.com': 'tptherapy.com',
  'kfrged.com': 'kaged.com',
  'dorfrsey.com': 'dorsey.com',
  'ablefr.com': 'livefashionable.com',
  'dfragnedover.com': 'dagnedover.com',
  'polfrene-paris.com': 'polene-paris.com',
  'tfrelfar.net': 'shop.telfar.net',
  'stfraud.clothing': 'staud.clothing',
  'byfrfrfar.com': 'byfar.com',
  'arfrket.com': 'arket.com',
  'kfrancis.kosas.com': 'kosas.com',
};

async function probe(domain) {
  const url = `https://${domain}/products.json?limit=1`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('json')) return { ok: false, reason: 'not JSON' };
    const data = await res.json();
    if (!Array.isArray(data.products)) return { ok: false, reason: 'no products' };
    return { ok: true };
  } catch (err) {
    clearTimeout(timeout);
    return { ok: false, reason: err.name === 'AbortError' ? 'timeout' : err.code || err.message };
  }
}

async function main() {
  console.log(`Verifying ${Object.keys(FIXES).length} curated fixes...`);
  const results = {};
  for (const [original, fixed] of Object.entries(FIXES)) {
    const result = await probe(fixed);
    results[original] = { fixed, ...result };
    console.log(`  ${result.ok ? '✓' : '✗'} ${original.padEnd(35)} -> ${fixed.padEnd(30)} ${result.ok ? '' : '(' + result.reason + ')'}`);
    await new Promise(r => setTimeout(r, 3500));
  }

  const verified = Object.entries(results).filter(([, v]) => v.ok);
  const failed = Object.entries(results).filter(([, v]) => !v.ok);
  console.log(`\n${verified.length}/${Object.keys(FIXES).length} fixes verified`);

  writeFileSync(resolve('research/typo-fixes-verified.json'), JSON.stringify(results, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
