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
import { dedupeCelebrities } from '../src/lib/celebrityDedupe';
import { isIndexableProfile } from '../src/lib/celebrityStrength';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Unified celebrity DB (static Indian + Supabase) — slugs pre-assigned by
// scripts/export-celebrities.ts. Iterate its entries so every prerendered
// celebrity route matches exactly what CelebrityPage resolves at runtime.
const celebritiesData = require('../src/data/celebrities.json');
// Same verified date corrections CelebrityPage re-applies at load.
// Batch 7: same one-page-per-person rule as the export (defensive — a no-op on a
// file the export wrote), so a duplicate can never reach the prerender list/sitemap.
const deduped = dedupeCelebrities(celebritiesData.celebrities as Record<string, unknown>[]);
if (deduped.merges.length) console.warn('gen-celebrity-slugs: dropped duplicate people:', deduped.merges.map(m => `${m.retired}→${m.kept}`).join(', '));
const allCelebrities = deduped.list.map(applyCelebRecordFixes);

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
  const f = celebrityProfileFacts(celeb, slug);
  meta[slug] = { title: generateCelebrityTitle(name, f.dob), desc: f.description };
});

writeFileSync(resolve(__dirname, 'celebrity-meta.json'), JSON.stringify(meta));

// B21 (SEO, founder decision 27 Nov 2026): every celebrity page stays live and prerendered, but only
// the strongest go in the sitemap until the site has more authority — curated Indian profiles,
// people with a written bio, and people with 30+ Wikipedia language editions (sitelinks). Search
// Console showed most pages "Discovered – currently not indexed"; this points Google's limited
// crawling at the pages most likely to rank. Revisit when Ahrefs DR reaches 10.
const strong = allCelebrities.filter(shouldPrerender).filter(c => isIndexableProfile(c))
  .map(c => String(c.slug));
writeFileSync(resolve(__dirname, 'celebrity-sitemap.json'), JSON.stringify(strong));
console.log('Generated celebrity-sitemap.json:', strong.length, 'of', Object.keys(meta).length, 'celebrity pages listed in the sitemap');
console.log('Generated celebrity-meta.json:', Object.keys(meta).length, 'celebrity slugs');
