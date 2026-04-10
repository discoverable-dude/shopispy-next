#!/usr/bin/env node
// Merges verified existing brands + new researched brands, dedupes, and outputs:
//   1. src/lib/brands.ts (new Brand shape, domain + metadata only)
//   2. research/brands-migration.sql (INSERT INTO stores ON CONFLICT DO NOTHING)
//   3. research/brands-all.csv (full metadata)

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Load verified existing brands (290 Shopify-confirmed)
const verified = JSON.parse(readFileSync(resolve('research/verified-by-industry.json'), 'utf8'));

// Load new brand research batches
const batch1 = JSON.parse(readFileSync(resolve('research/new-brands-batch1.json'), 'utf8'));
const batch2 = JSON.parse(readFileSync(resolve('research/new-brands-batch2.json'), 'utf8'));
const batch3 = JSON.parse(readFileSync(resolve('research/new-brands-batch3.json'), 'utf8'));

const industryMeta = {
  fashion: { id: 'fashion', label: 'Fashion' },
  beauty: { id: 'beauty', label: 'Beauty & Wellness' },
  home: { id: 'home', label: 'Home & Garden' },
  food: { id: 'food', label: 'Food & Beverage' },
  electronics: { id: 'electronics', label: 'Electronics & Tech' },
  sports: { id: 'sports', label: 'Sports & Outdoors' },
  kids: { id: 'kids', label: 'Kids & Baby' },
  pets: { id: 'pets', label: 'Pets' },
  fitness: { id: 'fitness', label: 'Health & Fitness' },
  jewellery: { id: 'jewellery', label: 'Jewellery & Accessories' },
  mobility: { id: 'mobility', label: 'Automotive & Mobility' },
};

function normalizeDomain(d) {
  return d
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}

// Build a merged structure: { [industryId]: Brand[] }
// Brand shape: { name, domain, country, subcategory, description, source: 'verified' | 'researched' }
const merged = {};
const seenDomains = new Set();
const duplicates = [];

// First add verified existing brands (prioritize these)
for (const [id, data] of Object.entries(verified)) {
  merged[id] = [];
  for (const brand of data.brands) {
    const domain = normalizeDomain(brand.domain);
    if (seenDomains.has(domain)) {
      duplicates.push({ industry: id, ...brand });
      continue;
    }
    seenDomains.add(domain);
    merged[id].push({
      name: brand.name,
      domain,
      country: null, // existing brands didn't record country
      subcategory: null,
      description: null,
      source: 'verified',
    });
  }
}

// Add new researched brands
const batches = [batch1, batch2, batch3];
for (const batch of batches) {
  for (const [industryId, brands] of Object.entries(batch.industries)) {
    if (!merged[industryId]) merged[industryId] = [];
    for (const brand of brands) {
      const domain = normalizeDomain(brand.domain);
      if (seenDomains.has(domain)) {
        duplicates.push({ industry: industryId, ...brand });
        continue;
      }
      seenDomains.add(domain);
      merged[industryId].push({
        name: brand.name,
        domain,
        country: brand.country || null,
        subcategory: brand.subcategory || null,
        description: brand.description || null,
        source: 'researched',
      });
    }
  }
}

console.log(`Merged ${seenDomains.size} unique brands (dropped ${duplicates.length} duplicates)\n`);
for (const [id, brands] of Object.entries(merged)) {
  const verified = brands.filter(b => b.source === 'verified').length;
  const researched = brands.filter(b => b.source === 'researched').length;
  console.log(`  ${(industryMeta[id]?.label || id).padEnd(28)} ${brands.length.toString().padStart(3)}  (verified: ${verified}, new: ${researched})`);
}

if (duplicates.length > 0) {
  console.log(`\nDuplicates dropped:`);
  for (const d of duplicates.slice(0, 10)) {
    console.log(`  ${d.industry}: ${d.name || ''} (${d.domain})`);
  }
  if (duplicates.length > 10) console.log(`  ... and ${duplicates.length - 10} more`);
}

// ── 1. Generate new brands.ts ─────────────────────────────────────
function tsEscape(str) {
  if (!str) return 'null';
  return `"${str.replace(/"/g, '\\"')}"`;
}

let tsOut = `// ── Single source of truth for all tracked brands ──
// Auto-generated from research. Product counts and activity are fetched
// dynamically at render time from Supabase via brandStats.ts.
// To add/remove brands, edit research sources and re-run scripts/merge-brands.mjs.

export interface Brand {
  name: string;
  domain: string;
  country: string | null;
  subcategory: string | null;
  description: string | null;
  // Dynamic fields — injected at render time via brandStats.enrichBrand()
  products: string;
  lastUpdate: string;
  latestChange: string;
}

export interface Vertical {
  id: string;
  label: string;
  brands: Brand[];
}

// Helper for defining brands concisely
function b(name: string, domain: string, country: string | null, subcategory: string | null, description: string | null): Brand {
  return {
    name,
    domain,
    country,
    subcategory,
    description,
    // Default placeholders — overwritten by enrichBrand() at render time
    products: "—",
    lastUpdate: "—",
    latestChange: "Tracking starts soon",
  };
}

export const VERTICALS: Vertical[] = [
`;

// Order: keep industries in the same order as industryMeta
const industryOrder = Object.keys(industryMeta);
for (const id of industryOrder) {
  const meta = industryMeta[id];
  const brands = merged[id] || [];
  // Sort: verified first (alphabetical), then researched (alphabetical)
  brands.sort((a, b) => {
    if (a.source !== b.source) return a.source === 'verified' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  tsOut += `  {\n`;
  tsOut += `    id: "${meta.id}",\n`;
  tsOut += `    label: "${meta.label}",\n`;
  tsOut += `    brands: [\n`;
  for (const brand of brands) {
    const args = [
      tsEscape(brand.name),
      tsEscape(brand.domain),
      tsEscape(brand.country),
      tsEscape(brand.subcategory),
      tsEscape(brand.description),
    ];
    tsOut += `      b(${args.join(', ')}),\n`;
  }
  tsOut += `    ],\n`;
  tsOut += `  },\n`;
}

tsOut += `];\n\n`;
tsOut += `// Flat list of all brands, useful for generateStaticParams\n`;
tsOut += `export const ALL_BRANDS: (Brand & { vertical: Vertical })[] = VERTICALS.flatMap((v) =>\n`;
tsOut += `  v.brands.map((b) => ({ ...b, vertical: v }))\n`;
tsOut += `);\n\n`;

// Preserve TOTAL_PRODUCTS + BRAND_WORDMARKS from the existing brands.ts so
// homepage/pricing/marketing components keep working. We read them from the
// current file rather than hardcoding them into this script.
try {
  const existingBrands = readFileSync(resolve('src/lib/brands.ts'), 'utf8');
  const totalMatch = existingBrands.match(/export const TOTAL_PRODUCTS[\s\S]*?;/);
  const brandNamesMatch = existingBrands.match(/export const BRAND_NAMES[\s\S]*?;/);
  const wordmarksMatch = existingBrands.match(/export const BRAND_WORDMARKS[\s\S]*?^\];/m);

  if (totalMatch) {
    tsOut += '\n// Notional total product count for marketing copy\n';
    tsOut += totalMatch[0] + '\n';
  } else {
    tsOut += '\nexport const TOTAL_PRODUCTS = ALL_BRANDS.length * 2500;\n';
  }
  if (brandNamesMatch) {
    tsOut += '\n' + brandNamesMatch[0] + '\n';
  } else {
    tsOut += '\nexport const BRAND_NAMES = ALL_BRANDS.map((b) => b.name);\n';
  }
  if (wordmarksMatch) {
    tsOut += '\n' + wordmarksMatch[0] + '\n';
  }
} catch {
  // No existing file — initial generation
  tsOut += '\nexport const TOTAL_PRODUCTS = ALL_BRANDS.length * 2500;\n';
  tsOut += 'export const BRAND_NAMES = ALL_BRANDS.map((b) => b.name);\n';
  tsOut += 'export const BRAND_WORDMARKS: { name: string; style: string }[] = [];\n';
}

writeFileSync(resolve('src/lib/brands.ts'), tsOut);
console.log(`\n✓ Wrote src/lib/brands.ts (${tsOut.length} bytes)`);

// ── 2. Generate SQL migration ─────────────────────────────────────
let sqlOut = `-- ============================================================
-- Seed: tracked Shopify stores across ${industryOrder.length} industries
-- Auto-generated by scripts/merge-brands.mjs
-- Total brands: ${seenDomains.size}
-- ============================================================

`;

const allBrandsWithIndustry = [];
for (const id of industryOrder) {
  for (const brand of merged[id] || []) {
    allBrandsWithIndustry.push({ ...brand, industry: id, industryLabel: industryMeta[id].label });
  }
}

sqlOut += `INSERT INTO public.stores (store_url, store_name) VALUES\n`;
const rows = allBrandsWithIndustry.map(b => {
  const url = b.domain.replace(/'/g, "''");
  const name = b.name.replace(/'/g, "''");
  return `  ('${url}', '${name}')`;
});
sqlOut += rows.join(',\n');
sqlOut += `\nON CONFLICT (store_url) DO NOTHING;\n`;

writeFileSync(resolve('research/brands-migration.sql'), sqlOut);
console.log(`✓ Wrote research/brands-migration.sql (${rows.length} inserts)`);

// ── 3. Generate CSV ───────────────────────────────────────────────
function csvEscape(val) {
  if (val == null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

let csvOut = 'industry,industry_label,brand_name,domain,country,subcategory,description,source\n';
for (const b of allBrandsWithIndustry) {
  const row = [
    b.industry,
    b.industryLabel,
    b.name,
    b.domain,
    b.country,
    b.subcategory,
    b.description,
    b.source,
  ].map(csvEscape).join(',');
  csvOut += row + '\n';
}

writeFileSync(resolve('research/brands-all.csv'), csvOut);
console.log(`✓ Wrote research/brands-all.csv (${allBrandsWithIndustry.length} rows)`);

console.log(`\nDone. Total unique brands: ${seenDomains.size}`);
