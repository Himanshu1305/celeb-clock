// Generates scripts/celebrity-meta.json = { [slug]: { title, desc } } for all
// Indian celebrities, using the SAME TypeScript utilities the React components use
// (run via tsx). This guarantees the prerendered routes/titles match exactly what
// CelebrityPage renders at runtime — no slug drift, no title mismatch.
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { generateCelebrityTitle } from '../src/utils/celebrityUtils';
// Batch 6: the SAME facts function CelebrityPage uses — age (a deceased person never
// gets a current age), Moon sign (Rashi) from the chart engine, and the meta text.
import { celebrityProfileFacts } from '../src/lib/celebrityProfile';
import { applyCelebRecordFixes } from '../src/lib/celebrityFacts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Unified celebrity DB (static Indian + Supabase) — slugs pre-assigned by
// scripts/export-celebrities.ts. Iterate its entries so every prerendered
// celebrity route matches exactly what CelebrityPage resolves at runtime.
const celebritiesData = require('../src/data/celebrities.json');
// Same verified date corrections CelebrityPage re-applies at load.
const allCelebrities = (celebritiesData.celebrities as Record<string, unknown>[]).map(applyCelebRecordFixes);

// Prerender coverage (2026-10-23, founder decision): EVERY celebrity in the unified
// DB gets static HTML and a sitemap entry. Previously only static Indian entries plus
// Supabase rows with >=30 Wikipedia sitelinks were prerendered (1,442 of 3,107), so the
// other ~1,665 pages served Google the generic SPA shell title and were absent from the
// sitemap. Search is the main acquisition channel, so all pages are now published.
const shouldPrerender = (c: Record<string, unknown>) => !!c.slug;

const meta: Record<string, { title: string; desc: string }> = {};
allCelebrities.filter(shouldPrerender).forEach((celeb) => {
  const slug = String(celeb.slug || '');
  if (!slug) return;
  const name = String(celeb.name || '');
  meta[slug] = {
    title: generateCelebrityTitle(name),
    desc: celebrityProfileFacts(celeb, slug).description,
  };
});

writeFileSync(resolve(__dirname, 'celebrity-meta.json'), JSON.stringify(meta));
console.log('Generated celebrity-meta.json:', Object.keys(meta).length, 'celebrity slugs');
