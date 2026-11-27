/**
 * B20 — Kerala ten-porutham (Dashakoota, Kerala system) with half scores.
 *
 * The Malayalam matching page uses this; the Tamil page keeps `porutham.ts`.
 * Scores are 1 (full), 0.5 (partial) or 0, total out of 10.
 *
 * Reference: ProKerala's Kerala porutham calculator (prokerala.com/astrology/jathaka-porutham.php,
 * "Dashakoot (Kerala)"), mapped on 27 Nov 2026 by submitting 223 birth pairs through its own form
 * (girl/boy both born in Ujjain) — every nakshatra as girl and as boy, the full 12 × 12 Moon-sign
 * grid, every classical Vedha pair, and same-star pairs in both signs of split nakshatras.
 * The raw answers are in __tests__/golden/prokeralaKeralaSweep.json and
 * __tests__/golden/prokeralaKerala.json (12 real couples); the rules below reproduce all of them.
 * Where a rule differs from our Tamil engine it is noted.
 */
import { NAK_ORDER, GANA } from './nakshatraAttributes';
import { SIGN_LORDS } from './engine/sthanaBala';
import { isVedhaPair } from './porutham';

export type Score = 0 | 0.5 | 1;
export interface KeralaPerson { nakshatra: string; rashiIndex: number }
export interface KeralaPorutham { key: string; label: string; score: Score; reason: string }
export interface KeralaResult { poruthams: KeralaPorutham[]; total: number; outOf: 10; method: string }

/** Kerala three-rajju grouping. Same Kati (middle) rajju = 0; same Pada or Nabhi = 0.5; different = 1. */
const RAJJU3: Record<string, 'Pada' | 'Kati' | 'Nabhi'> = {};
([
  ['Pada', ['Ashwini', 'Ardra', 'Punarvasu', 'Uttara Phalguni', 'Hasta', 'Jyeshtha', 'Mula', 'Shatabhisha', 'Purva Bhadrapada']],
  ['Kati', ['Bharani', 'Mrigashira', 'Pushya', 'Purva Phalguni', 'Chitra', 'Anuradha', 'Purva Ashadha', 'Dhanishtha', 'Uttara Bhadrapada']],
  ['Nabhi', ['Krittika', 'Rohini', 'Ashlesha', 'Magha', 'Swati', 'Vishakha', 'Uttara Ashadha', 'Shravana', 'Revati']],
] as const).forEach(([g, stars]) => stars.forEach(s => { RAJJU3[s] = g; }));

/** Star gender used for Kerala Yoni (girl female + boy male = 1; both female = 0.5; otherwise 0). */
const FEMALE_STARS = new Set(['Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Purva Phalguni', 'Hasta', 'Chitra', 'Anuradha', 'Dhanishtha', 'Shatabhisha', 'Uttara Bhadrapada', 'Revati']);

/** Gana score by [girl][boy] (Deva / Manushya / Rakshasa). */
const GANA_SCORE: Record<string, Record<string, Score>> = {
  Deva: { Deva: 1, Manushya: 0, Rakshasa: 0 },
  Manushya: { Deva: 1, Manushya: 1, Rakshasa: 0.5 },
  Rakshasa: { Deva: 0, Manushya: 0, Rakshasa: 1 },
};

/** Moon-sign lords that agree (symmetric table as used by the Kerala calculator). */
const LORD_OK: Record<string, string[]> = {
  Mars: ['Mars', 'Venus', 'Mercury'],
  Venus: ['Mars', 'Venus', 'Mercury', 'Jupiter', 'Saturn'],
  Mercury: ['Mars', 'Venus', 'Mercury', 'Moon', 'Jupiter', 'Saturn'],
  Moon: ['Mercury', 'Moon', 'Jupiter'],
  Sun: ['Sun', 'Jupiter'],
  Jupiter: ['Venus', 'Mercury', 'Moon', 'Sun', 'Jupiter', 'Saturn'],
  Saturn: ['Venus', 'Mercury', 'Jupiter', 'Saturn'],
};

/** Vasya: girl's Moon sign → boy's Moon signs that agree (0 = Mesha). */
const VASYA_K: number[][] = [
  [4, 7, 9, 10], [3, 6], [5], [1, 7, 8], [0, 6], [2, 6, 11],
  [1, 4, 5, 9], [0, 3], [3, 11], [0, 6, 10, 11], [0, 9], [5, 8, 9],
];

const DINA_BAD_IN_NINE = new Set([3, 5, 7]);
const MAHENDRA = new Set([4, 7, 10, 13, 16, 19, 22, 25]);
const RASI_NAMES = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];

export function calculatePoruthamKerala(girl: KeralaPerson, boy: KeralaPerson): KeralaResult {
  const ig = NAK_ORDER.indexOf(girl.nakshatra), ib = NAK_ORDER.indexOf(boy.nakshatra);
  if (ig < 0 || ib < 0) throw new Error(`Unknown nakshatra: ${ig < 0 ? girl.nakshatra : boy.nakshatra}`);
  const count = ((ib - ig + 27) % 27) + 1;          // girl's star → boy's star, inclusive
  const inNine = ((count - 1) % 9) + 1;
  const signCount = ((boy.rashiIndex - girl.rashiIndex + 12) % 12) + 1;
  const out: KeralaPorutham[] = [];
  const push = (key: string, label: string, score: Score, reason: string) => out.push({ key, label, score, reason });

  // Dina: the boy's star counted from the girl's; the 3rd, 5th and 7th of each group of nine do not agree.
  push('dina', 'Dina', DINA_BAD_IN_NINE.has(inNine) && count !== 1 ? 0 : 1,
    count === 1 ? 'Same birth star — agrees in the Kerala count.' : `Count ${count} (position ${inNine} in its group of nine) — ${DINA_BAD_IN_NINE.has(inNine) ? 'one of the 3rd, 5th, 7th positions, which do not agree' : 'agrees'}.`);

  const gg = GANA[girl.nakshatra], gb = GANA[boy.nakshatra];
  push('gana', 'Gana', GANA_SCORE[gg][gb], `Girl ${gg}, boy ${gb}.`);

  push('mahendra', 'Mahendra', MAHENDRA.has(count) ? 1 : 0, `Count ${count}${MAHENDRA.has(count) ? ' is a Mahendra count' : ' is not one of 4, 7, 10, 13, 16, 19, 22, 25'}.`);

  const stree: Score = count >= 19 ? 1 : count >= 10 ? 0.5 : 0;
  push('stree-deergha', 'Stree Deergha', stree, `Count ${count}: ${stree === 1 ? '19 or more — full' : stree ? '10 to 18 — partial' : '9 or less — does not agree'}.`);

  const fg = FEMALE_STARS.has(girl.nakshatra), fb = FEMALE_STARS.has(boy.nakshatra);
  const yoni: Score = fg && !fb ? 1 : fg && fb ? 0.5 : 0;
  push('yoni', 'Yoni', yoni, `Girl's star ${fg ? 'female' : 'male'}, boy's star ${fb ? 'female' : 'male'}.`);

  const vedha = isVedhaPair(girl.nakshatra, boy.nakshatra);
  push('vedha', 'Vedha', vedha ? 0 : 1, vedha ? `${girl.nakshatra} and ${boy.nakshatra} are a Vedha pair.` : 'Not a Vedha pair.');

  const rg = RAJJU3[girl.nakshatra], rb = RAJJU3[boy.nakshatra];
  const rajju: Score = rg !== rb ? 1 : rg === 'Kati' ? 0 : 0.5;
  push('rajju', 'Rajju', rajju, rg !== rb ? `Different rajju (${rg} / ${rb}).` : `Both in ${rg} rajju${rg === 'Kati' ? ' (the middle rajju) — does not agree' : ' — partial'}.`);

  const rasi: Score = signCount >= 2 && signCount <= 6 ? 0 : signCount === 8 ? 0.5 : 1;
  push('rasi', 'Rasi', rasi, `Boy's Moon sign is ${signCount === 1 ? 'the same as' : `number ${signCount} from`} the girl's.`);

  const lg = SIGN_LORDS[girl.rashiIndex], lb = SIGN_LORDS[boy.rashiIndex];
  const lordOk = LORD_OK[lg]?.includes(lb) ?? false;
  push('rasyadhipathi', 'Rasiyathipathi', lordOk ? 1 : 0, `Lords ${lg} and ${lb}${lordOk ? ' agree' : ' do not agree'}.`);

  const vasyaOk = VASYA_K[girl.rashiIndex]?.includes(boy.rashiIndex) ?? false;
  push('vasya', 'Vasya', vasyaOk ? 1 : 0, `${RASI_NAMES[girl.rashiIndex]} (girl) and ${RASI_NAMES[boy.rashiIndex]} (boy)${vasyaOk ? ' are vasya' : ' are not vasya'}.`);

  const total = out.reduce((s, p) => s + p.score, 0);
  return {
    poruthams: out, total, outOf: 10,
    method: 'Kerala ten-porutham (Dashakoota) with half scores, from each person’s Moon nakshatra and Moon sign (Lahiri). Tables checked against ProKerala’s Kerala calculator.',
  };
}
