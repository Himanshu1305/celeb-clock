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
  // Weight on planets (single-segment route → picked up by the fitness/{slug} OG mapping)
  jobs.push({ rel: 'fitness/weight-on-planets.webp', markup: svg({ eyebrow: 'Cosmic Weigh-in', title: 'Your weight on every planet', sub: 'From bouncy Moon to crushing Jupiter', titleSize: 60 }) });
  // Blog posts (all)
  for (const p of blogPosts) {
    jobs.push({ rel: `blog/${p.slug}.webp`, markup: svg({ eyebrow: 'BornClock Blog', title: p.title, sub: `${p.readTime} min read`, titleSize: 54 }) });
  }

  // ── Single-segment calculator pages (fitness/ prefix = auto-detected by prerender) ──

  jobs.push({ rel: 'fitness/age-calculator.webp', markup: svg({
    eyebrow: 'Age Calculator',
    title: 'How old are you — really?',
    sub: 'Years · months · days · hours · seconds · live',
    titleSize: 72
  })});

  jobs.push({ rel: 'fitness/life-expectancy.webp', markup: svg({
    eyebrow: 'Life Expectancy',
    title: 'How long will you live?',
    sub: 'Science-based longevity estimate · 15 lifestyle factors · WHO data',
    titleSize: 68
  })});

  jobs.push({ rel: 'fitness/biological-age.webp', markup: svg({
    eyebrow: 'Biological Age',
    title: 'Your body may be younger than your birthday.',
    sub: '12 WHO-validated biomarkers · Free · No sign-up needed',
    titleSize: 60
  })});

  jobs.push({ rel: 'fitness/moon-sign.webp', markup: svg({
    eyebrow: 'Moon Sign Calculator',
    title: "Your moon sign is probably more 'you' than your sun sign.",
    sub: 'Find yours free — by date of birth',
    titleSize: 54
  })});

  jobs.push({ rel: 'fitness/compatibility.webp', markup: svg({
    eyebrow: 'Compatibility Calculator',
    title: 'Are you compatible?',
    sub: 'Zodiac · numerology · Western & Vedic — by date of birth',
    titleSize: 72
  })});

  jobs.push({ rel: 'fitness/numerology.webp', markup: svg({
    eyebrow: 'Numerology',
    title: 'Your life path number reveals more than you think.',
    sub: 'Free numerology calculator · by date of birth',
    titleSize: 60
  })});

  jobs.push({ rel: 'fitness/country-comparison.webp', markup: svg({
    eyebrow: 'Life Expectancy by Country',
    title: 'How does where you live affect how long you live?',
    sub: 'Compare 50+ countries · WHO 2023 data · Free',
    titleSize: 58
  })});

  jobs.push({ rel: 'fitness/biorhythm.webp', markup: svg({
    eyebrow: 'Biorhythm Calculator',
    title: 'Your physical, emotional & mental cycles — mapped.',
    sub: 'Free biorhythm calculator · by date of birth',
    titleSize: 60
  })});

  jobs.push({ rel: 'fitness/generation.webp', markup: svg({
    eyebrow: 'Generation Finder',
    title: "Gen Z? Millennial? Boomer? Find out what shaped you.",
    sub: 'Your generation · defining events · cultural identity',
    titleSize: 60
  })});

  jobs.push({ rel: 'fitness/planetary-age.webp', markup: svg({
    eyebrow: 'Planetary Age',
    title: 'How old are you on Mars?',
    sub: 'Your age on every planet in the solar system · NASA data',
    titleSize: 68
  })});

  jobs.push({ rel: 'fitness/birthday-report.webp', markup: svg({
    eyebrow: 'Birthday Report',
    title: 'The most meaningful birthday gift — their complete story.',
    sub: '9-section personalised report · from their date of birth',
    titleSize: 60
  })});

  jobs.push({ rel: 'fitness/coach.webp', markup: svg({
    eyebrow: 'Longevity Coach',
    title: 'Add years to your life. Start with your birthday.',
    sub: 'Personalised longevity plan · science-backed · free',
    titleSize: 64
  })});

  jobs.push({ rel: 'fitness/celebrity-birthday.webp', markup: svg({
    eyebrow: 'Celebrity Birthday Twin',
    title: 'Who shares your birthday?',
    sub: '50,000+ celebrities · actors · athletes · leaders · scientists',
    titleSize: 64
  })});

  jobs.push({ rel: 'fitness/todays-birthdays.webp', markup: svg({
    eyebrow: "Today's Famous Birthdays",
    title: 'Who is celebrating today?',
    sub: 'Famous birthdays updated daily · worldwide',
    titleSize: 68
  })});

  jobs.push({ rel: 'fitness/zodiac.webp', markup: svg({
    eyebrow: 'Zodiac Calculator',
    title: 'More than your sun sign.',
    sub: 'Western · Vedic · Chinese · Moon sign · by date of birth',
    titleSize: 72
  })});

  jobs.push({ rel: 'fitness/birthstone.webp', markup: svg({
    eyebrow: 'Birthstone Finder',
    title: 'Your birth month gem — and what it means.',
    sub: 'History · healing properties · how to wear it',
    titleSize: 64
  })});

  jobs.push({ rel: 'fitness/biological-age-vs-chronological-age.webp', markup: svg({
    eyebrow: 'Biological vs Chronological Age',
    title: 'Only one of these can change.',
    sub: 'Which one is actually you? The science explained.',
    titleSize: 68
  })});

  jobs.push({ rel: 'fitness/sun-vs-moon-sign.webp', markup: svg({
    eyebrow: 'Sun Sign vs Moon Sign',
    title: 'Which one actually describes you?',
    sub: 'Most people identify more with their moon sign once they find it.',
    titleSize: 56
  })});

  jobs.push({ rel: 'fitness/answers.webp', markup: svg({
    eyebrow: 'BornClock Answers',
    title: 'Birthday questions. Science-backed answers.',
    sub: 'Age · longevity · astrology · numerology',
    titleSize: 68
  })});

  jobs.push({ rel: 'fitness/embed.webp', markup: svg({
    eyebrow: 'Free Widget',
    title: 'Embed BornClock on your website — free.',
    sub: 'Age calculator widget · one line of code · always up to date',
    titleSize: 60
  })});

  jobs.push({ rel: 'fitness/age-in-days.webp', markup: svg({
    eyebrow: 'Age in Days',
    title: 'How many days old are you?',
    sub: 'A 30-year-old has lived 10,957 days. What about you?',
    titleSize: 68
  })});

  jobs.push({ rel: 'fitness/age-in-seconds.webp', markup: svg({
    eyebrow: 'Age in Seconds',
    title: 'You have lived this many seconds.',
    sub: 'A 30-year-old has passed 946 million seconds. Watch it tick.',
    titleSize: 60
  })});

  jobs.push({ rel: 'fitness/birthday-countdown.webp', markup: svg({
    eyebrow: 'Birthday Countdown',
    title: 'How many days until your next birthday?',
    sub: 'Exact countdown · day of week · celebrity twins',
    titleSize: 60
  })});

  // Shared card for all country longevity pages (multi-segment — needs prerender fix too)
  jobs.push({ rel: 'fitness/country-longevity.webp', markup: svg({
    eyebrow: 'Life Expectancy',
    title: 'What does where you were born mean for how long you live?',
    sub: 'WHO 2023 data · country comparison · personalised estimate',
    titleSize: 56
  })});

  // Shared card for Hindi pages (multi-segment — needs prerender fix too)
  jobs.push({ rel: 'fitness/hindi.webp', markup: svg({
    eyebrow: 'BornClock हिंदी',
    title: 'अपनी जन्म तिथि से सब कुछ जानें।',
    sub: 'Age · life expectancy · zodiac · numerology — free',
    titleSize: 60
  })});

  await runBatched(jobs, j => write(j.rel, j.markup));
  console.log(`[og-cards] generated ${jobs.length} images into dist/og/ in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch(e => { console.error('[og-cards]', e); process.exit(1); });
