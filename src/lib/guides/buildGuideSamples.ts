/**
 * B14 — builds the worked SAMPLE outputs for the astrology guides (see
 * scripts/gen-guide-samples.mts). Pure engine calls on fixed, illustrative sample
 * births and a fixed reference date, so the result is deterministic and can be
 * re-checked by a test. Nothing here is hand-typed astronomy.
 */
import { calculateBirthChart, type BirthChartInput, type BirthChartResult } from '@/lib/vedic/calculateBirthChart';
import { calculateGunaMilan } from '@/lib/vedic/matchmaking';
import { computeSadeSati } from '@/lib/vedic/sadeSati';
import { statusAt } from '@/lib/vedic/sadeSatiRashi';
import { readName, matchByName } from '@/lib/vedic/nameMatching';
import { buildChildKundli } from '@/lib/vedic/childKundli';
import { getSiderealLongitude, getDrikAyanamsa } from '@/lib/vedic/engine/vedicEngine';
import { GANA, NADI, YONI } from '@/lib/vedic/nakshatraAttributes';
import { calculateDateOnlyRashi } from '@/utils/celebrityCalculations';
import { grahaPositions } from '@/lib/vedic/sky';

/** Fixed "as of" date for current Dasha / Sade Sati / transit snapshots. */
export const SAMPLE_REF_ISO = '2027-01-01T00:00:00.000Z';
export const SAMPLE_REF_LABEL = '1 January 2027';

export interface SampleBirth { id: string; label: string; dateLabel: string; timeLabel: string; place: string; input: BirthChartInput }

const IST = 5.5;
export const SAMPLE_BIRTHS: Record<string, SampleBirth> = {
  a: { id: 'a', label: 'Sample chart A', dateLabel: '15 August 1995', timeLabel: '06:30', place: 'New Delhi', input: { year: 1995, month: 8, day: 15, hour: 6, minute: 30, latitude: 28.6139, longitude: 77.209, timezoneOffset: IST } },
  b: { id: 'b', label: 'Sample chart B', dateLabel: '22 March 1997', timeLabel: '14:15', place: 'Mumbai', input: { year: 1997, month: 3, day: 22, hour: 14, minute: 15, latitude: 19.076, longitude: 72.8777, timezoneOffset: IST } },
  c: { id: 'c', label: 'नमूना कुंडली (वर)', dateLabel: '5 May 1993', timeLabel: '08:10', place: 'Jaipur', input: { year: 1993, month: 5, day: 5, hour: 8, minute: 10, latitude: 26.9124, longitude: 75.7873, timezoneOffset: IST } },
  d: { id: 'd', label: 'नमूना कुंडली (वधू)', dateLabel: '18 November 1995', timeLabel: '21:40', place: 'Lucknow', input: { year: 1995, month: 11, day: 18, hour: 21, minute: 40, latitude: 26.8467, longitude: 80.9462, timezoneOffset: IST } },
  child: { id: 'child', label: 'Sample child chart', dateLabel: '22 January 2024', timeLabel: '09:00', place: 'Bengaluru', input: { year: 2024, month: 1, day: 22, hour: 9, minute: 0, latitude: 12.9716, longitude: 77.5946, timezoneOffset: IST } },
  e: { id: 'e', label: 'Sample chart E', dateLabel: '3 November 1988', timeLabel: '18:45', place: 'Kolkata', input: { year: 1988, month: 11, day: 3, hour: 18, minute: 45, latitude: 22.5726, longitude: 88.3639, timezoneOffset: IST } },
  g: { id: 'g', label: 'Sample chart G', dateLabel: '12 February 1985', timeLabel: '04:20', place: 'Chennai', input: { year: 1985, month: 2, day: 12, hour: 4, minute: 20, latitude: 13.0827, longitude: 80.2707, timezoneOffset: IST } },
  k: { id: 'k', label: 'Sample chart K', dateLabel: '9 July 2002', timeLabel: '12:00', place: 'Hyderabad', input: { year: 2002, month: 7, day: 9, hour: 12, minute: 0, latitude: 17.385, longitude: 78.4867, timezoneOffset: IST } },
};

const RASHI = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
const WESTERN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

/** 12°34′ style degree-in-sign. */
export function dms(deg: number): string {
  const d = ((deg % 30) + 30) % 30;
  let whole = Math.floor(d);
  let min = Math.round((d - whole) * 60);
  if (min === 60) { whole += 1; min = 0; }
  return `${whole}°${String(min).padStart(2, '0')}′`;
}
const ymd = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : null);
const round = (x: number, p = 2) => Math.round(x * 10 ** p) / 10 ** p;

function birthUtc(i: BirthChartInput): Date {
  return new Date(Date.UTC(i.year, i.month - 1, i.day, i.hour, i.minute) - i.timezoneOffset * 3600_000);
}

function chartSummary(b: SampleBirth, c: BirthChartResult) {
  const moon = c.planets.find(p => p.name === 'Moon')!;
  return {
    birth: { label: b.label, date: b.dateLabel, time: b.timeLabel, place: b.place, lat: b.input.latitude, lon: b.input.longitude },
    ayanamsa: `${Math.floor(c.ayanamsa)}°${String(Math.round((c.ayanamsa - Math.floor(c.ayanamsa)) * 60)).padStart(2, '0')}′`,
    ayanamsaDeg: round(c.ayanamsa, 4),
    lagna: { sign: c.lagna.sign, western: WESTERN[c.lagna.signIndex - 1] ?? null, degree: dms(c.lagna.degrees) },
    rashi: c.rashi,
    rashiIndex: moon.signIndex - 1,
    moonDegree: dms(moon.longitude),
    moonLongitude: round(moon.longitude, 4),
    nakshatra: { name: c.nakshatra.nakshatra, pada: c.nakshatra.pada, lord: c.nakshatra.lord },
    planets: c.planets.map(p => ({ name: p.name, sign: p.sign, house: p.house, degree: dms(p.longitude), nakshatra: p.nakshatra, pada: p.pada, retrograde: p.retrograde })),
    currentDasha: c.currentDasha ? {
      mahadasha: c.currentDasha.mahadasha, mahadashaStart: ymd(c.currentDasha.mahadasha_start), mahadashaEnd: ymd(c.currentDasha.mahadasha_end),
      antardasha: c.currentDasha.antardasha, antardashaStart: ymd(c.currentDasha.antardasha_start), antardashaEnd: ymd(c.currentDasha.antardasha_end),
    } : null,
  };
}

export async function buildGuideSamples() {
  const ref = new Date(SAMPLE_REF_ISO);
  const charts: Record<string, BirthChartResult> = {};
  for (const [k, b] of Object.entries(SAMPLE_BIRTHS)) charts[k] = await calculateBirthChart(b.input, { refDate: ref });

  const A = charts.a;
  const a = chartSummary(SAMPLE_BIRTHS.a, A);

  // ── Dasha timeline of chart A (Mahadashas from birth) ─────────────────────────
  const G = charts.g;
  const born = birthUtc(SAMPLE_BIRTHS.g.input).getTime();
  const tl = (G.dashaTimeline ?? []).filter(m => Date.parse(m.end) > born);
  const firstEnd = tl.length ? Date.parse(tl[0].end) : born;
  const balanceYears = round((firstEnd - born) / (365.25 * 864e5), 2);
  const dasha = {
    chart: chartSummary(SAMPLE_BIRTHS.g, G),
    startLord: tl[0]?.lord ?? null,
    balanceYearsAtBirth: balanceYears,
    mahadashas: tl.slice(0, 9).map(m => ({ lord: m.lord, start: ymd(m.start), end: ymd(m.end) })),
    currentAntardashas: (() => {
      const cur = tl.find(m => Date.parse(m.start) <= ref.getTime() && ref.getTime() < Date.parse(m.end));
      return cur ? cur.antardashas.map(x => ({ lord: x.lord, start: ymd(x.start), end: ymd(x.end) })) : [];
    })(),
  };

  // ── Matching: A (groom) × B (bride) ───────────────────────────────────────────
  const person = (c: BirthChartResult) => {
    const moon = c.planets.find(p => p.name === 'Moon')!;
    return { nakshatra: c.nakshatra.nakshatra, pada: c.nakshatra.pada, rashiIndex: moon.signIndex - 1, moonLongitude: moon.longitude };
  };
  const matchOf = (g: BirthChartResult, br: BirthChartResult) => {
    const m = calculateGunaMilan(person(g), person(br));
    return {
      total: m.total, max: m.max, compatibility: m.compatibility,
      kootas: m.kootas.map(k => ({ key: k.key, label: k.label, score: k.score, max: k.max })),
      doshas: m.doshas.map(d => ({ name: d.name, present: d.present, cancelled: d.cancelled })),
    };
  };
  const B = charts.b;
  const match = {
    groom: { label: SAMPLE_BIRTHS.a.label, date: SAMPLE_BIRTHS.a.dateLabel, time: SAMPLE_BIRTHS.a.timeLabel, place: SAMPLE_BIRTHS.a.place, rashi: A.rashi, nakshatra: A.nakshatra.nakshatra, pada: A.nakshatra.pada, gana: GANA[A.nakshatra.nakshatra], nadi: NADI[A.nakshatra.nakshatra], yoni: YONI[A.nakshatra.nakshatra], manglik: A.doshas.mangalDosha.severityLabel },
    bride: { label: SAMPLE_BIRTHS.b.label, date: SAMPLE_BIRTHS.b.dateLabel, time: SAMPLE_BIRTHS.b.timeLabel, place: SAMPLE_BIRTHS.b.place, rashi: B.rashi, nakshatra: B.nakshatra.nakshatra, pada: B.nakshatra.pada, gana: GANA[B.nakshatra.nakshatra], nadi: NADI[B.nakshatra.nakshatra], yoni: YONI[B.nakshatra.nakshatra], manglik: B.doshas.mangalDosha.severityLabel },
    ...matchOf(A, B),
  };
  const C = charts.c, D = charts.d;
  const matchHi = {
    groom: { date: SAMPLE_BIRTHS.c.dateLabel, time: SAMPLE_BIRTHS.c.timeLabel, place: SAMPLE_BIRTHS.c.place, rashiIndex: person(C).rashiIndex, nakshatra: C.nakshatra.nakshatra, pada: C.nakshatra.pada, manglik: C.doshas.mangalDosha.severityLabel },
    bride: { date: SAMPLE_BIRTHS.d.dateLabel, time: SAMPLE_BIRTHS.d.timeLabel, place: SAMPLE_BIRTHS.d.place, rashiIndex: person(D).rashiIndex, nakshatra: D.nakshatra.nakshatra, pada: D.nakshatra.pada, manglik: D.doshas.mangalDosha.severityLabel },
    ...matchOf(C, D),
  };

  // ── Name matching sample ──────────────────────────────────────────────────────
  const boyName = 'Vivek', girlName = 'Kavya';
  const boy = readName(boyName), girl = readName(girlName);
  const nm = boy.candidates[0] && girl.candidates[0] ? matchByName(boy.candidates[0], girl.candidates[0]) : null;
  const nameMatch = {
    boy: { name: boyName, candidates: boy.candidates.map(c => ({ nakshatra: c.nakshatra, pada: c.pada, rashiIndex: c.rashiIndex, syllable: c.akshara.en, syllableHi: c.akshara.hi })) },
    girl: { name: girlName, candidates: girl.candidates.map(c => ({ nakshatra: c.nakshatra, pada: c.pada, rashiIndex: c.rashiIndex, syllable: c.akshara.en, syllableHi: c.akshara.hi })) },
    result: nm ? { total: nm.total, max: nm.max, compatibility: nm.compatibility, kootas: nm.kootas.map(k => ({ key: k.key, label: k.label, score: k.score, max: k.max })) } : null,
  };

  // ── Sade Sati for chart A + all 12 Moon signs on the reference date ──────────
  const saturnSignAt = (d: Date) => Math.floor((((getSiderealLongitude('Saturn', d, 'drik') % 360) + 360) % 360) / 30);
  const ss = computeSadeSati(a.rashiIndex, ref, saturnSignAt, birthUtc(SAMPLE_BIRTHS.a.input));
  const sadeSati = {
    moonSign: RASHI[a.rashiIndex],
    saturnSign: RASHI[saturnSignAt(ref)],
    active: ss.active, phase: ss.phase,
    dhaiya: ss.dhaiya.type,
    currentCycle: ss.currentCycle ? { start: ymd(ss.currentCycle.start), end: ymd(ss.currentCycle.end), pauses: ss.currentCycle.pauses.length } : null,
    previousCycle: ss.previousCycle ? { start: ymd(ss.previousCycle.start), end: ymd(ss.previousCycle.end), pauses: ss.previousCycle.pauses.length } : null,
    nextCycle: ss.nextCycle ? { start: ymd(ss.nextCycle.start), end: ymd(ss.nextCycle.end), pauses: ss.nextCycle.pauses.length } : null,
    allSigns: RASHI.map((name, i) => {
      const s = statusAt(i, ref);
      return { sign: name, kind: s?.kind ?? null, phase: s && 'phase' in s ? s.phase : null, type: s && 'type' in s ? s.type : null };
    }),
  };

  // ── Doshas of chart A (Manglik, Kaal Sarp) + a Manglik check on B ────────────
  const md = (c: BirthChartResult) => ({
    hasDosha: c.doshas.mangalDosha.hasDosha, level: c.doshas.mangalDosha.severityLabel,
    marsHouseFromLagna: c.doshas.mangalDosha.marsHouseFromLagna, marsHouseFromMoon: c.doshas.mangalDosha.marsHouseFromMoon,
    fromLagna: c.doshas.mangalDosha.fromLagna, fromMoon: c.doshas.mangalDosha.fromMoon,
    cancellations: c.doshas.mangalDosha.cancellations, marsSign: c.planets.find(p => p.name === 'Mars')!.sign,
  });
  const manglik = { a: md(A), b: md(B) };
  const nodes = (c: BirthChartResult) => {
    const rahu = c.planets.find(p => p.name === 'Rahu')!;
    const norm = (x: number) => ((x % 360) + 360) % 360;
    const seven = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const side = (n: string) => {
      const o = norm(c.planets.find(p => p.name === n)!.longitude - rahu.longitude);
      return o > 0 && o < 180 ? 'rahuToKetu' : 'ketuToRahu';
    };
    const sides = seven.map(n => ({ name: n, side: side(n) }));
    return {
      rahu: { sign: rahu.sign, degree: dms(rahu.longitude), house: rahu.house },
      ketu: (() => { const k = c.planets.find(p => p.name === 'Ketu')!; return { sign: k.sign, degree: dms(k.longitude), house: k.house }; })(),
      rahuToKetu: sides.filter(s => s.side === 'rahuToKetu').map(s => s.name),
      ketuToRahu: sides.filter(s => s.side === 'ketuToRahu').map(s => s.name),
      present: c.doshas.kaalSarp.present, isPartial: c.doshas.kaalSarp.isPartial, type: c.doshas.kaalSarp.type,
    };
  };
  const kaalSarp = { a: nodes(A), k: { ...nodes(charts.k), direction: charts.k.doshas.kaalSarp.direction, birth: { date: SAMPLE_BIRTHS.k.dateLabel, time: SAMPLE_BIRTHS.k.timeLabel, place: SAMPLE_BIRTHS.k.place, lagna: charts.k.lagna.sign } } };

  // ── Child chart ───────────────────────────────────────────────────────────────
  const CH = charts.child;
  const ck = buildChildKundli(CH as unknown as Parameters<typeof buildChildKundli>[0], '2024-01-22');
  const child = {
    summary: chartSummary(SAMPLE_BIRTHS.child, CH),
    gana: GANA[CH.nakshatra.nakshatra],
    nameLetters: ck?.nameLetters.aksharas ?? [],
    sections: ck ? [ck.temperament, ck.learning, ck.talents, ck.favourablePeriods].map(s => ({ title: s.title, body: s.body })) : [],
  };

  // ── Date-only Moon sign examples (birth date without time, IST) ──────────────
  const dateOnly = (y: number, m: number, d: number) => {
    const r = calculateDateOnlyRashi(d, m, y, 'IN');
    return r ? { date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, rashis: r.rashis, nakshatras: r.nakshatras, certain: r.isCertain } : null;
  };
  const scan = (y: number, m: number, want: boolean) => {
    for (let d = 1; d <= 28; d++) { const r = dateOnly(y, m, d); if (r && r.certain === want) return r; }
    return null;
  };
  const moonSign = {
    timed: { date: SAMPLE_BIRTHS.e.dateLabel, time: SAMPLE_BIRTHS.e.timeLabel, place: SAMPLE_BIRTHS.e.place, ...(() => { const s = chartSummary(SAMPLE_BIRTHS.e, charts.e); return { rashi: s.rashi, moonDegree: s.moonDegree, nakshatra: s.nakshatra, lagna: s.lagna, sunSign: charts.e.planets.find(p => p.name === 'Sun')!.sign }; })() },
    certainDay: scan(2000, 1, true),
    changeDay: scan(2000, 1, false),
  };
  // Sun's sign-entry dates in 2027 (IST calendar day): sidereal (Vedic Sankranti) and
  // tropical (Western) — tropical = sidereal + the engine's Lahiri ayanamsa.
  const sunEntries = (tropical: boolean) => {
    const lonAt = (ms: number) => {
      const d = new Date(ms);
      const sid = getSiderealLongitude('Sun', d, 'drik');
      return (((tropical ? sid + getDrikAyanamsa(d) : sid) % 360) + 360) % 360;
    };
    const signAt = (ms: number) => Math.floor(lonAt(ms) / 30);
    const start = Date.UTC(2026, 11, 31, 18, 30), end = Date.UTC(2027, 11, 31, 18, 30); // 1 Jan – 31 Dec 2027 IST
    const out: Array<{ sign: string; date: string }> = [];
    let prev = signAt(start);
    for (let t = start + 864e5; t <= end; t += 864e5) {
      const cur = signAt(t);
      if (cur !== prev) {
        let lo = t - 864e5, hi = t;
        while (hi - lo > 60_000) { const mid = (lo + hi) / 2; if (signAt(mid) === prev) lo = mid; else hi = mid; }
        out.push({ sign: RASHI[cur], date: new Date(hi + 5.5 * 3600_000).toISOString().slice(0, 10) });
        prev = cur;
      }
    }
    return out;
  };
  const rashiByDob = { certainDay: scan(1998, 6, true), changeDay: scan(1998, 6, false), sunVedic2027: sunEntries(false), sunWestern2027: sunEntries(true) };

  // ── Gochar snapshot on the reference date (for the rashifal guides) ──────────
  const pos = grahaPositions(ref);
  const signOf = (g: string) => pos.find(p => p.planet === g)!.sign;
  const gochar = {
    signs: Object.fromEntries(['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].map(g => [g, RASHI[signOf(g)]])),
    byMoonSign: RASHI.map((name, i) => ({
      sign: name,
      jupiterHouse: ((signOf('Jupiter') - i + 12) % 12) + 1,
      saturnHouse: ((signOf('Saturn') - i + 12) % 12) + 1,
      rahuHouse: ((signOf('Rahu') - i + 12) % 12) + 1,
    })),
  };

  return {
    refDate: SAMPLE_REF_ISO.slice(0, 10), refLabel: SAMPLE_REF_LABEL,
    kundali: a, dasha, match, matchHi, nameMatch, sadeSati, manglik, kaalSarp, child, moonSign, rashiByDob, gochar,
  };
}
