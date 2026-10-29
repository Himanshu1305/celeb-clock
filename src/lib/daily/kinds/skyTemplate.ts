/**
 * Batch 10 — pure templates for the "Planets today" (/planets-today) and "Moon phase"
 * (/moon-phase) daily pages, built from compact per-day DATA computed at build time by
 * ./skyDaily.ts (data kinds 'planet-day' and 'moon-day', one shared file per month).
 * No engine imports (Worker-safe): the Worker, the browser and the tests all call these.
 */
import type { DailyEntry, DailyItem, DailySection } from '../types';
import { formatDateEn, formatLongDateEn, formatShortDateEn, istDateISO, istClock } from '../dates';
import { GRAHAS, GRAHA_HI, RASHI_EN, SIGN_WESTERN, NAKSHATRA_EN, COMBUST_ORBS, isCombust, placeOf, type Graha } from '../../vedic/skyTables';
import { PANCHANG_TABLES } from '../../vedic/panchang';

// ── Planets today ────────────────────────────────────────────────────────────
/** Compact data for one India date, at 12:00 noon IST. */
export interface PlanetDayData {
  /** [sidereal longitude, speed °/day] per graha, in GRAHAS order (4 decimals). */
  p: Array<[number, number]>;
  /** Next sign change per graha: [epoch minute (UTC), new sign 0..11, 1 = show clock time]. */
  x: Array<[number, number, number] | null>;
}

const dms = (deg: number) => {
  const totalMin = Math.floor(deg * 60 + 1e-9);
  return `${Math.floor(totalMin / 60)}°${String(totalMin % 60).padStart(2, '0')}′`;
};
const whenText = (x: [number, number, number]) => {
  const at = new Date(x[0] * 60000);
  const d = formatShortDateEn(istDateISO(at));
  return x[2] ? `${d}, ${istClock(at)} IST` : d;
};
const isNode = (g: Graha) => g === 'Rahu' || g === 'Ketu';

export interface PlanetRow {
  planet: Graha; sign: number; deg: number; nakshatra: number; pada: number;
  retro: boolean; combust: boolean; next: [number, number, number] | null;
}
export function planetRows(d: PlanetDayData): PlanetRow[] {
  const sun = d.p[0][0];
  return GRAHAS.map((g, i) => {
    const [lon, speed] = d.p[i];
    const pl = placeOf(lon);
    return { planet: g, ...pl, retro: speed < 0, combust: isCombust(g, lon, sun, speed), next: d.x[i] };
  });
}

function motionText(r: PlanetRow): string {
  if (isNode(r.planet)) return 'Retrograde (always, mean node)';
  if (r.planet === 'Sun' || r.planet === 'Moon') return 'Direct (never retrograde)';
  return r.retro ? 'Retrograde (R)' : 'Direct';
}
function combustText(r: PlanetRow): string {
  const orb = COMBUST_ORBS[r.planet];
  if (!orb) return '—';
  if (!r.combust) return 'No';
  return `Yes (within ${r.retro ? orb[1] : orb[0]}° of the Sun)`;
}
const nameOf = (g: Graha) => (GRAHA_HI[g] === g ? g : `${g} (${GRAHA_HI[g]})`);
const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

export const PLANETS_TODAY_STATIC = {
  title: 'Planets Today — Sidereal Positions, Retrograde & Combust | BornClock',
  description: "Where all nine grahas are today in the sidereal (Lahiri) zodiac — sign, degree, Nakshatra and pada, retrograde and combust status, and when each next changes sign. Updated every day.",
  h1: 'Planets today',
};

export function renderPlanetsToday(date: string, d: PlanetDayData): DailyEntry {
  const rows = planetRows(d);
  const dl = formatDateEn(date);
  const retro = rows.filter(r => r.retro && !isNode(r.planet)).map(r => r.planet);
  const combust = rows.filter(r => r.combust).map(r => r.planet);
  const moon = rows[1];
  const signsLine = rows.slice(0, 7).map(r => `${r.planet} in ${RASHI_EN[r.sign]}`).join(', ');
  const nextMover = rows.filter(r => r.next).sort((a, b) => a.next![0] - b.next![0])[0];
  const answer = `At 12:00 noon IST on ${formatLongDateEn(date)}: ${signsLine}; Rahu in ${RASHI_EN[rows[7].sign]} and Ketu in ${RASHI_EN[rows[8].sign]}. `
    + (retro.length ? `${list(retro)} ${retro.length > 1 ? 'are' : 'is'} retrograde` : 'No planet is retrograde (apart from Rahu and Ketu, which always are)')
    + (combust.length ? `, and ${list(combust)} ${combust.length > 1 ? 'are' : 'is'} combust (too close to the Sun to be seen). ` : retro.length ? '; none is combust. ' : ', and none is combust. ')
    + (nextMover ? `The next sign change is the ${nextMover.planet === 'Moon' ? 'Moon' : nextMover.planet} into ${RASHI_EN[nextMover.next![1]]} on ${whenText(nextMover.next!)}.` : '');
  const sections: DailySection[] = [
    {
      id: 'positions', heading: 'Where each planet is (12:00 noon IST)', layout: 'table',
      columns: ['Planet', 'Sign', 'Degree in sign', 'Nakshatra (pada)', 'Motion', 'Combust'],
      rows: rows.map(r => [nameOf(r.planet), `${RASHI_EN[r.sign]} (${SIGN_WESTERN[r.sign]})`, dms(r.deg), `${NAKSHATRA_EN[r.nakshatra]} (${r.pada})`, motionText(r), combustText(r)]),
    },
    {
      id: 'next-change', heading: 'When each planet next changes sign', layout: 'table',
      columns: ['Planet', 'Moves into', 'When'],
      rows: rows.map(r => [nameOf(r.planet), r.next ? RASHI_EN[r.next[1]] : '—', r.next ? whenText(r.next) : '—']),
    },
    {
      id: 'meaning', heading: 'What this means for you',
      text: 'Each planet’s sign today is read from your own Moon sign or Lagna (that is what a rashifal does), so the same sky is good news for some signs and a quieter time for others. '
        + 'A retrograde planet is not “bad” — its themes turn inward: a time to review, repair and finish rather than to launch. '
        + 'A combust planet is lost in the Sun’s glare; tradition reads its significations as quieter for a while, and Guru or Shukra being combust (Asta) pauses weddings and house-warmings.',
      items: [
        item('Retrograde now', retro.length ? list(retro) : 'none (Rahu and Ketu are always retrograde)'),
        item('Combust now', combust.length ? list(combust) : 'none'),
        item('Moon', `${RASHI_EN[moon.sign]}, ${NAKSHATRA_EN[moon.nakshatra]} pada ${moon.pada}`, 'the Moon sets the day’s Nakshatra and moves about 13° a day'),
      ],
    },
  ];
  return {
    date, lang: 'en',
    title: `Planets Today, ${dl} — Retrograde & Combust | BornClock`,
    description: `Planet positions on ${dl} (sidereal, Lahiri): ${signsLine}. ${retro.length ? `Retrograde: ${list(retro)}.` : 'No planet retrograde.'} ${combust.length ? `Combust: ${list(combust)}.` : ''}`.trim(),
    h1: PLANETS_TODAY_STATIC.h1,
    dateLabel: formatLongDateEn(date),
    answer,
    why: [
      { label: 'Sidereal (Lahiri) zodiac', text: 'Signs are counted from the fixed stars, as Vedic astrology and Indian Panchangs do — about 24° behind the Western (tropical) zodiac, so a planet can be one sign earlier here than in a Western horoscope.' },
      { label: `Moon in ${NAKSHATRA_EN[moon.nakshatra]}`, text: 'The fastest mover: it changes sign every two to two-and-a-half days and gives the day its Nakshatra.' },
    ],
    sections,
    faq: [
      { q: `Which planets are retrograde on ${dl}?`, a: retro.length ? `${list(retro)} ${retro.length > 1 ? 'are' : 'is'} retrograde at 12:00 noon IST on ${dl}. Rahu and Ketu move backwards all the time.` : `No planet is retrograde at 12:00 noon IST on ${dl}, apart from Rahu and Ketu, which always move backwards.` },
      { q: `Which planets are combust on ${dl}?`, a: combust.length ? `${list(combust)} ${combust.length > 1 ? 'are' : 'is'} combust — within the classical Surya Siddhanta distance of the Sun (Mars 17°, Mercury 14° or 12° when retrograde, Jupiter 11°, Venus 10° or 8° when retrograde, Saturn 15°).` : `No planet is combust on ${dl} by the classical Surya Siddhanta distances (Mars 17°, Mercury 14° or 12° when retrograde, Jupiter 11°, Venus 10° or 8° when retrograde, Saturn 15°).` },
      { q: `Where is the Moon on ${dl}?`, a: `At 12:00 noon IST the Moon is in ${RASHI_EN[moon.sign]} (${SIGN_WESTERN[moon.sign]}), ${dms(moon.deg)}, in ${NAKSHATRA_EN[moon.nakshatra]} pada ${moon.pada}${moon.next ? `; it moves into ${RASHI_EN[moon.next[1]]} on ${whenText(moon.next)}` : ''}.` },
    ],
  };
}

function item(label: string, value: string, note?: string): DailyItem {
  return note ? { label, value, note } : { label, value };
}

// ── Moon phase ───────────────────────────────────────────────────────────────
/** Compact Moon data for one India date at 12:00 noon IST. */
export interface MoonDayData {
  /** Moon − Sun elongation (°, 0 = new, 180 = full), 3 decimals. */
  e: number;
  /** Illuminated fraction 0..1, 4 decimals. */
  i: number;
  /** Age in days since the last new Moon, 2 decimals. */
  a: number;
  /** Next new / full Moon (epoch minutes, UTC). */
  nn: number; nf: number;
  /** A principal phase inside this India day: [0 new, 1 first quarter, 2 full, 3 last quarter, epoch minute]. */
  pt?: [number, number];
}

const PRINCIPAL = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'] as const;
export function moonPhaseName(d: MoonDayData): string {
  if (d.pt) return PRINCIPAL[d.pt[0]];
  return d.e < 90 ? 'Waxing Crescent' : d.e < 180 ? 'Waxing Gibbous' : d.e < 270 ? 'Waning Gibbous' : 'Waning Crescent';
}
/** Tithi at 12:00 noon IST from the elongation: "Shukla Ekadashi" etc. */
export function tithiFromElongation(e: number): { paksha: 'Shukla' | 'Krishna'; name: string; index: number } {
  const idx = Math.floor((((e % 360) + 360) % 360) / 12); // 0..29
  const within = idx % 15;
  const paksha = idx < 15 ? 'Shukla' : 'Krishna';
  const name = within === 14 ? (paksha === 'Shukla' ? 'Purnima' : 'Amavasya') : PANCHANG_TABLES.TITHI_NAMES[within];
  return { paksha, name, index: idx };
}
const atText = (min: number) => { const at = new Date(min * 60000); return `${formatShortDateEn(istDateISO(at))}, ${istClock(at)} IST`; };

export const MOON_PHASE_STATIC = {
  title: 'Moon Phase Today — Illumination, Tithi & Next Full Moon | BornClock',
  description: "Today's Moon phase: its name, how much of the disc is lit, the Moon's age, the Tithi, and the exact time of the next full Moon (Purnima) and new Moon (Amavasya) in IST — for any date.",
  h1: 'Moon phase today',
};

/** The Moon-phase entry for an India date (today's page, or any date picked in the calculator). */
export function renderMoonPhase(date: string, d: MoonDayData, opts: { today?: boolean } = {}): DailyEntry {
  const today = opts.today !== false;
  const name = moonPhaseName(d);
  const pct = Math.round(d.i * 100);
  const t = tithiFromElongation(d.e);
  const dl = formatDateEn(date);
  const waxing = d.e < 180;
  const principal = d.pt ? `The exact ${PRINCIPAL[d.pt[0]].toLowerCase()} is at ${istClock(new Date(d.pt[1] * 60000))} IST that day. ` : '';
  return {
    date, lang: 'en',
    title: `Moon Phase ${dl} — ${name}, ${pct}% Lit | BornClock`,
    description: `Moon phase on ${dl}: ${name}, ${pct}% of the disc lit, ${d.a.toFixed(1)} days old, ${t.paksha} ${t.name}. Next full Moon (Purnima) ${atText(d.nf)}; next new Moon (Amavasya) ${atText(d.nn)}.`,
    h1: today ? MOON_PHASE_STATIC.h1 : `Moon phase on ${dl}`,
    dateLabel: formatLongDateEn(date),
    answer: `On ${formatLongDateEn(date)} (12:00 noon IST) the Moon is ${/^[AEIOU]/.test(name) ? 'an' : 'a'} ${name}, ${pct}% lit and ${d.a.toFixed(1)} days old — it is ${waxing ? 'growing (waxing, Shukla Paksha)' : 'shrinking (waning, Krishna Paksha)'}. ${principal}`
      + `The next full Moon (Purnima) is on ${atText(d.nf)} and the next new Moon (Amavasya) on ${atText(d.nn)}.`,
    why: [
      { label: `${pct}% lit`, text: 'The share of the Moon’s disc lit by the Sun as seen from Earth — 0% at new Moon, 100% at full Moon. It is nearly the same everywhere on Earth at the same moment.' },
      { label: `Tithi: ${t.paksha} ${t.name}`, text: 'Every 12° the Moon gains on the Sun is one Tithi (lunar day); 30 Tithis make the lunar month, from new Moon to new Moon.' },
    ],
    sections: [
      {
        id: 'phase', heading: 'The Moon at 12:00 noon IST',
        items: [
          item('Phase', name),
          item('Illuminated', `${(d.i * 100).toFixed(1)}%`),
          item('Moon’s age', `${d.a.toFixed(1)} days`, 'days since the last new Moon (a lunar month is about 29.5 days)'),
          item('Tithi', `${t.paksha} ${t.name}`, waxing ? 'Shukla Paksha — the bright, waxing fortnight' : 'Krishna Paksha — the dark, waning fortnight'),
          item('Moon–Sun angle', `${d.e.toFixed(1)}°`, '0° = new Moon, 90° = first quarter, 180° = full Moon, 270° = last quarter'),
        ],
      },
      {
        id: 'next', heading: 'Next full and new Moon',
        text: 'The festival day of Purnima or Amavasya in the Panchang is the day whose sunrise falls in that Tithi, so it can be the day before the exact moment shown here.',
        items: [
          item('Next full Moon (Purnima)', atText(d.nf)),
          item('Next new Moon (Amavasya)', atText(d.nn)),
        ],
      },
    ],
    faq: [
      { q: `What is the Moon phase on ${dl}?`, a: `At 12:00 noon IST on ${dl} the Moon is ${/^[AEIOU]/.test(name) ? 'an' : 'a'} ${name}, ${pct}% lit, ${d.a.toFixed(1)} days after the new Moon; the Tithi is ${t.paksha} ${t.name}.` },
      { q: `When is the next full Moon (Purnima) after ${dl}?`, a: `The next exact full Moon is on ${atText(d.nf)}. The Purnima day in the Panchang is the day whose sunrise falls in the Purnima Tithi — the same day or the day before.` },
      { q: `When is the next new Moon (Amavasya) after ${dl}?`, a: `The next exact new Moon is on ${atText(d.nn)}. The Amavasya day in the Panchang is the day whose sunrise falls in the Amavasya Tithi — the same day or the day before.` },
    ],
    labels: today ? undefined : { answer: 'In brief', why: 'Why', faq: 'Questions about this date' },
  };
}
