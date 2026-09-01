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
  const dayNum = Number(day); // Ensures no leading zero e.g. "06" → 6

  if (!celebrities || celebrities.length === 0) {
    return `Born on ${month} ${dayNum}? Discover Your Celebrity Birthday Twins · BornClock`;
  }

  const fullName = celebrities[0]?.name || '';
  if (!fullName) {
    return `Born on ${month} ${dayNum}? Discover Your Celebrity Birthday Twins · BornClock`;
  }

  // Try full name first
  const titleFull = `Born on ${month} ${dayNum}? ${fullName} Shares Your Birthday · BornClock`;
  if (titleFull.length <= 70) return titleFull;

  // Try first name only
  const firstName = fullName.split(' ')[0];
  const titleShort = `Born on ${month} ${dayNum}? ${firstName} Shares Your Birthday · BornClock`;
  if (titleShort.length <= 70) return titleShort;

  // Final fallback
  return `Born on ${month} ${dayNum}? Discover Your Celebrity Birthday Twins · BornClock`;
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
