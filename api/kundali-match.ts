// Kundali Matching endpoint (Part I, 2.1-2.6). Computes BOTH people's charts from
// their real date+time+place (Part 1 fix), runs the full 8-Koota Guna Milan
// (matchmaking.ts), and — reusing the D-Fix3 timing engine — the marriage-timing
// windows for each person plus where the two people's favourable windows OVERLAP
// (the differentiator). Fully deterministic: no LLM, so every Koota score and date
// is exact by construction (accuracy guaranteed, unlike the LLM readings).

import { calculateBirthChart } from '../src/lib/vedic/calculateBirthChart.js';
import { birthRangeError, resolveRequestBirthTz } from './_birthParams.js';
import { METHOD_LINE } from '../src/lib/timezone/birthTimezone.js';
import { chartBasisFromResult } from '../src/lib/vedic/chartBasis.js';
import { calculateGunaMilan, type PersonInput } from '../src/lib/vedic/matchmaking.js';
import { assessManglik, MANGLIK_CONVENTION, type ManglikAssessment } from '../src/lib/vedic/manglik.js';
import { calculatePorutham } from '../src/lib/vedic/porutham.js';
import { buildMatchSynthesis } from '../src/lib/vedic/matchSynthesis.js';
import { categoryTiming, describeWindow, formatWindowRange, type ActivationWindow } from '../src/lib/vedic/yogaTiming.js';
import { RASHI_NAMES } from '../src/lib/vedic/engine/vedicEngine.js';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
}

function personInput(chart): PersonInput {
  const moon = (chart.planets || []).find(p => p.name === 'Moon');
  return {
    nakshatra: chart.nakshatra.nakshatra,
    pada: chart.nakshatra.pada,
    rashiIndex: Math.max(0, RASHI_NAMES.indexOf(chart.rashi)),
    // Real Moon longitude → exact Vashya split for Sagittarius / Capricorn at 15°.
    moonLongitude: typeof moon?.longitude === 'number' ? moon.longitude : undefined,
  };
}

/** Same Manglik assessment as /manglik (Lagna + Moon, houses 1/4/7/8/12). */
function manglikOf(chart): ManglikAssessment {
  const sign = (n: string) => Math.floor((((chart.planets || []).find(p => p.name === n)?.longitude ?? 0) % 360) / 30);
  return assessManglik({
    lagnaSignIndex: chart.lagna.rashiIndex,
    moonSignIndex: sign('Moon'),
    marsSignIndex: sign('Mars'),
    jupiterSignIndex: sign('Jupiter'),
    venusSignIndex: sign('Venus'),
  });
}

/** Whole years of age on `now` from a Y/M/D birth date. */
function ageOn(p, now: Date): number {
  let age = now.getUTCFullYear() - p.year;
  const m = now.getUTCMonth() + 1, d = now.getUTCDate();
  if (m < p.month || (m === p.month && d < p.day)) age--;
  return age;
}

/** Intersect two lists of upcoming windows → the ranges where BOTH are favourable. */
function overlaps(aw: ActivationWindow[], bw: ActivationWindow[]) {
  const out: Array<{ start: string; end: string; range: string; aPlanet: string; bPlanet: string }> = [];
  for (const a of aw) {
    for (const b of bw) {
      const s = Math.max(new Date(a.start).getTime(), new Date(b.start).getTime());
      const e = Math.min(new Date(a.end).getTime(), new Date(b.end).getTime());
      if (s < e) {
        const start = new Date(s).toISOString(), end = new Date(e).toISOString();
        out.push({ start, end, range: formatWindowRange({ start, end } as ActivationWindow), aPlanet: a.planet, bPlanet: b.planet });
      }
    }
  }
  return out.sort((x, y) => new Date(x.start).getTime() - new Date(y.start).getTime()).slice(0, 4);
}

function parsePerson(sp, suffix) {
  const n = k => { const v = sp.get(k + suffix); return v === null || v === '' ? undefined : Number(v); };
  // `timezoneOffset` here is only the LEGACY client value (range-checked for a clean 400);
  // the offset actually used is decided by resolveRequestBirthTz() in the handler.
  return { year: n('y'), month: n('m'), day: n('d'), hour: n('h') ?? 12, minute: n('min') ?? 0, latitude: n('lat') ?? 28.6139, longitude: n('lon') ?? 77.209, timezoneOffset: n('tz') ?? 5.5 };
}

/** Per-person transparency block: zone/offset applied + Moon + Lagna + boundary notes. */
function personSummary(chart, birthTimezone) {
  return chartBasisFromResult(chart, birthTimezone);
}

async function handler(request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const { searchParams } = new URL(request.url, 'http://localhost');
  const A = parsePerson(searchParams, 'A'), B = parsePerson(searchParams, 'B');
  if (![A.year, A.month, A.day, B.year, B.month, B.day].every(Number.isFinite)) {
    return json({ error: 'Missing birth details for one or both people' }, 400);
  }
  // Part T: reject out-of-range input up front with a clean 400 (was a 500).
  const rangeErrAB = birthRangeError({ m: A.month, d: A.day, h: A.hour, min: A.minute, lat: A.latitude, lon: A.longitude, tz: A.timezoneOffset })
    || birthRangeError({ m: B.month, d: B.day, h: B.hour, min: B.minute, lat: B.latitude, lon: B.longitude, tz: B.timezoneOffset });
  if (rangeErrAB) return json({ error: rangeErrAB }, 400);
  // fix-timezone-accuracy: each person's offset from their own birthplace + date.
  const get = k => searchParams.get(k);
  const tzA = resolveRequestBirthTz(get, { y: A.year, m: A.month, d: A.day, h: A.hour, min: A.minute, lat: A.latitude, lon: A.longitude }, 'A');
  const tzB = resolveRequestBirthTz(get, { y: B.year, m: B.month, d: B.day, h: B.hour, min: B.minute, lat: B.latitude, lon: B.longitude }, 'B');
  if ('error' in tzA) return json({ error: tzA.error }, 400);
  if ('error' in tzB) return json({ error: tzB.error }, 400);
  // M2: explicit groom (boy) / bride (girl). `groom=A` (default) or `groom=B`.
  const groom = (searchParams.get('groom') || 'A').toUpperCase() === 'B' ? 'B' : 'A';
  const now = new Date();
  // M1: no future birth dates.
  const birthMs = (p) => Date.UTC(p.year, p.month - 1, p.day);
  if (birthMs(A) > now.getTime() || birthMs(B) > now.getTime()) {
    return json({ error: 'Birth date cannot be in the future.' }, 400);
  }
  try {
    const [chartA, chartB] = await Promise.all([
      calculateBirthChart({ year: A.year, month: A.month, day: A.day, hour: A.hour, minute: A.minute, latitude: A.latitude, longitude: A.longitude, timezoneOffset: tzA.tz }, { refDate: now }),
      calculateBirthChart({ year: B.year, month: B.month, day: B.day, hour: B.hour, minute: B.minute, latitude: B.latitude, longitude: B.longitude, timezoneOffset: tzB.tz }, { refDate: now }),
    ]);

    const piA = personInput(chartA), piB = personInput(chartB);
    // Ashtakoota is read groom → bride; Porutham takes (bride, groom).
    const [gPI, bPI] = groom === 'A' ? [piA, piB] : [piB, piA];
    const labels = groom === 'A' ? { groom: 'Person A', bride: 'Person B' } : { groom: 'Person B', bride: 'Person A' };
    const gunaMilan = calculateGunaMilan(gPI, bPI, labels);
    // 10-porutham (South-Indian) view alongside the 36-guna Ashtakoota.
    const porutham = calculatePorutham({ nakshatra: bPI.nakshatra, rashiIndex: bPI.rashiIndex }, { nakshatra: gPI.nakshatra, rashiIndex: gPI.rashiIndex });
    // M8: the same birth details entered twice.
    const samePerson = A.year === B.year && A.month === B.month && A.day === B.day && A.hour === B.hour && A.minute === B.minute
      && Math.abs(A.latitude - B.latitude) < 0.01 && Math.abs(A.longitude - B.longitude) < 0.01;
    // M1: marriage text only for adults.
    const ageA = ageOn(A, now), ageB = ageOn(B, now);
    const minor = ageA < 18 || ageB < 18;

    // Manglik (M3/D1): the SAME assessment as /manglik, with its cancellations applied.
    const mA = manglikOf(chartA), mB = manglikOf(chartB);
    const aM = mA.hasDosha, bM = mB.hasDosha;
    const aEff = aM && !mA.cancelled, bEff = bM && !mB.cancelled; // after cancellations
    const ord = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;
    const describe = (who: string, m: ManglikAssessment) =>
      `${who}: ${m.hasDosha ? `Manglik (${m.level})` : 'not Manglik'} — from the Lagna, Mars is in the ${ord(m.fromLagna.house)} house (${m.fromLagna.present ? 'counts' : 'does not count'}); from the Moon, the ${ord(m.fromMoon.house)} (${m.fromMoon.present ? 'counts' : 'does not count'})${m.cancelled ? `; classically cancelled: ${m.cancellations.join('; ')}` : ''}.`;
    let status: 'clear' | 'mutual' | 'cancelled' | 'one-sided';
    let note: string;
    if (!aM && !bM) {
      status = 'clear';
      note = 'Neither chart shows Manglik (Mangal) Dosha, so it is not a factor for this match.';
    } else if (aM && bM) {
      status = 'mutual';
      note = 'Both partners show Manglik Dosha. Classically, when both carry it the dosha is considered mutually cancelled — a traditionally reassuring combination, not a concern.';
    } else if (!aEff && !bEff) {
      status = 'cancelled';
      note = `${aM ? 'Person A' : 'Person B'} shows Manglik Dosha, but a classical cancellation applies (${(aM ? mA : mB).cancellations.join('; ')}), so it is not treated as a concern for this match.`;
    } else {
      status = 'one-sided';
      note = `One partner shows Manglik Dosha (${aM ? 'Person A' : 'Person B'}, ${(aM ? mA : mB).level}) and the other does not, and none of the classical cancellations listed on the Manglik page applies. The tradition reads a one-sided Manglik as an area to be mindful of; it is held calmly, never as a barrier.`;
    }
    const manglik = {
      aHasDosha: aM, bHasDosha: bM,
      aSeverity: aM ? mA.level : null, bSeverity: bM ? mB.level : null,
      a: mA, b: mB,
      checks: [describe('Person A', mA), describe('Person B', mB)],
      convention: MANGLIK_CONVENTION,
      status,
      note,
    };

    // Marriage-timing windows from EACH chart (7th lord + Venus + Jupiter), + overlaps.
    const tA = categoryTiming(chartA, 'marriage', now);
    const tB = categoryTiming(chartB, 'marriage', now);
    const upA = tA.windows.filter(w => w.status !== 'past').slice(0, 4);
    const upB = tB.windows.filter(w => w.status !== 'past').slice(0, 4);
    const timing = minor
      ? {
          personA: { significators: tA.significators, windows: [] },
          personB: { significators: tB.significators, windows: [] },
          overlaps: [],
          note: 'Marriage-timing windows are shown only when both people are 18 or older.',
        }
      : {
          personA: { significators: tA.significators, windows: upA.map(w => ({ ...w, describe: describeWindow(w) })) },
          personB: { significators: tB.significators, windows: upB.map(w => ({ ...w, describe: describeWindow(w) })) },
          overlaps: overlaps(upA, upB),
          note: 'Marriage-timing windows are the classical activation periods (7th-house lord, Venus and Jupiter) from each person’s Vimshottari Dasha, computed as real date ranges — a likelihood window, never a guaranteed date. Overlaps are periods when BOTH partners are in a favourable window.',
        };

    // Narrative synthesis (Part M) — deterministic, built from the same result.
    // Wrapped so any failure degrades to the factual report, never a broken page.
    let synthesis = null;
    try { synthesis = buildMatchSynthesis({ gunaMilan, overlaps: timing.overlaps, minor }); }
    catch (e) { console.debug('[kundali-match] synthesis fallback:', e); }

    return json({
      gunaMilan,
      groom,
      warnings: {
        samePerson,
        minor,
        ...(samePerson ? { samePersonNote: 'Both sets of birth details are identical — this looks like the same person entered twice, so the score below is not a real match.' } : {}),
        ...(minor ? { minorNote: 'One or both people are under 18. Kundali matching for marriage is meant for adults, so marriage-timing guidance is not shown.' } : {}),
      },
      porutham,
      manglik,
      synthesis,
      timing,
      people: {
        a: personSummary(chartA, tzA.birthTimezone),
        b: personSummary(chartB, tzB.birthTimezone),
      },
      method: METHOD_LINE,
      _cache: 'miss',
    });
  } catch (e) {
    return json({ error: 'match-failed', detail: String(e?.message || e) }, 500);
  }
}

export const GET = handler;
