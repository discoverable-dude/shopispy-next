#!/usr/bin/env node
// Finds domains with obvious typos (letter patterns that look corrupted)
// and suggests cleaned versions.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const data = JSON.parse(readFileSync(resolve('research/brand-verification.json'), 'utf8'));
const failed = data.results.filter(r => !r.ok);

// Patterns that indicate likely corruption:
// - "fr" inserted in the middle of a word (e.g. "tifriegehanley" should be "tiegehanley")
// - Double letters where there shouldn't be
const suspicious = [];

for (const r of failed) {
  const d = r.domain;
  // Look for "fr" in odd positions (not in common words like "from", "afr", "fer", etc.)
  const frMatches = [...d.matchAll(/fr/g)];
  if (frMatches.length > 0) {
    // Remove each "fr" occurrence and see if the result looks cleaner
    for (const m of frMatches) {
      const cleaned = d.slice(0, m.index) + d.slice(m.index + 2);
      suspicious.push({
        original: d,
        cleaned,
        name: r.name,
        industry: r.industry,
        reason: r.reason,
      });
    }
  }
}

console.log(`Found ${suspicious.length} domains with possible "fr" corruption:`);
for (const s of suspicious.slice(0, 50)) {
  console.log(`  ${s.name.padEnd(30)} ${s.original.padEnd(35)} -> ${s.cleaned}`);
}
if (suspicious.length > 50) console.log(`  ... and ${suspicious.length - 50} more`);

writeFileSync(resolve('research/typo-candidates.json'), JSON.stringify(suspicious, null, 2));
