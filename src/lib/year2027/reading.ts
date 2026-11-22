/**
 * B14 — the 2027 yearly forecast for one sign, computed from the real 2027 sky.
 *
 * Vedic (sidereal) pages read every planet by the classical gochar method — the house it
 * transits counted from the Moon sign, toned by the classical good / hard house table
 * (gocharTone, the same table as the daily, weekly, monthly and yearly rashifal). Western
 * (tropical) pages read the same way from the Sun sign ("solar houses"), with the Western
 * benefic / malefic house rules in ./western.ts.
 *
 * What is computed per sign (so every page is different):
 *   • a day-by-day score for the year: Σ planet weight × tone (+1 supportive, 0 mixed,
 *     −1 needs care) of each planet's house that day;
 *   • the month-by-month notes (each month's score, the planets that change sign in it,
 *     retrograde stations and eclipses, and the house each one touches);
 *   • best and challenging windows — runs of at least 10 days where the 7-day average
 *     score is in the top / bottom quarter of the year — with the planets behind them;
 *   • love, career, money and health — the planets moving through the houses of each area;
 *   • Saturn's Sade Sati / Dhaiya stretches in 2027 (Vedic) and each eclipse's house;
 *   • lucky months (the three highest-scoring), colours and numbers.
 */
import { gocharTone, RASHIS, type Tone, type PlanetName } from '../vedic/rashifal';
import { periodsFor } from '../vedic/sadeSatiRashi';
import { computeYearSky, dayGrid, houseFrom, signOn, istISO, type YearSky, type YPlanet, type Zodiac } from './sky';
import { westernTone, WESTERN_SIGNS } from './western';
import {
  AREA, LENS, TIP, DOMAIN_IMPACT, DOMAIN_TODO, DOMAIN_TITLE, ORD_EN, ORD_HI, MONTHS_EN, MONTHS_HI,
  PLANET_COLOUR, PLANET_NUMBER, PLANET_WEEKDAY, WEEKDAYS_EN, WEEKDAYS_HI, MONTH_VERDICT, TONE_WORD,
  longDate, range, span, shortDate, pName, PLACEMENT, type Domain, type Lang,
} from './text';
import { WESTERN_AREA, WESTERN_LENS, WESTERN_TIP, WESTERN_IMPACT, WESTERN_TODO } from './westernText';

export const YEAR = 2027;

const WEIGHT: Record<YPlanet, number> = { Jupiter: 3, Saturn: 3, Rahu: 1.5, Ketu: 1, Mars: 1.5, Venus: 1.5, Sun: 1, Mercury: 1 };
const SLOW: YPlanet[] = ['Jupiter', 'Saturn', 'Rahu', 'Ketu'];
const val = (t: Tone) => (t === 'favourable' ? 1 : t === 'challenging' ? -1 : 0);

export type System = 'vedic' | 'western';

/** B18: `bits` = the planets (and houses) behind the window, for the regional-language pages. */
export interface Window { from: string; to: string; why: string; bits?: Array<{ p: YPlanet; h: number }> }
export type MonthEvent = { iso: string; kind: 'ingress' | 'retro' | 'direct' | 'eclipse'; p?: YPlanet; h: number; t?: Tone; to?: string; solar?: boolean };
export interface MonthNote { month: number; name: string; tone: Tone; verdict: string; text: string; score: number; verdictKey?: 'best' | 'good' | 'mixed' | 'care' | 'hard'; events?: MonthEvent[]; lead?: { p: YPlanet; h: number; t: Tone } }
export interface AreaReading { key: Domain; title: string; tone: Tone; impact: string; reasons: string[]; todo: string; factors?: Array<{ p: YPlanet; h: number; spans: Array<[string, string]> }> }
export interface TransitRow { signIdx?: number; planet: YPlanet; planetLabel: string; sign: string; house: number; from: string; to: string; when: string; tone: Tone; toneLabel: string }
export interface EclipseRow { name: string; date: string; time: string; house: number; area: string; india: boolean; text: string; body?: 'solar' | 'lunar'; type?: string }
export interface SaturnRow { from: string; to: string; when: string; label: string; house: number }

export interface YearReading {
  system: System;
  lang: Lang;
  signIndex: number;
  /** e.g. "Mesh" / "मेष" / "Aries" */
  name: string;
  tone: Tone;
  headline: string;
  brief: string[];
  transits: TransitRow[];
  areas: AreaReading[];
  months: MonthNote[];
  best: Window[];
  challenging: Window[];
  loveWindows: Window[];
  saturn: { status: 'sadeSati' | 'dhaiya' | 'none'; rows: SaturnRow[]; text: string; short: string; ssSpan?: { start: string; end: string } };
  eclipses: EclipseRow[];
  lucky: { months: string[]; colours: string[]; numbers: number[]; day: string; text: string; monthIdx?: number[]; helper?: YPlanet; weekday?: number };
  /** Planets whose remedies the page shows (most demanding influence first). */
  remedyPlanets: YPlanet[];
  remedyKeys: string[];
  faq: Array<{ question: string; answer: string }>;
}

/** "a, b and c" / "क, ख और ग". */
function joinList(xs: string[], lang: Lang): string {
  if (xs.length <= 1) return xs.join('');
  return `${xs.slice(0, -1).join(', ')} ${lang === 'en' ? 'and' : 'और'} ${xs[xs.length - 1]}`;
}

function toneOf(system: System, p: YPlanet, house: number): Tone {
  return system === 'vedic' ? gocharTone(p as PlanetName, house) : westernTone(p, house);
}

const signLabel = (system: System, sign: number, lang: Lang): string => {
  if (system === 'western') return WESTERN_SIGNS[sign];
  const r = RASHIS[sign];
  return lang === 'en' ? `${r.sanskrit} (${r.english})` : r.hindi;
};
const area = (system: System, h: number, lang: Lang) => (system === 'vedic' ? AREA[lang][h] : WESTERN_AREA[h]);
const lens = (system: System, p: YPlanet, t: Tone, lang: Lang) => (system === 'vedic' ? LENS[lang][p][t] : WESTERN_LENS[p][t]);
const tip = (system: System, h: number, t: Tone, lang: Lang) => (system === 'vedic' ? TIP[lang][h][t] : WESTERN_TIP[h][t]);
const ord = (h: number, lang: Lang) => (lang === 'en' ? ORD_EN[h] : ORD_HI[h]);

/** Day-by-day score of the year for a reference sign. */
function dailyScores(sky: YearSky, ref: number, system: System): { days: number[]; scores: number[]; parts: Array<Record<string, Tone>> } {
  const days = dayGrid(sky.year);
  const scores: number[] = [];
  const parts: Array<Record<string, Tone>> = [];
  for (const d of days) {
    let s = 0;
    const p: Record<string, Tone> = {};
    for (const pl of sky.planets) {
      const t = toneOf(system, pl, houseFrom(ref, signOn(sky, pl, d)));
      p[pl] = t;
      s += WEIGHT[pl] * val(t);
    }
    scores.push(s);
    parts.push(p);
  }
  return { days, scores, parts };
}

function quantile(xs: number[], q: number): number {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.floor(q * (s.length - 1))))];
}

function smooth(xs: number[], k = 7): number[] {
  const h = Math.floor(k / 2);
  return xs.map((_, i) => {
    let s = 0, n = 0;
    for (let j = Math.max(0, i - h); j <= Math.min(xs.length - 1, i + h); j++) { s += xs[j]; n++; }
    return s / n;
  });
}

/** Runs of consecutive day indexes where pred holds (gaps ≤ 3 days merged), at least minLen long. */
function runs(n: number, pred: (i: number) => boolean, minLen: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let a = -1;
  for (let i = 0; i <= n; i++) {
    const ok = i < n && pred(i);
    if (ok && a < 0) a = i;
    if (!ok && a >= 0) { out.push([a, i - 1]); a = -1; }
  }
  const merged: Array<[number, number]> = [];
  for (const r of out) {
    const last = merged[merged.length - 1];
    if (last && r[0] - last[1] <= 4) last[1] = r[1]; else merged.push([r[0], r[1]]);
  }
  return merged.filter(r => r[1] - r[0] + 1 >= minLen);
}

function windowBits(ref: number, sky: YearSky, parts: Array<Record<string, Tone>>, days: number[], a: number, b: number, want: Tone): Array<{ p: YPlanet; h: number }> {
  const n = b - a + 1;
  const mid = days[Math.floor((a + b) / 2)];
  return sky.planets
    .map(p => { let c = 0; for (let i = a; i <= b; i++) if (parts[i][p] === want) c++; return { p, share: c / n }; })
    .filter(x => x.share >= 0.6)
    .sort((x, y) => WEIGHT[y.p] - WEIGHT[x.p])
    .slice(0, 3)
    .map(({ p }) => ({ p, h: houseFrom(ref, signOn(sky, p, mid)) }));
}

function windowWhy(system: System, lang: Lang, ref: number, sky: YearSky, parts: Array<Record<string, Tone>>, days: number[], a: number, b: number, want: Tone): string {
  const n = b - a + 1;
  const hits = sky.planets
    .map(p => {
      let c = 0;
      for (let i = a; i <= b; i++) if (parts[i][p] === want) c++;
      return { p, share: c / n };
    })
    .filter(x => x.share >= 0.6)
    .sort((x, y) => WEIGHT[y.p] - WEIGHT[x.p])
    .slice(0, 3);
  const mid = days[Math.floor((a + b) / 2)];
  const bits = hits.map(({ p }) => {
    const h = houseFrom(ref, signOn(sky, p, mid));
    return lang === 'en' ? `${p} in your ${ORD_EN[h]} house (${area(system, h, lang)})` : `${pName(p, lang)} ${ORD_HI[h]} भाव (${area(system, h, lang)}) में`;
  });
  if (!bits.length) return lang === 'en' ? 'several planets lean the same way at once' : 'कई ग्रह एक साथ एक ही दिशा में असर डालते हैं';
  return lang === 'en' ? bits.join(', ') : bits.join(', ');
}

function pickWindows(scores: number[], days: number[], top: boolean): Array<[number, number]> {
  const sm = smooth(scores);
  const mean = scores.reduce((s, x) => s + x, 0) / scores.length;
  const thr = quantile(sm, top ? 0.75 : 0.25);
  const pred = (i: number) => (top ? sm[i] >= thr && sm[i] > mean : sm[i] <= thr && sm[i] < mean);
  let rs = runs(days.length, pred, 10);
  if (rs.length < 2) rs = runs(days.length, pred, 5);
  const strength = (r: [number, number]) => {
    let s = 0;
    for (let i = r[0]; i <= r[1]; i++) s += top ? sm[i] - mean : mean - sm[i];
    return s;
  };
  return rs.sort((x, y) => strength(y) - strength(x)).slice(0, 3).sort((x, y) => x[0] - y[0]);
}

/** Main yearly reading. `ref` = Moon sign (Vedic) or Sun sign (Western), 0..11. */
export function computeYearReading(ref: number, system: System, lang: Lang): YearReading {
  const zodiac: Zodiac = system === 'vedic' ? 'sidereal' : 'tropical';
  const sky = computeYearSky(YEAR, zodiac);
  const { days, scores, parts } = dailyScores(sky, ref, system);
  const mean = scores.reduce((s, x) => s + x, 0) / scores.length;
  const en = lang === 'en';
  const rashi = RASHIS[ref];
  const name = system === 'western' ? WESTERN_SIGNS[ref] : en ? rashi.slug.charAt(0).toUpperCase() + rashi.slug.slice(1) : rashi.hindi;
  const fullName = system === 'western' ? WESTERN_SIGNS[ref] : en ? (name === rashi.sanskrit ? `${name} (${rashi.english})` : `${name} (${rashi.sanskrit}, ${rashi.english})`) : `${rashi.hindi} राशि`;

  // ── Transits table (slow planets + Mars) ──────────────────────────────────
  const transits: TransitRow[] = [];
  for (const p of sky.planets.filter(p => SLOW.includes(p))) {
    for (const s of sky.segs[p]) {
      const h = houseFrom(ref, s.sign);
      const t = toneOf(system, p, h);
      transits.push({ signIdx: s.sign, planet: p, planetLabel: pName(p, lang, false), sign: signLabel(system, s.sign, lang), house: h, from: s.from, to: s.to, when: range(s.from, s.to, lang), tone: t, toneLabel: TONE_WORD[lang][t] });
    }
  }

  // ── Overall tone: slow planets weighted by time (Sade Sati never "supportive") ──
  let ov = 0, ow = 0;
  for (const p of SLOW.filter(p => sky.planets.includes(p))) {
    for (const s of sky.segs[p]) {
      const w = WEIGHT[p] * (s.endMs - s.startMs);
      ov += w * val(toneOf(system, p, houseFrom(ref, s.sign)));
      ow += w;
    }
  }
  const norm = ov / ow;
  const saturnHouses = sky.segs.Saturn.map(s => houseFrom(ref, s.sign));
  const inSadeSati = system === 'vedic' && saturnHouses.some(h => h === 12 || h === 1 || h === 2);
  const inDhaiya = system === 'vedic' && saturnHouses.some(h => h === 4 || h === 8);
  let tone: Tone = norm > 0.2 ? 'favourable' : norm < -0.2 ? 'challenging' : 'mixed';
  if (inSadeSati && tone === 'favourable') tone = 'mixed';

  // ── Months ────────────────────────────────────────────────────────────────
  const monthScores = Array.from({ length: 12 }, (_, m) => {
    const idx = days.map((d, i) => [d, i] as const).filter(([d]) => Number(istISO(d).slice(5, 7)) === m + 1).map(([, i]) => i);
    return idx.reduce((s, i) => s + scores[i], 0) / idx.length;
  });
  const order = monthScores.map((s, m) => [s, m] as const).sort((a, b) => b[0] - a[0]).map(([, m]) => m);
  const top3 = order.slice(0, 3);
  const bottom3 = order.slice(-3);
  const months: MonthNote[] = monthScores.map((s, m) => buildMonth(system, lang, ref, sky, m, s, mean, top3.includes(m), bottom3.includes(m)));

  // ── Windows ───────────────────────────────────────────────────────────────
  const toWin = (rs: Array<[number, number]>, want: Tone): Window[] => rs.map(([a, b]) => ({
    from: istISO(days[a]), to: istISO(days[b]), why: windowWhy(system, lang, ref, sky, parts, days, a, b, want),
    bits: windowBits(ref, sky, parts, days, a, b, want),
  }));
  const best = toWin(pickWindows(scores, days, true), 'favourable');
  const challenging = toWin(pickWindows(scores, days, false), 'challenging');

  // Relationship windows: Venus or Jupiter supportive in a love-related house.
  const loveHouses = system === 'vedic' ? [1, 2, 4, 5, 7, 11] : [1, 5, 7, 11];
  const lovePred = (i: number) => {
    const d = days[i];
    const v = houseFrom(ref, signOn(sky, 'Venus', d));
    const j = houseFrom(ref, signOn(sky, 'Jupiter', d));
    return (parts[i].Venus === 'favourable' && loveHouses.includes(v)) || (parts[i].Jupiter === 'favourable' && [5, 7, 11, 2].includes(j));
  };
  const loveWindows = runs(days.length, lovePred, 10).slice(0, 4).map(([a, b]) => ({
    from: istISO(days[a]), to: istISO(days[b]),
    why: windowWhy(system, lang, ref, sky, parts, days, a, b, 'favourable'),
    bits: windowBits(ref, sky, parts, days, a, b, 'favourable'),
  }));

  // ── Life areas ────────────────────────────────────────────────────────────
  const areas: AreaReading[] = (['love', 'career', 'money', 'health'] as const).map(k => buildArea(system, lang, ref, sky, k));

  // ── Saturn (Sade Sati / Dhaiya, or Western Saturn) ──────────────────────
  const saturn = buildSaturn(system, lang, ref, sky, fullName);

  // ── Eclipses ──────────────────────────────────────────────────────────────
  const eclipses: EclipseRow[] = sky.eclipses.map(e => {
    const h = houseFrom(ref, e.sign);
    const angular = [1, 4, 7, 10].includes(h);
    const nm = en ? e.name : e.body === 'solar' ? `${e.type === 'Total' ? 'पूर्ण' : e.type === 'Annular' ? 'वलयाकार' : 'आंशिक'} सूर्य ग्रहण` : `${e.type === 'Penumbral' ? 'उपच्छाया' : e.type === 'Total' ? 'पूर्ण' : 'आंशिक'} चंद्र ग्रहण`;
    const text = system === 'western'
      ? `Falls in your ${ORD_EN[h]} solar house — ${WESTERN_AREA[h]}. ${angular ? 'It lands on an angle of your chart, so expect this area to need a reset or a fresh decision around the date.' : 'Use the weeks around it to review this area rather than to force it.'}`
      : en
        ? `Falls in your ${ORD_EN[h]} house from the Moon — ${AREA.en[h]}. ${angular ? 'An angular house: expect a reset here.' : 'A point of review, not a time to push.'} ${e.india ? 'Listed as visible from India.' : 'Not visible from India.'}`
        : `आपकी राशि से ${ORD_HI[h]} भाव — ${AREA.hi[h]} — में। ${angular ? 'केंद्र भाव: यहाँ नए सिरे से सोचने का समय।' : 'समीक्षा का समय, ज़ोर लगाने का नहीं।'} ${e.india ? 'भारत से दिखाई देने वाला बताया गया है।' : 'भारत से दिखाई नहीं देगा।'}`;
    return { name: nm, date: e.istDate, time: e.istTime, house: h, area: area(system, h, lang), india: e.india, text, body: e.body, type: e.type };
  });

  // ── Lucky ─────────────────────────────────────────────────────────────────
  const luckyMonths = top3.slice().sort((a, b) => a - b).map(m => (en ? MONTHS_EN[m] : MONTHS_HI[m]));
  const bestSlow = SLOW.filter(p => sky.planets.includes(p))
    .map(p => ({ p, v: sky.segs[p].reduce((s, x) => s + (x.endMs - x.startMs) * val(toneOf(system, p, houseFrom(ref, x.sign))), 0) * WEIGHT[p] }))
    .sort((a, b) => b.v - a.v)[0];
  const helper: YPlanet = bestSlow && bestSlow.v > 0 ? bestSlow.p : 'Jupiter';
  const lordWeekday = system === 'vedic' ? PLANET_WEEKDAY[rashi.lord] : PLANET_WEEKDAY[WESTERN_RULER[ref]];
  const colours = system === 'vedic'
    ? Array.from(new Set([en ? rashi.luckyColor.toLowerCase() : rashi.luckyColorHindi, PLANET_COLOUR[lang][helper]]))
    : [];
  const numbers = system === 'vedic' ? Array.from(new Set([...rashi.luckyNumbers, PLANET_NUMBER[helper]])).sort((a, b) => a - b) : [];
  const day = en ? WEEKDAYS_EN[lordWeekday] : WEEKDAYS_HI[lordWeekday];
  const luckyText = system === 'western'
    ? `Your three highest-scoring months of 2027 are ${luckyMonths.join(', ')}. Your ruling planet is ${WESTERN_RULER[ref]}, whose day is ${day} — a natural day to start things that matter to you.`
    : en
      ? `Your three highest-scoring months of 2027 are ${luckyMonths.join(', ')}. ${rashi.sanskrit}’s traditional colour is ${rashi.luckyColor.toLowerCase()} and its numbers are ${rashi.luckyNumbers.join(' and ')}; this year ${helper} is your most supportive slow planet, so its colour (${PLANET_COLOUR.en[helper]}) and number (${PLANET_NUMBER[helper]}) are added. Your sign lord is ${rashi.lord}, so ${day} is your traditional day.`
      : `2027 में आपके सबसे अच्छे तीन महीने ${luckyMonths.join(', ')} हैं। ${rashi.hindi} राशि का पारंपरिक रंग ${rashi.luckyColorHindi} और अंक ${rashi.luckyNumbers.join(' और ')} हैं; इस वर्ष ${pName(helper, 'hi')} आपके सबसे सहायक धीमे ग्रह हैं, इसलिए उनका रंग (${PLANET_COLOUR.hi[helper]}) और अंक (${PLANET_NUMBER[helper]}) भी जोड़े गए हैं। आपकी राशि के स्वामी ${rashi.lordHindi} हैं, इसलिए ${day} आपका पारंपरिक शुभ दिन है।`;

  // ── Remedies: the most demanding influences ──────────────────────────────
  const demanding = sky.planets
    .filter(p => SLOW.includes(p) || p === 'Mars')
    .map(p => ({ p, v: sky.segs[p].reduce((s, x) => s + (x.endMs - x.startMs) * (toneOf(system, p, houseFrom(ref, x.sign)) === 'challenging' ? 1 : 0), 0) * WEIGHT[p] }))
    .filter(x => x.v > 0)
    .sort((a, b) => b.v - a.v)
    .map(x => x.p);
  const remedyPlanets = demanding.slice(0, 2);
  if (!remedyPlanets.length) remedyPlanets.push('Jupiter');
  const remedyKeys = [
    ...(inSadeSati ? ['sadeSati'] : inDhaiya ? ['dhaiya'] : []),
    ...remedyPlanets.filter(p => !(p === 'Saturn' && (inSadeSati || inDhaiya))).map(p => `planet:${p}`),
  ];

  // ── Headline + brief ──────────────────────────────────────────────────────
  const strongest = best[0];
  const hardest = challenging[0];
  const headline = system === 'western'
    ? `2027 is ${tone === 'favourable' ? 'a broadly supportive year' : tone === 'challenging' ? 'a demanding but workable year' : 'a mixed year with clear high points'} for ${name}.`
    : en
      ? `2027 reads as ${tone === 'favourable' ? 'a broadly supportive year' : tone === 'challenging' ? 'a demanding but workable year' : 'a mixed year with clear high points'} for ${fullName} Moon sign.`
      : `${rashi.hindi} राशि के लिए 2027 ${tone === 'favourable' ? 'कुल मिलाकर अनुकूल वर्ष' : tone === 'challenging' ? 'मेहनत माँगने वाला पर संभलने योग्य वर्ष' : 'मिला-जुला वर्ष है, जिसमें कुछ बहुत अच्छे समय भी हैं'}${tone === 'mixed' ? '' : ' है'}।`;

  const slowStory = (p: YPlanet): string => {
    const ss = sky.segs[p];
    if (!ss) return '';
    const E = en || system === 'western';
    const parts2 = ss.map(s => {
      const h = houseFrom(ref, s.sign);
      const w = span(s.from, s.to, E ? 'en' : 'hi');
      return E ? `your ${ORD_EN[h]} house (${area(system, h, lang)}) ${w}` : `${w} ${ORD_HI[h]} भाव (${area(system, h, lang)}) में`;
    });
    if (E) return `${p} ${ss.length === 1 ? 'stays in' : 'moves through'} ${parts2.join(', then ')}.`;
    return `${pName(p, 'hi', false)} ${parts2.join(', फिर ')} रहेंगे।`;
  };
  const brief: string[] = [];
  if (system === 'western') {
    brief.push(`${headline} The year is shaped by the slow planets: ${slowStory('Jupiter')} ${slowStory('Saturn')}`);
  } else if (en) {
    const nodes = sky.segs.Rahu.length === 1 && sky.segs.Ketu.length === 1
      ? `Rahu stays in your ${ORD_EN[houseFrom(ref, sky.segs.Rahu[0].sign)]} house (${AREA.en[houseFrom(ref, sky.segs.Rahu[0].sign)]}) and Ketu in your ${ORD_EN[houseFrom(ref, sky.segs.Ketu[0].sign)]} (${AREA.en[houseFrom(ref, sky.segs.Ketu[0].sign)]}) all year.`
      : `${slowStory('Rahu')} ${slowStory('Ketu')}`;
    brief.push(`${headline} Three slow movers shape it. Jupiter, the planet of growth, ${slowStory('Jupiter').replace(/^Jupiter /, '')} Saturn, the planet of effort, ${slowStory('Saturn').replace(/^Saturn /, '')} ${nodes}`);
  } else {
    const rh = houseFrom(ref, sky.segs.Rahu[0].sign), kh = houseFrom(ref, sky.segs.Ketu[0].sign);
    const nodes = sky.segs.Rahu.length === 1 && sky.segs.Ketu.length === 1
      ? `राहु पूरे वर्ष ${ORD_HI[rh]} भाव (${AREA.hi[rh]}) में और केतु ${ORD_HI[kh]} भाव (${AREA.hi[kh]}) में रहेंगे।`
      : `${slowStory('Rahu')} ${slowStory('Ketu')}`;
    brief.push(`${headline} इस वर्ष की दिशा तीन धीमे ग्रह तय करते हैं। वृद्धि के कारक ${slowStory('Jupiter')} परिश्रम के कारक ${slowStory('Saturn')} ${nodes}`);
  }
  const good = areas.filter(a => a.tone === 'favourable').map(a => a.title.toLowerCase());
  const care = areas.filter(a => a.tone === 'challenging').map(a => a.title.toLowerCase());
  if (en) {
    brief.push(`In plain terms: ${good.length ? `the strongest support this year is for ${joinList(good, 'en')}` : 'no single life area gets an easy ride, so steady effort matters more than luck'}${care.length ? `, while ${joinList(care, 'en')} ${care.length > 1 ? 'need' : 'needs'} the most care` : ''}. ${strongest ? `Your best stretch is ${range(strongest.from, strongest.to, 'en')}` : ''}${hardest ? `${strongest ? ', and the most demanding one is ' : 'The most demanding stretch is '}${range(hardest.from, hardest.to, 'en')}` : ''}. The month-by-month notes below give the reason behind each.`);
  } else {
    const gHi = areas.filter(a => a.tone === 'favourable').map(a => a.title);
    const cHi = areas.filter(a => a.tone === 'challenging').map(a => a.title);
    brief.push(`सरल शब्दों में: ${gHi.length ? `इस वर्ष सबसे अच्छा सहयोग ${joinList(gHi, 'hi')} को मिलता है` : 'इस वर्ष किसी एक क्षेत्र में सब आसान नहीं है, इसलिए भाग्य से ज़्यादा नियमित मेहनत काम आएगी'}${cHi.length ? `, जबकि ${joinList(cHi, 'hi')} में सबसे ज़्यादा सावधानी चाहिए` : ''}। ${strongest ? `आपका सबसे अच्छा समय ${range(strongest.from, strongest.to, 'hi')} है` : ''}${hardest ? `${strongest ? ', और सबसे ज़्यादा मेहनत वाला समय ' : 'सबसे ज़्यादा मेहनत वाला समय '}${range(hardest.from, hardest.to, 'hi')} है` : ''}। नीचे महीनेवार विवरण में हर बात का कारण दिया गया है।`);
  }

  // ── FAQ ───────────────────────────────────────────────────────────────────
  const faq = buildFaq(system, lang, ref, name, fullName, headline, areas, best, challenging, loveWindows, saturn, eclipses, luckyMonths);

  return {
    system, lang, signIndex: ref, name, tone, headline, brief, transits, areas, months, best, challenging, loveWindows,
    saturn, eclipses, lucky: { months: luckyMonths, colours, numbers, day, text: luckyText, monthIdx: top3.slice().sort((a, b) => a - b), helper, weekday: lordWeekday }, remedyPlanets, remedyKeys, faq,
  };
}

/** Traditional (classical) rulers of the twelve signs. */
const WESTERN_RULER = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];

function buildArea(system: System, lang: Lang, ref: number, sky: YearSky, k: Domain): AreaReading {
  const en = lang === 'en';
  const HOUSES: Record<Domain, number[]> = { love: [5, 7], career: [10, 6, 1], money: [2, 11], health: [1, 6, 8] };
  const FAST: Record<Domain, YPlanet[]> = { love: ['Venus', 'Mars'], career: ['Sun', 'Mars', 'Mercury'], money: ['Venus', 'Mercury'], health: ['Sun', 'Mars'] };
  const houses = HOUSES[k];
  // One candidate per (planet, house): a planet that leaves and returns is one reason with two spans.
  const byKey = new Map<string, { p: YPlanet; h: number; spans: Array<[string, string]>; w: number }>();
  for (const p of sky.planets.filter(p => SLOW.includes(p) || FAST[k].includes(p))) {
    for (const s of sky.segs[p]) {
      const h = houseFrom(ref, s.sign);
      if (!houses.includes(h) || (!SLOW.includes(p) && s.endMs - s.startMs < 10 * 86400_000)) continue;
      const key = `${p}:${h}`;
      const c = byKey.get(key) ?? { p, h, spans: [], w: 0 };
      c.spans.push([s.from, s.to]);
      c.w += WEIGHT[p] * (s.endMs - s.startMs);
      byKey.set(key, c);
    }
  }
  const cands = [...byKey.values()].sort((a, b) => b.w - a.w);
  let sc = 0, sw = 0;
  for (const c of cands) { sc += c.w * val(toneOf(system, c.p, c.h)); sw += c.w; }
  const n = sw ? sc / sw : 0;
  const tone: Tone = n > 0.2 ? 'favourable' : n < -0.2 ? 'challenging' : 'mixed';
  const top = cands.slice(0, 2);
  const reasons = top.map(({ spans, p, h }) => {
    const t = toneOf(system, p, h);
    const when = spans.map(([a, b]) => span(a, b, system === 'western' ? 'en' : lang)).join(en || system === 'western' ? ' and ' : ' और ');
    if (system === 'western') return `${p} in your ${ORD_EN[h]} solar house (${WESTERN_AREA[h]}), ${when}: ${WESTERN_LENS[p][t]}.`;
    if (en) return `${p} in your ${ORD_EN[h]} house (${AREA.en[h]}), ${when} — ${PLACEMENT.en[t]} that brings ${LENS.en[p][t]}.`;
    return `${pName(p, 'hi')} ${when} आपके ${ORD_HI[h]} भाव (${AREA.hi[h]}) में — ${PLACEMENT.hi[t]}: ${LENS.hi[p][t]}।`;
  });
  if (!reasons.length) {
    reasons.push(system === 'western'
      ? 'No slow planet passes through the houses of this area in 2027, so it runs on your own steady effort.'
      : en ? 'No major planet passes through the houses of this area in 2027 — a quiet, steady year here that rewards ordinary good habits.'
        : '2027 में इस क्षेत्र के भावों से कोई बड़ा ग्रह नहीं गुज़रता — यहाँ शांत, स्थिर वर्ष है जिसमें सामान्य अच्छी आदतें ही फल देती हैं।');
  }
  const lead = top[0];
  const leadTip = lead ? tip(system, lead.h, toneOf(system, lead.p, lead.h), lang) : '';
  const todo = system === 'western' ? `${WESTERN_TODO[k][tone]}${leadTip ? ' ' + leadTip : ''}` : `${DOMAIN_TODO[lang][k][tone]}${leadTip ? ' ' + leadTip : ''}`;
  return {
    key: k,
    title: system === 'western' ? DOMAIN_TITLE.en[k] : DOMAIN_TITLE[lang][k],
    tone,
    impact: system === 'western' ? WESTERN_IMPACT[k][tone] : DOMAIN_IMPACT[lang][k][tone],
    reasons,
    todo,
    factors: top.map(({ p, h, spans }) => ({ p, h, spans })),
  };
}

function buildMonth(system: System, lang: Lang, ref: number, sky: YearSky, m: number, score: number, mean: number, isTop: boolean, isBottom: boolean): MonthNote {
  const en = lang === 'en';
  const mm = String(m + 1).padStart(2, '0');
  const inMonth = (iso: string) => iso.slice(5, 7) === mm && iso.startsWith(String(sky.year));
  const V = system === 'western' ? MONTH_VERDICT.en : MONTH_VERDICT[lang];
  const tone: Tone = score - mean > 0.6 ? 'favourable' : score - mean < -0.6 ? 'challenging' : 'mixed';
  const verdict = isTop ? V.best : isBottom ? V.hard : tone === 'favourable' ? V.good : tone === 'challenging' ? V.care : V.mixed;
  // Events of the month, in date order; slow planets, eclipses and stations first in priority.
  const ev: Array<{ iso: string; pri: number; text: string; e: MonthEvent }> = [];
  const E = en || system === 'western';
  for (const p of sky.planets) {
    for (const s of sky.segs[p].slice(1)) {
      if (!inMonth(s.from)) continue;
      const h = houseFrom(ref, s.sign);
      const t = toneOf(system, p, h);
      const pri = SLOW.includes(p) ? 0 : p === 'Mars' || p === 'Venus' ? 2 : p === 'Sun' ? 3 : 4;
      const text = system === 'western'
        ? `${shortDate(s.from, 'en')}: ${p} enters your ${ORD_EN[h]} solar house (${WESTERN_AREA[h]}) — ${WESTERN_LENS[p][t]}.`
        : en
          ? `${shortDate(s.from, 'en')}: ${p} enters your ${ORD_EN[h]} house (${AREA.en[h]}) — ${TONE_WORD.en[t]}${SLOW.includes(p) ? `: ${LENS.en[p][t]}` : ''}.`
          : `${shortDate(s.from, 'hi')}: ${pName(p, 'hi')} आपके ${ORD_HI[h]} भाव (${AREA.hi[h]}) में — ${TONE_WORD.hi[t]}${SLOW.includes(p) ? `: ${LENS.hi[p][t]}` : ''}।`;
      ev.push({ iso: s.from, pri, text, e: { iso: s.from, kind: 'ingress', p, h, t } });
    }
  }
  for (const r of sky.retro) {
    const rh = houseFrom(ref, signOn(sky, r.planet, Math.max(r.startMs, Date.UTC(sky.year, 0, 1))));
    const rArea = system === 'western' ? WESTERN_AREA[rh] : AREA[lang][rh];
    if (inMonth(r.from)) ev.push({ iso: r.from, pri: 1, e: { iso: r.from, kind: 'retro', p: r.planet, h: rh, to: r.to }, text: E
      ? `${shortDate(r.from, 'en')}: ${r.planet} turns retrograde in your ${ORD_EN[rh]} ${system === 'western' ? 'solar ' : ''}house until ${shortDate(r.to, 'en')} — ${r.planet === 'Mercury' ? 're-check plans and paperwork about' : 'review rather than start anything new in'} ${rArea}.`
      : `${shortDate(r.from, 'hi')}: ${pName(r.planet, 'hi')} ${shortDate(r.to, 'hi')} तक ${ORD_HI[rh]} भाव में वक्री — ${rArea} से जुड़े ${r.planet === 'Mercury' ? 'योजनाएँ और काग़ज़ दोबारा जाँचें' : 'मामलों में नया शुरू करने के बजाय पुराना पूरा करें'}।` });
    if (inMonth(r.to) && r.to.startsWith(String(sky.year))) ev.push({ iso: r.to, pri: 3, e: { iso: r.to, kind: 'direct', p: r.planet, h: houseFrom(ref, signOn(sky, r.planet, r.endMs)) }, text: E
      ? `${shortDate(r.to, 'en')}: ${r.planet} turns direct in your ${ORD_EN[houseFrom(ref, signOn(sky, r.planet, r.endMs))]} ${system === 'western' ? 'solar ' : ''}house.`
      : `${shortDate(r.to, 'hi')}: ${pName(r.planet, 'hi')} ${ORD_HI[houseFrom(ref, signOn(sky, r.planet, r.endMs))]} भाव में मार्गी।` });
  }
  for (const e of sky.eclipses) {
    if (!inMonth(e.istDate)) continue;
    const h = houseFrom(ref, e.sign);
    const kind = e.name.replace(/ \(.*\)$/, '').toLowerCase();
    ev.push({ iso: e.istDate, pri: 0, e: { iso: e.istDate, kind: 'eclipse', h, solar: e.body === 'solar' }, text: system === 'western'
      ? `${shortDate(e.istDate, 'en')}: ${kind} in your ${ORD_EN[h]} solar house.`
      : en ? `${shortDate(e.istDate, 'en')}: ${kind} in your ${ORD_EN[h]} house — keep the day quiet.`
        : `${shortDate(e.istDate, 'hi')}: ${e.body === 'solar' ? 'सूर्य' : 'चंद्र'} ग्रहण, आपके ${ORD_HI[h]} भाव में — उस दिन शांति रखें।` });
  }
  const picked = ev.sort((a, b) => a.pri - b.pri || (a.iso < b.iso ? -1 : 1)).slice(0, 2).sort((a, b) => (a.iso < b.iso ? -1 : a.iso > b.iso ? 1 : a.pri - b.pri));
  const events = picked.map(x => x.text);
  // The month's backdrop: the strongest influence at mid-month that matches the verdict.
  const mid = Date.UTC(sky.year, m, 15, 6, 30);
  const infl = sky.planets.map(p => {
    const h = houseFrom(ref, signOn(sky, p, mid));
    const t = toneOf(system, p, h);
    return { p, h, t, w: WEIGHT[p] * val(t) };
  });
  const wantPositive = tone === 'favourable' || (tone === 'mixed' && isTop);
  const lead = [...infl].sort((a, b) => (wantPositive ? b.w - a.w : a.w - b.w))[0];
  const backdrop = system === 'western'
    ? `The main influence: ${lead.p} in your ${ORD_EN[lead.h]} solar house (${WESTERN_AREA[lead.h]}).`
    : en
      ? `The main influence is ${lead.p} in your ${ORD_EN[lead.h]} house (${AREA.en[lead.h]}).`
      : `इस महीने का मुख्य प्रभाव: ${pName(lead.p, 'hi')} आपके ${ORD_HI[lead.h]} भाव (${AREA.hi[lead.h]}) में।`;
  const todo = tip(system, lead.h, lead.t, lang);
  const text = [events.length ? '' : backdrop, ...events, (en || system === 'western' ? 'What to do: ' : 'क्या करें: ') + todo].filter(Boolean).join(' ');
  const verdictKey = isTop ? 'best' : isBottom ? 'hard' : tone === 'favourable' ? 'good' : tone === 'challenging' ? 'care' : 'mixed';
  return { month: m, name: en || system === 'western' ? MONTHS_EN[m] : MONTHS_HI[m], tone, verdict, text, score, verdictKey, events: picked.map(x => x.e), lead: { p: lead.p, h: lead.h, t: lead.t } };
}

function buildSaturn(system: System, lang: Lang, ref: number, sky: YearSky, fullName: string): YearReading['saturn'] {
  const en = lang === 'en';
  if (system === 'western') {
    const rows = sky.segs.Saturn.map(s => {
      const h = houseFrom(ref, s.sign);
      return { from: s.from, to: s.to, when: range(s.from, s.to, 'en'), label: `Saturn in your ${ORD_EN[h]} solar house — ${WESTERN_AREA[h]}`, house: h };
    });
    const h = rows[0].house;
    return { status: 'none', rows, short: `Saturn is in your ${ORD_EN[h]} solar house in 2027.`, text: `Saturn spends ${rows.length === 1 ? 'all of 2027' : 'most of 2027'} in ${WESTERN_SIGNS[sky.segs.Saturn[0].sign]}, your ${ORD_EN[h]} solar house of ${WESTERN_AREA[h]}. Saturn asks for structure wherever it sits: ${WESTERN_LENS.Saturn[westernTone('Saturn', h)]}.` };
  }
  const rows: SaturnRow[] = [];
  for (const s of sky.segs.Saturn) {
    const h = houseFrom(ref, s.sign);
    let label = '';
    if (h === 12) label = en ? 'Sade Sati — first (rising) phase' : 'साढ़ेसाती — पहला (उदय) चरण';
    else if (h === 1) label = en ? 'Sade Sati — second (peak) phase' : 'साढ़ेसाती — दूसरा (शिखर) चरण';
    else if (h === 2) label = en ? 'Sade Sati — third (setting) phase' : 'साढ़ेसाती — तीसरा (अस्त) चरण';
    else if (h === 4) label = en ? 'Shani Dhaiya — Kantaka Shani (4th from Moon)' : 'शनि ढैया — कंटक शनि (चंद्र से चौथा)';
    else if (h === 8) label = en ? 'Shani Dhaiya — Ashtama Shani (8th from Moon)' : 'शनि ढैया — अष्टम शनि (चंद्र से आठवाँ)';
    else label = en ? `No Sade Sati or Dhaiya — Saturn in your ${ORD_EN[h]} house` : `न साढ़ेसाती, न ढैया — शनि ${ORD_HI[h]} भाव में`;
    rows.push({ from: s.from, to: s.to, when: range(s.from, s.to, lang), label, house: h });
  }
  const anySS = rows.some(r => [12, 1, 2].includes(r.house));
  const anyDh = rows.some(r => [4, 8].includes(r.house));
  const status = anySS ? 'sadeSati' : anyDh ? 'dhaiya' : 'none';
  // The whole Sade Sati this belongs to (engine table, 1950–2060).
  const ss = periodsFor(ref, 'sadeSati').find(p => Date.parse(p.start) < Date.UTC(2028, 0, 1) && Date.parse(p.end) > Date.UTC(2027, 0, 1));
  const span = ss ? (en ? ` Your current Sade Sati runs from ${longDate(ss.start.slice(0, 10), 'en')} to ${longDate(ss.end.slice(0, 10), 'en')}.` : ` आपकी यह साढ़ेसाती ${longDate(ss.start.slice(0, 10), 'hi')} से ${longDate(ss.end.slice(0, 10), 'hi')} तक चलती है।`) : '';
  const parts = rows.map(r => `${r.label} (${r.when})`).join(en ? '; ' : '; ');
  let text: string;
  if (en) {
    text = status === 'sadeSati'
      ? `Sade Sati: yes, in 2027. ${parts}.${span} Read it as a period of responsibility and steady effort rather than fear — what you build in it tends to last.`
      : status === 'dhaiya'
        ? `Shani Dhaiya: yes, in 2027. ${parts}. Dhaiya is a lighter, 2½-year version of Sade Sati’s themes — patience, discipline and looking after your base.`
        : `Sade Sati and Shani Dhaiya: no, not in 2027 for ${fullName}. ${parts}.`;
  } else {
    text = status === 'sadeSati'
      ? `साढ़ेसाती: हाँ, 2027 में। ${parts}।${span} इसे डर का नहीं, ज़िम्मेदारी और लगातार मेहनत का समय मानें — इस दौरान बनाई गई नींव लंबे समय तक टिकती है।`
      : status === 'dhaiya'
        ? `शनि ढैया: हाँ, 2027 में। ${parts}। ढैया साढ़ेसाती के विषयों का हल्का, लगभग ढाई वर्ष का रूप है — धैर्य, अनुशासन और अपनी नींव की देखभाल।`
        : `साढ़ेसाती और शनि ढैया: ${fullName} के लिए 2027 में नहीं। ${parts}।`;
  }
  const first = rows.find(r => [12, 1, 2, 4, 8].includes(r.house));
  const short = en
    ? (status === 'none' ? `No — neither Sade Sati nor Shani Dhaiya applies to ${fullName} in 2027.` : `Yes — ${first!.label.toLowerCase()} from ${first!.when}${rows.filter(r => [12, 1, 2, 4, 8].includes(r.house)).length > 1 ? ', with Saturn moving back and forth across a sign boundary during the year' : ''}.${span}`)
    : (status === 'none' ? `नहीं — 2027 में ${fullName} पर न साढ़ेसाती है, न शनि ढैया।` : `हाँ — ${first!.label} (${first!.when})${rows.filter(r => [12, 1, 2, 4, 8].includes(r.house)).length > 1 ? '; वर्ष के दौरान शनि राशि की सीमा पर आगे-पीछे होते हैं' : ''}।${span}`);
  return { status, rows, text, short, ...(ss ? { ssSpan: { start: ss.start.slice(0, 10), end: ss.end.slice(0, 10) } } : {}) };
}

function buildFaq(system: System, lang: Lang, ref: number, name: string, fullName: string, headline: string, areas: AreaReading[], best: Window[], challenging: Window[], love: Window[], saturn: YearReading['saturn'], eclipses: EclipseRow[], luckyMonths: string[]): Array<{ question: string; answer: string }> {
  const en = lang === 'en';
  const wl = (ws: Window[]) => ws.map(w => range(w.from, w.to, en || system === 'western' ? 'en' : 'hi')).join(en || system === 'western' ? ', ' : ', ');
  const career = areas.find(a => a.key === 'career')!;
  const money = areas.find(a => a.key === 'money')!;
  const health = areas.find(a => a.key === 'health')!;
  const ecl = eclipses.map(e => `${e.date.slice(8, 10).replace(/^0/, '')} ${en || system === 'western' ? MONTHS_EN[Number(e.date.slice(5, 7)) - 1] : MONTHS_HI[Number(e.date.slice(5, 7)) - 1]} — ${en || system === 'western' ? ORD_EN[e.house] + ' house' : ORD_HI[e.house] + ' भाव'}`).join('; ');
  if (system === 'western') {
    return [
      { question: `How will 2027 be for ${name}?`, answer: `${headline} ${areas.map(a => a.impact).slice(0, 2).join(' ')}` },
      { question: `What are the best months for ${name} in 2027?`, answer: `Your three highest-scoring months are ${luckyMonths.join(', ')}, and the strongest stretches are ${wl(best) || 'spread through the year'}.` },
      { question: `When should ${name} be careful in 2027?`, answer: challenging.length ? `The most demanding stretches are ${wl(challenging)}. They are not bad luck — they are times to slow down, double-check and avoid forcing things.` : 'No long demanding stretch stands out in 2027; the usual Mercury retrograde weeks are the main times to double-check.' },
      { question: `How is 2027 for ${name} career and money?`, answer: `${career.impact} ${money.impact}` },
      { question: `Is 2027 a good year for love for ${name}?`, answer: love.length ? `The most relationship-friendly windows are ${wl(love)}, when Venus or Jupiter favours your houses of love. Use them for important conversations and plans.` : 'Love depends more on your own effort this year than on a particular window; the month-by-month notes show the warmer weeks.' },
      { question: 'Is this based on my Sun sign?', answer: `Yes. Western horoscopes read the year from your Sun sign. This page counts each planet’s house from ${name} (the “solar houses” method) using the real tropical positions of the planets in 2027. If you know your Vedic Moon sign, read your Rashifal 2027 too — it uses a different method.` },
      { question: 'How accurate is this horoscope?', answer: `The planet positions and dates are computed precisely from astronomy; the reading follows the traditional rules of astrology. It describes tendencies, not certainties — treat it as a planning guide, not a prediction of events. ${health.impact}` },
    ];
  }
  if (en) {
    return [
      { question: `How will 2027 be for ${name} rashi?`, answer: `${headline} ${areas.find(a => a.tone === 'favourable')?.impact ?? areas[0].impact} Every reason and date is in the sections above.` },
      { question: `Is ${name} rashi in Sade Sati in 2027?`, answer: saturn.short },
      { question: `What are the best months for ${name} rashi in 2027?`, answer: `Your three highest-scoring months are ${luckyMonths.join(', ')}. The strongest stretches are ${wl(best) || 'spread through the year'} — good times to start important work, ask for a role or make plans.` },
      { question: `Which period of 2027 needs care for ${name} rashi?`, answer: challenging.length ? `The most demanding stretches are ${wl(challenging)}. Use them to finish, review and rest rather than to launch new things; nothing here predicts a specific event.` : 'No long demanding stretch stands out in 2027; use the retrograde weeks to double-check plans.' },
      { question: `How is 2027 for ${name} rashi career and money?`, answer: `${career.impact} ${money.impact} The career and money sections above give the planets and dates behind this.` },
      { question: `Is 2027 good for marriage for ${name} rashi?`, answer: love.length ? `The relationship-friendly windows in 2027 are ${wl(love)}, when Venus or Jupiter supports your houses of love from the Moon. If a marriage is being planned, these are the windows the tradition favours — the final date (muhurat) should come from both partners’ full charts.` : 'No long Venus or Jupiter window favours your houses of love in 2027; if marriage is being planned, the date (muhurat) should come from both partners’ full charts.' },
      { question: 'How is this rashifal 2027 calculated?', answer: `From your Moon sign, ${fullName}, by the classical gochar (transit) rules, using the real sidereal positions of every planet through 2027 — rigorously computed, but a traditional reading of tendencies, not a certainty.` },
    ];
  }
  return [
    { question: `${name} राशि के लिए 2027 कैसा रहेगा?`, answer: `${headline} ${areas.find(a => a.tone === 'favourable')?.impact ?? areas[0].impact} हर कारण और तारीख़ ऊपर के हिस्सों में दी गई है।` },
    { question: `क्या 2027 में ${name} राशि पर साढ़ेसाती है?`, answer: saturn.short },
    { question: `2027 में ${name} राशि के लिए सबसे अच्छे महीने कौन से हैं?`, answer: `आपके सबसे अच्छे तीन महीने ${luckyMonths.join(', ')} हैं। सबसे मज़बूत समय ${wl(best) || 'पूरे वर्ष में बँटा हुआ'} है — महत्वपूर्ण काम शुरू करने, नई भूमिका माँगने या योजना बनाने के लिए अच्छा।` },
    { question: `2027 में ${name} राशि को किस समय सावधान रहना चाहिए?`, answer: challenging.length ? `सबसे ज़्यादा मेहनत वाला समय ${wl(challenging)} है। इस दौरान नया शुरू करने के बजाय पुराने काम पूरे करें, समीक्षा करें और आराम करें; यह किसी ख़ास घटना की भविष्यवाणी नहीं है।` : '2027 में कोई लंबा कठिन समय नहीं दिखता; वक्री ग्रहों के हफ़्तों में योजनाएँ दोबारा जाँचें।' },
    { question: `2027 में ${name} राशि का करियर और धन कैसा रहेगा?`, answer: `${career.impact} ${money.impact} ऊपर करियर और धन वाले हिस्से में इसके पीछे के ग्रह और तारीखें दी गई हैं।` },
    { question: `क्या 2027 ${name} राशि के लिए विवाह के लिए अच्छा है?`, answer: love.length ? `2027 में रिश्तों के लिए अनुकूल समय ${wl(love)} है, जब शुक्र या गुरु चंद्र राशि से प्रेम के भावों को सहयोग देते हैं। विवाह की योजना हो तो परंपरा इन्हीं समयों को अच्छा मानती है — अंतिम तिथि (मुहूर्त) दोनों की पूरी कुंडली से निकालें।` : '2027 में शुक्र या गुरु का कोई लंबा समय प्रेम के भावों को सहयोग नहीं देता; विवाह की योजना हो तो मुहूर्त दोनों की पूरी कुंडली से निकालें।' },
    { question: 'यह राशिफल 2027 कैसे बनाया गया है?', answer: `आपकी चंद्र राशि (${fullName}) से, 2027 में हर ग्रह की वास्तविक निरयन स्थिति लेकर शास्त्रीय गोचर नियमों से — गणना सटीक है, पर यह प्रवृत्तियों का पारंपरिक पाठ है, निश्चितता नहीं।` },
  ];
}
