/**
 * Generates the SEO title for a born-on date page.
 * Format: "Born on August 6? Tom Hanks Shares Your Birthday · BornClock"
 * Fallback (no celebrities): "Born on August 6? Discover Your Celebrity Birthday Twins · BornClock"
 * Max length: 70 characters
 */
export function generateBornOnTitle(
  month: string,
  day: number | string,
  celebrities: Array<{ name: string }> = []
): string {
  // B23: mirrors the searches ("august 15 birthday", "famous people born on august 15").
  // Mirrored in scripts/prerender-titles.mjs (bornOnTitle) — keep the two in sync.
  const d = Number(day); // "06" → 6
  const full = celebrities?.[0]?.name || '';
  const first = full.split(' ')[0];
  const opts = [
    ...(full ? [`${month} ${d} Birthdays: ${full} & More Famous People | BornClock`] : []),
    ...(first && first !== full ? [`${month} ${d} Birthdays: ${first} & More Famous People | BornClock`] : []),
    `${month} ${d} Birthdays: Famous People Born on ${month} ${d} | BornClock`,
    `${month} ${d} Birthdays — Famous People | BornClock`,
  ];
  return opts.find(t => t.length <= 70) || opts[opts.length - 1];
}

/**
 * Generates the SEO meta description for a born-on date page.
 * Format: "23 famous people share your August 6 birthday including Tom Hanks and K. Balachander.
 *          Discover your zodiac, numerology, life expectancy, and complete birthday intelligence. Free instant report."
 * Max length: 160 characters
 */
export function generateBornOnMeta(
  month: string,
  day: number | string,
  celebrities: Array<{ name: string }> = []
): string {
  const dayNum = Number(day);

  if (!celebrities || celebrities.length === 0) {
    return `Discover famous people born on ${month} ${dayNum}. Find your zodiac, numerology, life expectancy, and complete birthday intelligence. Free instant report.`;
  }

  const count = celebrities.length;
  const personWord = count === 1 ? 'person shares' : 'people share';
  const name1 = celebrities[0]?.name || '';
  const name2 = celebrities[1]?.name || '';

  // Kept short so the primary format (count + two full names + suffix) fits inside
  // the 160-char cap without truncating "Free instant report". A longer suffix
  // (e.g. "…complete birthday intelligence.") pushed August-6 + two names to ~191.
  const suffix = 'Discover your zodiac, numerology, life expectancy. Free instant report.';

  // Build with full names
  const withTwo = name2
    ? `${count} famous ${personWord} your ${month} ${dayNum} birthday including ${name1} and ${name2}. ${suffix}`
    : `${count} famous ${personWord} your ${month} ${dayNum} birthday including ${name1}. ${suffix}`;

  if (withTwo.length <= 160) return withTwo;

  // Try with first names only
  const short1 = name1.split(' ')[0];
  const short2 = name2 ? name2.split(' ')[0] : '';
  const withShort = short2
    ? `${count} famous ${personWord} your ${month} ${dayNum} birthday including ${short1} and ${short2}. ${suffix}`
    : `${count} famous ${personWord} your ${month} ${dayNum} birthday including ${short1}. ${suffix}`;

  if (withShort.length <= 160) return withShort;

  // Hard cap
  return withShort.slice(0, 157) + '...';
}

// ── Indian born-on facet (/born-on/:slug/india) ───────────────
// Batch 6 SEO: the India page used the same title/meta as the global date page, so
// the two competed for the same query. These India-specific variants say "Indian"
// up front. Mirrored in scripts/prerender-titles.mjs (bornOnIndiaTitle/Meta) — keep
// the two in sync.

/**
 * B23 (GSC): the India date pages sit at positions 5–9 but got 0.2–0.9% CTR — Indians search
 * "6 august birthday indian celebrity" (day first, with "birthday"). The title now mirrors that:
 * "6 August Birthday: Indian Celebrities Born on Aug 6 — Kajol | BornClock" (≤70 chars).
 */
export function generateBornOnIndiaTitle(
  month: string,
  day: number | string,
  celebrities: Array<{ name: string }> = []
): string {
  const d = Number(day);
  const head = `${d} ${month} Birthday: Indian Celebrities`;
  const first = celebrities?.[0]?.name || '';
  const opts = [
    ...(first ? [`${head} — ${first} & More | BornClock`, `${head} — ${first} & More`] : []),
    `${head} Born on ${month} ${d} | BornClock`,
    `${head} | BornClock`,
  ];
  return opts.find(t => t.length <= 70) || opts[opts.length - 1];
}

/**
 * India meta description (≤155 chars). `total` overrides the list length when known.
 * GSC 2026-11-28: queries are month-first ("november 10 famous birthdays india", pos 4, 0 clicks),
 * so the meta now opens with that phrase and keeps the day-first date for the B23 wording.
 */
export function generateBornOnIndiaMeta(
  month: string,
  day: number | string,
  celebrities: Array<{ name: string }> = [],
  total?: number
): string {
  const dayNum = Number(day);
  const count = total ?? celebrities?.length ?? 0;
  const n1 = celebrities?.[0]?.name || '';
  const n2 = celebrities?.[1]?.name || '';
  const tail = 'Ranked by recognition, with ages and professions.';
  if (!count || !n1) {
    return `${month} ${dayNum} famous birthdays in India: whose birthday is on ${dayNum} ${month}? Actors, cricketers, leaders and more. ${tail}`;
  }
  const who = count === 1 ? 'Indian shares' : 'Indians share';
  const build = (a: string, b: string) =>
    `${month} ${dayNum} famous birthdays in India: ${count} ${who} ${dayNum} ${month}, including ${a}${b ? ` and ${b}` : ''}. ${tail}`;
  const full = build(n1, n2);
  if (full.length <= 155) return full;
  const short = build(n1.split(' ')[0], n2 ? n2.split(' ')[0] : '');
  return short.length <= 155 ? short : short.slice(0, 152) + '...';
}

// ── Months lookup ────────────────────────────────────────────
const MONTH_TO_NUM: Record<string, string> = {
  January: '01', February: '02', March: '03', April: '04',
  May: '05', June: '06', July: '07', August: '08',
  September: '09', October: '10', November: '11', December: '12',
};

/**
 * Builds the heading text for the Birthday Report CTA.
 * Exported separately so it can be unit-tested independently.
 *
 * 0 celebs  → "Discover your complete Birthday Intelligence Report for August 6"
 * 1 celeb   → "You share a birthday with Tom Hanks"
 * 2 celebs  → "You share a birthday with Virat Kohli and Kader Khan"
 * 3+ celebs → "You share a birthday with Chanakya and 27 others"
 */
export function buildCTAHeading(
  celebrities: Array<{ name: string }> = [],
  month: string,
  day: number | string
): string {
  const dayNum = Number(day);
  const count = celebrities?.length ?? 0;

  if (count === 0 || !celebrities) {
    return `Discover your complete Birthday Intelligence Report for ${month} ${dayNum}`;
  }

  const first = celebrities[0]?.name?.trim() || '';
  if (!first) {
    return `Discover your complete Birthday Intelligence Report for ${month} ${dayNum}`;
  }

  if (count === 1) return `You share a birthday with ${first}`;

  if (count === 2) {
    const second = celebrities[1]?.name?.trim() || '';
    return second
      ? `You share a birthday with ${first} and ${second}`
      : `You share a birthday with ${first}`;
  }

  // 3 or more
  return `You share a birthday with ${first} and ${count - 1} others`;
}

/**
 * Constructs the DOB query parameter for the birthday report URL.
 * Uses representative year 1990 — BirthdayReport prefills the month/day from
 * this and leaves the year blank so the visitor supplies their actual birth year.
 *
 * Format: ISO YYYY-MM-DD (matches the dob string BirthdayReport builds internally).
 */
export function buildDobParam(month: string, day: number | string): string {
  const monthNum = MONTH_TO_NUM[month] ?? '01';
  const dayStr = String(Number(day)).padStart(2, '0');
  return `1990-${monthNum}-${dayStr}`;
}
