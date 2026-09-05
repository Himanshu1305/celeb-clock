// Generates scripts/celebrity-meta.json = { [slug]: { title, desc } } for all
// Indian celebrities, using the SAME TypeScript utilities the React components use
// (run via tsx). This guarantees the prerendered routes/titles match exactly what
// CelebrityPage renders at runtime — no slug drift, no title mismatch.
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import {
  parseCelebrityDOB,
  generateCelebrityTitle, generateCelebrityMeta,
} from '../src/utils/celebrityUtils';
import {
  calculateWesternZodiac, calculateVedicRashi,
  calculateChineseZodiac, calculateLifePathNumber,
} from '../src/utils/celebrityCalculations';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Unified celebrity DB (static Indian + Supabase) — slugs pre-assigned by
// scripts/export-celebrities.ts. Iterate its entries so every prerendered
// celebrity route matches exactly what CelebrityPage resolves at runtime.
const celebritiesData = require('../src/data/celebrities.json');
const allCelebrities = celebritiesData.celebrities as Record<string, unknown>[];

// Prerender curation: every static Indian celebrity (canonical, hand-curated)
// PLUS Supabase celebrities notable enough to warrant a static page (present on
// ≥30 Wikipedia language editions). The full 2595-entry set still resolves
// client-side via CelebrityPage; this only bounds which pages get static HTML,
// keeping the build tractable and avoiding thin-content mass publishing.
const NOTABLE_SITELINKS = 30;
const shouldPrerender = (c: Record<string, unknown>) =>
  c.source === 'static' || Number(c.sitelinks ?? 0) >= NOTABLE_SITELINKS;

const meta: Record<string, { title: string; desc: string }> = {};
allCelebrities.filter(shouldPrerender).forEach((celeb) => {
  const slug = String(celeb.slug || '');
  if (!slug) return;
  const name = String(celeb.name || '');
  const dob = parseCelebrityDOB(celeb);
  const isFull = !!dob?.isFullDate;
  const western = isFull ? calculateWesternZodiac(dob!.day, dob!.month) : null;
  const vedic = isFull ? calculateVedicRashi(dob!.day, dob!.month) : null;
  const chinese = dob ? calculateChineseZodiac(dob.year) : null;
  const lifePath = isFull ? calculateLifePathNumber(dob!.day, dob!.month, dob!.year) : null;
  meta[slug] = {
    title: generateCelebrityTitle(name),
    desc: generateCelebrityMeta(name, dob, western?.sign || chinese?.animal || '', vedic?.rashi || '', lifePath),
  };
});

writeFileSync(resolve(__dirname, 'celebrity-meta.json'), JSON.stringify(meta));
console.log('Generated celebrity-meta.json:', Object.keys(meta).length, 'celebrity slugs');
