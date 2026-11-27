/**
 * B21 — Prashna (horary) by the KP (Krishnamurti Paddhati) method.
 *
 * 1. The KP number: the person picks a number 1–249 while thinking of the question. Number N fixes the
 *    Ascendant at the START of the Nth of the 249 KP subs (kpSubTable — sign/star/sub cut-points;
 *    1 = 0°00′00″ Aries, 2 = 0°46′40″, 3 = 3°00′00″ … 249 = 27°53′20″ Pisces). Without a number, the
 *    Ascendant of the moment of the question is used.
 * 2. Houses: Placidus cusps for the place, at the time (within ±12 h of the question) when that
 *    Ascendant rises — the usual KP horary practice; planets are taken at the moment of the question.
 *    Everything is in the KP ayanamsa, as in our KP tables (advanced/kp.ts).
 * 3. Judgement (KP Reader VI): the sub-lord of the question's main cusp decides. A planet signifies
 *    the houses its STAR LORD occupies and owns (strongest) and the houses it occupies and owns itself.
 *    If the cusp sub-lord signifies the favourable houses and none of the denying ones → leans yes; both
 *    → possible, with delay or effort; only denying / none → not indicated for now.
 * 4. Ruling planets of the moment (day lord, Moon's sign and star lords, Lagna's sign and star lords)
 *    are listed as the traditional confirmation; we do not turn them into dates.
 *
 * House groups per question (KP, standard references):
 *   marriage 7th cusp — yes 2, 7, 11 · no 1, 6, 10
 *   job / career 10th — yes 2, 6, 10, 11 · no 1, 5, 9
 *   money / business gain 11th — yes 2, 6, 11 · no 5, 8, 12
 *   travel or settling abroad 12th — yes 3, 9, 12 · no 2, 4, 11
 *   education / exam 4th — yes 4, 9, 11 · no 3, 8, 12
 */
import { calculatePlacidusCusps, getSiderealLongitude, normalize360 } from './engine/vedicEngine';
import { KP_SHIFT_DEG, kpLords, kpSubTable } from './advanced/kp';
import { PLANETS_9, SIGN_LORD, inArc, type PlanetName } from './advanced/angles';

export type PrashnaTopic = 'marriage' | 'career' | 'money' | 'abroad' | 'education';
export const PRASHNA_TOPICS: Record<PrashnaTopic, { label: string; cusp: number; yes: number[]; no: number[]; plain: string }> = {
  marriage: { label: 'Marriage — will it happen / will this proposal work?', cusp: 7, yes: [2, 7, 11], no: [1, 6, 10], plain: 'marriage' },
  career: { label: 'Job or career — will I get it / change?', cusp: 10, yes: [2, 6, 10, 11], no: [1, 5, 9], plain: 'the job or career move' },
  money: { label: 'Money or business — will I gain?', cusp: 11, yes: [2, 6, 11], no: [5, 8, 12], plain: 'the gain you asked about' },
  abroad: { label: 'Travel or settling abroad', cusp: 12, yes: [3, 9, 12], no: [2, 4, 11], plain: 'going abroad' },
  education: { label: 'Education or an exam — will it go well?', cusp: 4, yes: [4, 9, 11], no: [3, 8, 12], plain: 'the studies or exam' },
};

const SUBS = kpSubTable();
export const KP_NUMBERS = SUBS.length; // 249

/** KP longitude (0–360) of the Ascendant fixed by horary number n (1–249). */
export function kpNumberLongitude(n: number): number {
  if (!Number.isInteger(n) || n < 1 || n > SUBS.length) throw new RangeError('KP number must be 1–249');
  return SUBS[n - 1].start;
}

const kpCusps = (t: Date, lat: number, lon: number) => {
  const p = calculatePlacidusCusps(t, lat, lon);
  return Array.from({ length: 12 }, (_, i) => normalize360(p[i + 1] + KP_SHIFT_DEG));
};

/** The moment within ±12 h of `around` when the KP Ascendant equals `target` (to well under 1″). */
export function timeForAscendant(target: number, around: Date, lat: number, lon: number): Date {
  const asc = (ms: number) => kpCusps(new Date(ms), lat, lon)[0];
  const ahead = (ms: number) => normalize360(asc(ms) - target + 180) - 180; // signed, −180..180
  const start = around.getTime() - 12 * 3_600_000, step = 10 * 60_000;
  let best: number | null = null;
  for (let t = start; t < start + 24 * 3_600_000; t += step) {
    const a = ahead(t), b = ahead(t + step);
    if (a <= 0 && b > 0 && b - a < 90) {
      let lo = t, hi = t + step;
      for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (ahead(mid) <= 0) lo = mid; else hi = mid; }
      const found = (lo + hi) / 2;
      if (best === null || Math.abs(found - around.getTime()) < Math.abs(best - around.getTime())) best = found;
    }
  }
  if (best === null) throw new Error('That Ascendant does not rise at this latitude today');
  return new Date(best);
}

export interface PrashnaPlanet { name: PlanetName; longitude: number; house: number; sign: string; star: string; sub: string; signifies: number[] }
export interface PrashnaResult {
  method: 'number' | 'moment';
  number: number | null;
  ascendant: number;
  cusps: Array<{ house: number; longitude: number; sign: string; star: string; sub: string }>;
  planets: PrashnaPlanet[];
  topic: PrashnaTopic;
  cuspSubLord: PlanetName;
  signified: number[];
  yesHit: number[]; noHit: number[];
  verdict: 'yes' | 'mixed' | 'not-now';
  rulingPlanets: { dayLord: string; moonSignLord: string; moonStarLord: string; lagnaSignLord: string; lagnaStarLord: string };
}

const DAY_LORD = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/**
 * @param moment   the moment the question is asked (UTC)
 * @param tzHours  the place's UTC offset at that moment (for the weekday / day lord)
 */
export function judgePrashna(opts: { topic: PrashnaTopic; number?: number | null; moment: Date; lat: number; lon: number; tzHours: number }): PrashnaResult {
  const { topic, moment, lat, lon, tzHours } = opts;
  const n = opts.number ?? null;
  const houseTime = n ? timeForAscendant(kpNumberLongitude(n), moment, lat, lon) : moment;
  const cuspLon = kpCusps(houseTime, lat, lon);
  if (n) cuspLon[0] = kpNumberLongitude(n); // exact, not the bisection's 1e-6° neighbour
  const houseOf = (L: number) => { for (let i = 0; i < 12; i++) if (inArc(L, cuspLon[i], cuspLon[(i + 1) % 12])) return i + 1; return 1; };
  const raw = PLANETS_9.map(name => {
    const L = normalize360(getSiderealLongitude(name, moment, 'natal') + KP_SHIFT_DEG);
    return { name, longitude: L, house: houseOf(L), ...kpLords(L) };
  });
  const owned = (p: string) => cuspLon.map((c, i) => (SIGN_LORD[Math.floor(c / 30)] === p ? i + 1 : 0)).filter(Boolean);
  const occ = Object.fromEntries(raw.map(p => [p.name, p.house])) as Record<string, number>;
  const signifies = (p: string) => {
    const star = raw.find(x => x.name === p)!.star;
    const s = new Set<number>([occ[star], ...owned(star), occ[p], ...owned(p)].filter(Boolean) as number[]);
    return [...s].sort((a, b) => a - b);
  };
  const planets: PrashnaPlanet[] = raw.map(p => ({ ...p, signifies: signifies(p.name) }));
  const cusps = cuspLon.map((c, i) => ({ house: i + 1, longitude: c, ...kpLords(c) }));
  const T = PRASHNA_TOPICS[topic];
  const csl = cusps[T.cusp - 1].sub as PlanetName;
  const signified = signifies(csl);
  const yesHit = T.yes.filter(h => signified.includes(h));
  const noHit = T.no.filter(h => signified.includes(h));
  const verdict = yesHit.length && !noHit.length ? 'yes' : yesHit.length ? 'mixed' : 'not-now';
  const moonL = raw.find(p => p.name === 'Moon')!.longitude;
  const local = new Date(moment.getTime() + tzHours * 3_600_000);
  return {
    method: n ? 'number' : 'moment', number: n, ascendant: cuspLon[0], cusps, planets, topic,
    cuspSubLord: csl, signified, yesHit, noHit, verdict,
    rulingPlanets: {
      dayLord: DAY_LORD[local.getUTCDay()],
      moonSignLord: SIGN_LORD[Math.floor(moonL / 30)], moonStarLord: kpLords(moonL).star,
      lagnaSignLord: SIGN_LORD[Math.floor(cuspLon[0] / 30)], lagnaStarLord: kpLords(cuspLon[0]).star,
    },
  };
}

/** One plain sentence — never a certainty. */
export function prashnaAnswer(r: PrashnaResult): string {
  const T = PRASHNA_TOPICS[r.topic];
  if (r.verdict === 'yes') return `The chart leans towards YES for ${T.plain}: the deciding planet (${r.cuspSubLord}) connects to the supportive houses ${r.yesHit.join(', ')} and to none of the blocking ones.`;
  if (r.verdict === 'mixed') return `Possible, but with delay or extra effort: the deciding planet (${r.cuspSubLord}) connects to the supportive houses ${r.yesHit.join(', ')} and also to the blocking houses ${r.noHit.join(', ')}.`;
  return `Not indicated for now: the deciding planet (${r.cuspSubLord}) does not connect to the supportive houses (${T.yes.join(', ')}) for ${T.plain}. Tradition says to wait and ask again only when circumstances change.`;
}
