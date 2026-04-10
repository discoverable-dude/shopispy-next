#!/usr/bin/env node
// Groups verified brands by industry and shows counts + the list to keep.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const data = JSON.parse(readFileSync(resolve('research/brand-verification.json'), 'utf8'));
const verified = data.results.filter(r => r.ok);

const byIndustry = {};
for (const r of verified) {
  if (!byIndustry[r.industry]) byIndustry[r.industry] = { label: r.industryLabel, brands: [] };
  byIndustry[r.industry].brands.push({ name: r.name, domain: r.domain });
}

console.log(`Total verified: ${verified.length}\n`);
for (const [id, { label, brands }] of Object.entries(byIndustry)) {
  console.log(`${label} (${id}): ${brands.length} brands`);
}

writeFileSync(resolve('research/verified-by-industry.json'), JSON.stringify(byIndustry, null, 2));
console.log('\nWritten to research/verified-by-industry.json');
