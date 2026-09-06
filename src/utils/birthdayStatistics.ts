/**
 * Birthday rarity — exclusive data derived from our celebrity DB. For a given
 * calendar date, how many celebrities share it, and how that ranks vs all 366
 * dates (percentile + human label).
 */
import celebritiesData from '@/data/celebrities.json';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// Count celebrities per MM-DD once at module load.
const COUNT_BY_MD = new Map<string, number>();
for (const c of (celebritiesData.celebrities as Array<{ birth_month_day?: string | null }>)) {
  const md = c.birth_month_day;
  if (md) COUNT_BY_MD.set(md, (COUNT_BY_MD.get(md) || 0) + 1);
}
// Sorted list of all date counts for percentile ranking.
const ALL_COUNTS = Array.from(COUNT_BY_MD.values()).sort((a, b) => a - b);

const pad = (n: number) => String(n).padStart(2, '0');

export function getCelebrityCountForDate(month: number, day: number): number {
  if (!Number.isFinite(month) || !Number.isFinite(day)) return 0;
  return COUNT_BY_MD.get(`${pad(month)}-${pad(day)}`) || 0;
}

export interface BirthdayRarityScore {
  count: number;
  percentile: number; // 0-100 — % of dates with FEWER celebrities (rarer = higher)
  label: 'Rare' | 'Uncommon' | 'Common' | 'Very Common';
  description: string;
}

export function getBirthdayRarityScore(month: number, day: number): BirthdayRarityScore {
  const count = getCelebrityCountForDate(month, day);
  // Percentile by celebrity count: more celebrities → "more common" birthday.
  const below = ALL_COUNTS.filter(c => c < count).length;
  const total = ALL_COUNTS.length || 1;
  const commonPercentile = Math.round((below / total) * 100); // high = common
  const percentile = Math.max(0, Math.min(100, 100 - commonPercentile)); // high = rare

  let label: BirthdayRarityScore['label'];
  if (count <= 2) label = 'Rare';
  else if (count <= 6) label = 'Uncommon';
  else if (count <= 12) label = 'Common';
  else label = 'Very Common';

  const monthName = MONTHS[Math.max(0, Math.min(11, month - 1))] || '';
  const description = count > 0
    ? `${count} famous ${count === 1 ? 'person' : 'celebrities and notable people'} in our database ${count === 1 ? 'was' : 'were'} born on ${monthName} ${day}. That makes it a ${label.toLowerCase()} birthday.`
    : `No celebrities in our database are recorded as born on ${monthName} ${day} yet — a rare birthday to have!`;

  return { count, percentile, label, description };
}
