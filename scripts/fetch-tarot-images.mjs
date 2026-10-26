#!/usr/bin/env node
/**
 * Batch 8 — download the 78 Rider–Waite–Smith (1909) card scans from Wikimedia Commons,
 * check each file's licence on Commons is "Public domain", and save small WebP copies.
 *
 * Output:
 *   public/tarot/<slug>.webp                 (300 px wide)
 *   src/data/tarotCards/images.json          { slug: { src, width, height, commonsPage, licence, artist } }
 *
 * Runs on a GitHub Actions runner (.github/workflows/tarot-images.yml) because the dev
 * sandbox cannot reach Wikimedia. Fails (exit 1) if any card is missing or not public domain,
 * so a wrong licence can never be committed. Commons asks for a descriptive User-Agent.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'BornClockTarotImages/1.0 (https://bornclock.com; usdvisionai@gmail.com)';
const MAJOR = ['Fool', 'Magician', 'High Priestess', 'Empress', 'Emperor', 'Hierophant', 'Lovers', 'Chariot',
  'Strength', 'Hermit', 'Wheel of Fortune', 'Justice', 'Hanged Man', 'Death', 'Temperance', 'Devil', 'Tower',
  'Star', 'Moon', 'Sun', 'Judgement', 'World'];
const MAJOR_SLUGS = ['the-fool', 'the-magician', 'the-high-priestess', 'the-empress', 'the-emperor', 'the-hierophant',
  'the-lovers', 'the-chariot', 'strength', 'the-hermit', 'wheel-of-fortune', 'justice', 'the-hanged-man', 'death',
  'temperance', 'the-devil', 'the-tower', 'the-star', 'the-moon', 'the-sun', 'judgement', 'the-world'];
const RANKS = ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'page', 'knight', 'queen', 'king'];
const SUITS = ['wands', 'cups', 'swords', 'pentacles'];

const cards = [
  ...MAJOR.map((n, i) => ({ slug: MAJOR_SLUGS[i], file: `RWS1909 - ${String(i).padStart(2, '0')} ${n}.jpeg` })),
  ...SUITS.flatMap((s) => RANKS.map((r, i) => ({
    slug: `${r}-of-${s}`,
    file: `RWS1909 - ${s[0].toUpperCase()}${s.slice(1)} ${String(i + 1).padStart(2, '0')}.jpeg`,
  }))),
];
if (cards.length !== 78) throw new Error(`expected 78 cards, got ${cards.length}`);

async function info(file) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata'
    + `&iiurlwidth=300&format=json&titles=${encodeURIComponent('File:' + file)}`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${file}: API ${r.status}`);
  const page = Object.values((await r.json()).query.pages)[0];
  const ii = page.imageinfo?.[0];
  if (!ii) throw new Error(`${file}: not found on Commons`);
  const m = ii.extmetadata || {};
  const strip = (v) => (v || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return { thumb: ii.thumburl, page: ii.descriptionurl, licence: strip(m.LicenseShortName?.value), artist: strip(m.Artist?.value) };
}

const outDir = resolve(ROOT, 'public/tarot');
mkdirSync(outDir, { recursive: true });
const manifest = {};
for (const c of cards) {
  const i = await info(c.file);
  if (i.licence !== 'Public domain') throw new Error(`${c.file}: licence is "${i.licence}", not Public domain`);
  const r = await fetch(i.thumb, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${c.file}: download ${r.status}`);
  const img = sharp(Buffer.from(await r.arrayBuffer())).resize({ width: 300 }).webp({ quality: 78 });
  const { data, info: meta } = await img.toBuffer({ resolveWithObject: true });
  writeFileSync(resolve(outDir, `${c.slug}.webp`), data);
  manifest[c.slug] = {
    src: `/tarot/${c.slug}.webp`, width: meta.width, height: meta.height,
    commonsPage: i.page, licence: 'Public domain',
    artist: i.artist.includes('Pamela Colman Smith') ? 'Pamela Colman Smith (Rider–Waite–Smith deck, 1909)' : i.artist,
  };
  console.log(`ok ${c.slug} ${meta.width}x${meta.height} ${data.length}B`);
  await new Promise((res) => setTimeout(res, 250)); // be polite to Commons
}
writeFileSync(resolve(ROOT, 'src/data/tarotCards/images.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`done: ${Object.keys(manifest).length} cards`);
