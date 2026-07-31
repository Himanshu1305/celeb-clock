// scripts/generate-og-cards.mts — build-time per-page-type OG share cards.
// Renders branded 1200x630 SVG → WebP via sharp (fast, no browser) into dist/og/.
// Run AFTER `vite build` (which copies public/→dist/) and BEFORE prerender, which
// wires og:image per route. tsx is used so we can import the TS data directly.
//
//   ./node_modules/.bin/tsx scripts/generate-og-cards.mts
//
// Templates: born-on date (birthstone accent), month hub, zodiac sign, fitness
// page, blog post, and a refreshed default. Design tokens: ink/navy/gold + logo +
// tagline. WebP ~<60KB each.
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BIRTHSTONE_DATA } from '../src/data/birthstoneData';
import { ZODIAC_DATA } from '../src/data/zodiacData';
import { MONTH_HUB_DATA } from '../src/data/monthHubData';
import { FITNESS_PAGES } from '../src/data/fitnessPages';
import { blogPosts } from '../src/data/blogPosts';
import { BORNCLOCK_LOGO_B64 } from '../src/lib/invoice-logo';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'dist/og');
const INK = '#0C1A2B', NAVY = '#103A5C', GOLD = '#B8862F', LIGHT = '#F5EAD2', MUTE = '#9DB0BF';
const W = 1200, H = 630;
const logoB64 = readFileSync(resolve(ROOT, 'public/bornclock-logo.png')).toString('base64');

// Homepage / default share card — light, brand-forward (WhatsApp preview). Uses the
// dark-on-white invoice logo (the public/bornclock-logo.png is light, for dark cards).
function homeCardSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="#FFFFFF"/>
    <rect width="${W}" height="8" fill="${GOLD}"/>
    <image href="${BORNCLOCK_LOGO_B64}" x="80" y="60" height="60"/>
    <text x="600" y="292" text-anchor="middle" fill="${NAVY}" font-family="Georgia, 'Times New Roman', serif" font-size="80" font-weight="800">Know your time.</text>
    <text x="600" y="384" text-anchor="middle" fill="${NAVY}" font-family="Georgia, 'Times New Roman', serif" font-size="80" font-weight="800">Live it well.</text>
    <text x="600" y="458" text-anchor="middle" fill="${GOLD}" font-family="Helvetica, Arial, sans-serif" font-size="27" font-weight="600">Celebrity twins &#183; Biological age &#183; Life expectancy &#183; Zodiac &#183; Numerology</text>
    <text x="1120" y="586" text-anchor="end" fill="#8A97A3" font-family="Helvetica, Arial, sans-serif" font-size="24">bornclock.com</text>
  </svg>`;
}

const MONTHS = ['', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const MONTH_DAYS = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const esc = (s: unknown) => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));

function wrap(text: string, max: number, maxLines = 3): string[] {
  const words = text.split(/\s+/); const lines: string[] = []; let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) { if (cur) lines.push(cur); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/[.,;:]?\s*\S*$/, '') + '…'; }
  return lines;
}

function svg({ eyebrow, title, accent = GOLD, sub, titleSize = 68 }: { eyebrow: string; title: string; accent?: string; sub?: string; titleSize?: number }): string {
  const lines = wrap(title, title.length > 40 ? 24 : 20);
  const lh = Math.round(titleSize * 1.12);
  const blockH = (lines.length - 1) * lh;
  const startY = 340 - blockH / 2;
  const tspans = lines.map((l, i) => `<tspan x="90" dy="${i === 0 ? 0 : lh}">${esc(l)}</tspan>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${INK}"/>
    <rect width="${W}" height="12" fill="${accent}"/>
    <circle cx="1080" cy="470" r="250" fill="none" stroke="${NAVY}" stroke-width="2" opacity="0.55"/>
    <circle cx="1080" cy="470" r="188" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.32"/>
    <circle cx="1080" cy="470" r="126" fill="none" stroke="${NAVY}" stroke-width="1.5" opacity="0.4"/>
    <image href="data:image/png;base64,${logoB64}" x="86" y="66" height="54"/>
    <text x="90" y="212" fill="${accent}" font-family="Georgia, 'Times New Roman', serif" font-size="26" letter-spacing="7" font-weight="700">${esc(eyebrow.toUpperCase())}</text>
    <text x="90" y="${startY}" fill="${LIGHT}" font-family="Georgia, 'Times New Roman', serif" font-size="${titleSize}" font-weight="800">${tspans}</text>
    ${sub ? `<text x="90" y="548" fill="${MUTE}" font-family="Helvetica, Arial, sans-serif" font-size="30">${esc(sub)}</text>` : ''}
    <text x="90" y="596" fill="${MUTE}" font-family="Helvetica, Arial, sans-serif" font-size="23" font-style="italic">Know your time. Live it well. · bornclock.com</text>
  </svg>`;
}

async function write(rel: string, markup: string) {
  const out = resolve(OUT, rel);
  mkdirSync(dirname(out), { recursive: true });
  await sharp(Buffer.from(markup)).webp({ quality: 82 }).toFile(out);
}

async function runBatched<T>(items: T[], fn: (t: T) => Promise<void>, size = 24) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(fn));
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const t0 = Date.now();
  const jobs: Array<{ rel: string; markup: string }> = [];

  // Default / homepage card (light, brand-forward)
  jobs.push({ rel: 'default.webp', markup: homeCardSvg() });

  // Born-on date cards (366) — birthstone accent per month
  for (let m = 1; m <= 12; m++) {
    const accent = BIRTHSTONE_DATA[m - 1]?.hexColor || GOLD;
    for (let d = 1; d <= MONTH_DAYS[m]; d++) {
      jobs.push({ rel: `born-on/${MONTHS[m]}-${d}.webp`, markup: svg({ eyebrow: 'Born on', title: `${cap(MONTHS[m])} ${d}`, accent, sub: 'Famous birthdays · zodiac · birthstone', titleSize: 92 }) });
    }
  }
  // Month hubs (12)
  for (const mh of MONTH_HUB_DATA) {
    const accent = BIRTHSTONE_DATA[mh.monthNumber - 1]?.hexColor || GOLD;
    jobs.push({ rel: `month/${mh.slug}.webp`, markup: svg({ eyebrow: 'Born in', title: mh.month, accent, sub: `${mh.zodiacSpans.map(z => z.sign).join(' & ')} · birthstone · birth flowers`, titleSize: 92 }) });
  }
  // Zodiac signs (12)
  for (const z of ZODIAC_DATA) {
    jobs.push({ rel: `zodiac/${z.slug}.webp`, markup: svg({ eyebrow: 'Zodiac Sign', title: z.name, sub: z.dateRange, titleSize: 88 }) });
  }
  // Fitness / rhythm pages (6)
  for (const f of FITNESS_PAGES) {
    jobs.push({ rel: `fitness/${f.slug}.webp`, markup: svg({ eyebrow: 'Rhythm Check-in', title: f.h1, sub: 'A reflection tool, not a prescription', titleSize: 58 }) });
  }
  // Blog posts (all)
  for (const p of blogPosts) {
    jobs.push({ rel: `blog/${p.slug}.webp`, markup: svg({ eyebrow: 'BornClock Blog', title: p.title, sub: `${p.readTime} min read`, titleSize: 54 }) });
  }

  await runBatched(jobs, j => write(j.rel, j.markup));
  console.log(`[og-cards] generated ${jobs.length} images into dist/og/ in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch(e => { console.error('[og-cards]', e); process.exit(1); });
