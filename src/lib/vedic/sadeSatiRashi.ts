/**
 * Per-rashi Sade Sati & Dhaiya periods (Batch 9b) — for /sade-sati/:rashi and
 * /hi/sade-sati/:rashi.
 *
 * Pure and fast (no ephemeris): it reads the Saturn sign-ingress table that
 * scripts/gen-saturn-ingresses.mts precomputed with our chart engine
 * (src/data/saturnIngresses.json, 1940–2071, every retrograde back-and-forth crossing
 * included). Status only changes at those ingress instants, so the browser can work out
 * the correct status for TODAY from the same table — the page never relies on a
 * build-time "currently in phase X".
 *
 * Conventions match the personal calculator (src/lib/vedic/sadeSati.ts):
 *   Sade Sati = Saturn in the 12th (phase 1, Rising), 1st (phase 2, Peak) or 2nd
 *   (phase 3, Setting) sign counted from the Moon sign; Dhaiya = Saturn in the 4th
 *   (Kantaka) or 8th (Ashtama). A cycle runs from Saturn's FIRST entry to its FINAL
 *   exit; retrograde loops that briefly take Saturn back out (gap < 3 years) stay
 *   inside the cycle as "outside" segments instead of ending it.
 */
import table from '@/data/saturnIngresses.json';

export interface SaturnIngressRow { utc: string; from: number; to: number }
const INGRESSES: SaturnIngressRow[] = (table as { ingresses: SaturnIngressRow[] }).ingresses;
const INITIAL_SIGN: number = (table as { initialSign: number }).initialSign;
const ING_MS = INGRESSES.map(r => Date.parse(r.utc.replace('Z', ':00Z')));

/** Range shown on the pages. */
export const SHOWN_FROM = Date.UTC(1950, 0, 1);
export const SHOWN_TO = Date.UTC(2061, 0, 1);
const YEAR = 365.25 * 864e5;
const MAX_GAP = 3 * YEAR;

export type PeriodType = 'sadeSati' | 'kantaka' | 'ashtama';

/** One stay of Saturn in one sign, inside a period. */
export interface PeriodSegment {
  sign: number;              // 0-11 sidereal sign Saturn is in
  house: number;             // 1-12 counted from the Moon sign
  /** 1/2/3 for Sade Sati segments in the 12th/1st/2nd; null otherwise. */
  phase: 1 | 2 | 3 | null;
  /** True when this stay is one of the period's own signs; false = a retrograde step outside. */
  inside: boolean;
  /** True when Saturn entered this sign moving backwards (retrograde re-entry). */
  retroEntry: boolean;
  start: string;             // ISO instant (UTC)
  end: string;
}
export interface SaturnPeriod {
  type: PeriodType;
  start: string;             // first entry
  end: string;               // final exit
  segments: PeriodSegment[];
}

export type RashiStatus =
  | { kind: 'sadeSati'; phase: 1 | 2 | 3; sign: number; since: string; until: string; period: SaturnPeriod }
  | { kind: 'sadeSatiPaused'; sign: number; since: string; until: string; period: SaturnPeriod }
  | { kind: 'dhaiya'; type: 'kantaka' | 'ashtama'; sign: number; since: string; until: string; period: SaturnPeriod }
  | { kind: 'dhaiyaPaused'; type: 'kantaka' | 'ashtama'; sign: number; since: string; until: string; period: SaturnPeriod }
  | { kind: 'none'; sign: number; since: string; until: string };

const iso = (ms: number) => new Date(ms).toISOString();
const houseFrom = (moon: number, sign: number) => ((sign - moon + 12) % 12) + 1;

/** Saturn's sidereal sign at an instant (from the precomputed table). */
export function saturnSignFromTable(t: Date | number): number {
  const ms = typeof t === 'number' ? t : t.getTime();
  // last ingress at or before ms
  let lo = 0, hi = ING_MS.length - 1, idx = -1;
  while (lo <= hi) { const mid = (lo + hi) >> 1; if (ING_MS[mid] <= ms) { idx = mid; lo = mid + 1; } else hi = mid - 1; }
  return idx < 0 ? INITIAL_SIGN : INGRESSES[idx].to;
}

/** Every complete stay of Saturn in one sign (both ends known) in the table. */
interface Stay { sign: number; start: number; end: number; retroEntry: boolean }
const STAYS: Stay[] = INGRESSES.slice(0, -1).map((r, i) => ({
  sign: r.to, start: ING_MS[i], end: ING_MS[i + 1], retroEntry: r.to === (r.from + 11) % 12,
}));

function signsFor(moon: number, type: PeriodType): number[] {
  if (type === 'sadeSati') return [(moon + 11) % 12, moon, (moon + 1) % 12];
  return [(moon + (type === 'kantaka' ? 3 : 7)) % 12];
}

/** All periods of one type for a Moon sign, from the full table (complete periods only). */
function allPeriods(moon: number, type: PeriodType): SaturnPeriod[] {
  const set = signsFor(moon, type);
  const groups: Array<{ first: number; last: number }> = [];
  STAYS.forEach((s, i) => {
    if (!set.includes(s.sign)) return;
    const g = groups[groups.length - 1];
    if (g && s.start - STAYS[g.last].end < MAX_GAP) g.last = i; else groups.push({ first: i, last: i });
  });
  // A group touching the first/last stay of the table may be cut off by the table edge.
  return groups
    .filter(g => g.first > 0 && g.last < STAYS.length - 1)
    .map(g => ({
      type,
      start: iso(STAYS[g.first].start),
      end: iso(STAYS[g.last].end),
      segments: STAYS.slice(g.first, g.last + 1).map(s => {
        const house = houseFrom(moon, s.sign);
        const inside = set.includes(s.sign);
        const phase = type === 'sadeSati' && inside ? (house === 12 ? 1 : house === 1 ? 2 : 3) as 1 | 2 | 3 : null;
        return { sign: s.sign, house, phase, inside, retroEntry: s.retroEntry, start: iso(s.start), end: iso(s.end) };
      }),
    }));
}

const cache = new Map<string, SaturnPeriod[]>();
/** Periods of one type for a Moon sign that overlap 1950–2060 (the range the pages show). */
export function periodsFor(moon: number, type: PeriodType): SaturnPeriod[] {
  const key = `${moon}:${type}`;
  if (!cache.has(key)) {
    cache.set(key, allPeriods(moon, type).filter(p => Date.parse(p.end) > SHOWN_FROM && Date.parse(p.start) < SHOWN_TO));
  }
  return cache.get(key)!;
}

/** Saturn's current stay [since, until) at an instant. */
function stayAt(ms: number): { sign: number; since: number; until: number } | null {
  const s = STAYS.find(st => st.start <= ms && ms < st.end);
  return s ? { sign: s.sign, since: s.start, until: s.end } : null;
}

/** Sade Sati / Dhaiya status for a Moon sign at an instant (null outside the table). */
export function statusAt(moon: number, t: Date | number): RashiStatus | null {
  const ms = typeof t === 'number' ? t : t.getTime();
  const st = stayAt(ms);
  if (!st) return null;
  const house = houseFrom(moon, st.sign);
  const base = { sign: st.sign, since: iso(st.since), until: iso(st.until) };
  const within = (type: PeriodType) => allPeriods(moon, type).find(p => Date.parse(p.start) <= ms && ms < Date.parse(p.end));
  if (house === 12 || house === 1 || house === 2) {
    const period = within('sadeSati');
    if (period) return { kind: 'sadeSati', phase: house === 12 ? 1 : house === 1 ? 2 : 3, ...base, period };
  }
  if (house === 4 || house === 8) {
    const type = house === 4 ? 'kantaka' : 'ashtama';
    const period = within(type);
    if (period) return { kind: 'dhaiya', type, ...base, period };
  }
  const ss = within('sadeSati');
  if (ss) return { kind: 'sadeSatiPaused', ...base, period: ss };
  for (const type of ['kantaka', 'ashtama'] as const) {
    const p = within(type);
    if (p) return { kind: 'dhaiyaPaused', type, ...base, period: p };
  }
  return { kind: 'none', ...base };
}

/** The next period of the given types that starts after an instant. */
export function nextPeriod(moon: number, t: Date | number, types: PeriodType[]): SaturnPeriod | null {
  const ms = typeof t === 'number' ? t : t.getTime();
  const all = types.flatMap(ty => allPeriods(moon, ty)).filter(p => Date.parse(p.start) > ms);
  all.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  return all[0] ?? null;
}

/** All Saturn ingresses in the shown range (for tests / the page's methodology note). */
export function ingressesInRange(fromMs = SHOWN_FROM, toMs = SHOWN_TO): SaturnIngressRow[] {
  return INGRESSES.filter((_, i) => ING_MS[i] >= fromMs && ING_MS[i] < toMs);
}
