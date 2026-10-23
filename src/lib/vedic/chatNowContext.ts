/**
 * Audit K7 — "today" context for the AI astrologer chat.
 *
 * The chat used to answer "How is Saturn's transit for me?" blind: it never knew
 * today's date, the person's age, or where the slow planets are now, so it could
 * contradict the Rashifal pages. This builds that context from the SAME engine the
 * Rashifal uses (readPlanetTransit → house from the Moon sign, tone, Sade Sati/Dhaiya),
 * so the chat and Rashifal agree.
 */
import type { BirthChartResult } from './calculateBirthChart';
import { readPlanetTransit, findIngress } from './rashifal';
import { RASHI_NAMES } from './engine/vedicEngine';
import { formatMonthYear } from './yogaTiming';

export type MaritalStatus = 'single' | 'married' | 'not-said';

export interface NowTransit {
  planet: 'Saturn' | 'Jupiter' | 'Rahu' | 'Ketu';
  sign: string;               // sign name as the chart engine spells it ("Meena")
  houseFromMoon: number;
  houseFromLagna: number;
  tone: string;               // favourable / mixed / challenging (Rashifal engine)
  note?: string;              // Sade Sati / Dhaiya
  nextChange?: { sign: string; monthYear: string } | null;
}

export interface NowContext {
  todayLabel: string;         // "Friday, 23 October 2026"
  todayMonthYear: string;     // "October 2026"
  timeZone: string;           // IANA zone the date was computed in
  timeZoneSource: 'user' | 'birthplace' | 'utc';
  ageYears: number | null;
  currentDasha: { maha: string; mahaRange: string; antar: string; antarRange: string } | null;
  transits: NowTransit[];
  maritalStatus: MaritalStatus;
  /** Month-year tokens the date guard must accept (today + transit sign changes). */
  validMonths: string[];
}

function validZone(tz: unknown): tz is string {
  if (typeof tz !== 'string' || !tz || tz.length > 64) return false;
  try { new Intl.DateTimeFormat('en-GB', { timeZone: tz }); return true; } catch { return false; }
}

/** Normalise a client-sent marital status; anything else → 'not-said'. */
export function normaliseMaritalStatus(v: unknown): MaritalStatus {
  return v === 'single' || v === 'married' ? v : 'not-said';
}

export function buildNowContext(
  chart: BirthChartResult,
  now: Date,
  opts: { ageYears?: number | null; userTimeZone?: unknown; birthTimeZone?: unknown; maritalStatus?: unknown } = {},
): NowContext {
  const timeZone = validZone(opts.userTimeZone) ? opts.userTimeZone : validZone(opts.birthTimeZone) ? opts.birthTimeZone : 'UTC';
  const timeZoneSource: NowContext['timeZoneSource'] = validZone(opts.userTimeZone) ? 'user' : validZone(opts.birthTimeZone) ? 'birthplace' : 'utc';
  const todayLabel = new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, month: 'long', year: 'numeric' }).format(now); // "October 2026"
  const validMonths = new Set<string>([parts]);

  const cd = chart.currentDasha;
  const currentDasha = cd && cd.mahadasha_start && cd.antardasha_start
    ? {
        maha: cd.mahadasha, mahaRange: `${formatMonthYear(cd.mahadasha_start)} to ${formatMonthYear(cd.mahadasha_end)}`,
        antar: cd.antardasha, antarRange: `${formatMonthYear(cd.antardasha_start)} to ${formatMonthYear(cd.antardasha_end)}`,
      }
    : null;
  if (currentDasha) {
    for (const r of [currentDasha.mahaRange, currentDasha.antarRange]) for (const m of r.split(' to ')) validMonths.add(m);
  }

  const moon = chart.planets.find(p => p.name === 'Moon');
  const moonSignIdx = moon ? moon.signIndex - 1 : -1; // signIndex is 1-based
  const lagnaIdx = chart.lagna.rashiIndex;
  const transits: NowTransit[] = [];
  if (moonSignIdx >= 0) {
    const horizonYears: Record<NowTransit['planet'], number> = { Saturn: 3, Jupiter: 2, Rahu: 2, Ketu: 2 };
    for (const planet of ['Saturn', 'Jupiter', 'Rahu', 'Ketu'] as const) {
      const t = readPlanetTransit(planet, moonSignIdx, now);
      const end = new Date(now.getTime() + horizonYears[planet] * 365.25 * 864e5);
      let nextChange: NowTransit['nextChange'] = null;
      try {
        const ing = findIngress(planet, now, end);
        if (ing) { nextChange = { sign: RASHI_NAMES[ing.signIndex], monthYear: formatMonthYear(`${ing.dateISO}T12:00:00Z`) }; validMonths.add(nextChange.monthYear); }
      } catch { /* no ingress info — omit */ }
      transits.push({
        planet, sign: RASHI_NAMES[t.signIndex], houseFromMoon: t.house,
        houseFromLagna: ((t.signIndex - lagnaIdx + 12) % 12) + 1, tone: t.tone,
        note: t.sadeSati ? 'Sade Sati (Saturn in the 12th, 1st or 2nd from the Moon)' : t.dhaiya ? 'Dhaiya / Kantaka Shani (Saturn in the 4th or 8th from the Moon)' : undefined,
        nextChange,
      });
    }
  }

  return {
    todayLabel, todayMonthYear: parts, timeZone, timeZoneSource,
    ageYears: typeof opts.ageYears === 'number' && Number.isFinite(opts.ageYears) ? opts.ageYears : null,
    currentDasha, transits, maritalStatus: normaliseMaritalStatus(opts.maritalStatus),
    validMonths: [...validMonths],
  };
}

const ord = (n: number) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };

/** The prompt block injected into the chat system prompt. */
export function nowContextBlock(c: NowContext): string {
  const lines: string[] = [];
  lines.push(`TODAY AND NOW (use these for any "now / this year / current transit / my age" question — never guess them):`);
  lines.push(`- Today's date: ${c.todayLabel} (${c.timeZoneSource === 'user' ? `the user's time zone, ${c.timeZone}` : c.timeZoneSource === 'birthplace' ? `birthplace time zone ${c.timeZone}; the user's own zone is unknown` : 'UTC; the user\'s own zone is unknown'}).`);
  lines.push(`- Age: ${c.ageYears === null ? 'unknown' : `${c.ageYears} years old`}.`);
  if (c.currentDasha) lines.push(`- Running now: ${c.currentDasha.maha} Mahadasha (${c.currentDasha.mahaRange}), ${c.currentDasha.antar} Antardasha (${c.currentDasha.antarRange}).`);
  if (c.transits.length) {
    lines.push('- Current transits (sidereal, Lahiri — the same engine as the Rashifal pages):');
    for (const t of c.transits) {
      lines.push(`  - ${t.planet} in ${t.sign}: ${ord(t.houseFromMoon)} house from the Moon sign, ${ord(t.houseFromLagna)} from the Lagna; Rashifal tone ${t.tone}${t.note ? `; ${t.note}` : ''}${t.nextChange ? `; next moves into ${t.nextChange.sign} around ${t.nextChange.monthYear}` : ''}.`);
    }
  }
  const ms = c.maritalStatus === 'married'
    ? 'married (the user told us). Never offer a "marriage window" or imply a new/second marriage; read Venus / 7th-lord periods as times that emphasise partnership harmony, shared decisions and family life.'
    : c.maritalStatus === 'single' ? 'single (the user told us). Marriage timing may be given as windows only, never as dates or certainty.'
    : 'not stated. Do not assume it.';
  lines.push(`- Marital status: ${ms}`);
  return lines.join('\n');
}
