// Kundali Matching endpoint (Part I, 2.1-2.6). Computes BOTH people's charts from
// their real date+time+place (Part 1 fix), runs the full 8-Koota Guna Milan
// (matchmaking.ts), and — reusing the D-Fix3 timing engine — the marriage-timing
// windows for each person plus where the two people's favourable windows OVERLAP
// (the differentiator). Fully deterministic: no LLM, so every Koota score and date
// is exact by construction (accuracy guaranteed, unlike the LLM readings).

import { calculateBirthChart } from '../src/lib/vedic/calculateBirthChart.js';
import { birthRangeError } from './_birthParams.js';
import { calculateGunaMilan, type PersonInput } from '../src/lib/vedic/matchmaking.js';
import { calculatePorutham } from '../src/lib/vedic/porutham.js';
import { buildMatchSynthesis } from '../src/lib/vedic/matchSynthesis.js';
import { categoryTiming, describeWindow, formatWindowRange, type ActivationWindow } from '../src/lib/vedic/yogaTiming.js';
import { RASHI_NAMES } from '../src/lib/vedic/engine/vedicEngine.js';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
}

function personInput(chart): PersonInput {
  return {
    nakshatra: chart.nakshatra.nakshatra,
    pada: chart.nakshatra.pada,
    rashiIndex: Math.max(0, RASHI_NAMES.indexOf(chart.rashi)),
  };
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
  return { year: n('y'), month: n('m'), day: n('d'), hour: n('h') ?? 12, minute: n('min') ?? 0, latitude: n('lat') ?? 28.6139, longitude: n('lon') ?? 77.209, timezoneOffset: n('tz') ?? 5.5 };
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
  try {
    const now = new Date();
    const [chartA, chartB] = await Promise.all([
      calculateBirthChart({ year: A.year, month: A.month, day: A.day, hour: A.hour, minute: A.minute, latitude: A.latitude, longitude: A.longitude, timezoneOffset: A.timezoneOffset }, { refDate: now }),
      calculateBirthChart({ year: B.year, month: B.month, day: B.day, hour: B.hour, minute: B.minute, latitude: B.latitude, longitude: B.longitude, timezoneOffset: B.timezoneOffset }, { refDate: now }),
    ]);

    const piA = personInput(chartA), piB = personInput(chartB);
    const gunaMilan = calculateGunaMilan(piA, piB);
    // 10-porutham (South-Indian) view alongside the 36-guna Ashtakoota.
    const porutham = calculatePorutham({ nakshatra: piA.nakshatra, rashiIndex: piA.rashiIndex }, { nakshatra: piB.nakshatra, rashiIndex: piB.rashiIndex });
    // Manglik (Mangal Dosha) check inside matching — classical mutual cancellation.
    const mdA = chartA.doshas?.mangalDosha, mdB = chartB.doshas?.mangalDosha;
    const aM = !!mdA?.hasDosha, bM = !!mdB?.hasDosha;
    const manglik = {
      aHasDosha: aM, bHasDosha: bM,
      aSeverity: mdA?.severityLabel ?? null, bSeverity: mdB?.severityLabel ?? null,
      status: (!aM && !bM) ? 'clear' : (aM && bM) ? 'mutual' : 'one-sided',
      note: (!aM && !bM)
        ? 'Neither chart shows Manglik (Mangal) Dosha, so it is not a factor for this match.'
        : (aM && bM)
          ? 'Both partners show Manglik Dosha. Classically, when both carry it the dosha is considered mutually cancelled — a traditionally reassuring combination, not a concern.'
          : `One partner shows Manglik Dosha (${aM ? 'Person A' : 'Person B'}${(aM ? mdA?.severityLabel : mdB?.severityLabel) ? `, ${aM ? mdA?.severityLabel : mdB?.severityLabel}` : ''}) and the other does not. The tradition reads a one-sided Manglik as an area to be mindful of; many classical cancellations exist and it is held calmly, never as a barrier.`,
    };

    // Marriage-timing windows from EACH chart (7th lord + Venus + Jupiter), + overlaps.
    const tA = categoryTiming(chartA, 'marriage', now);
    const tB = categoryTiming(chartB, 'marriage', now);
    const upA = tA.windows.filter(w => w.status !== 'past').slice(0, 4);
    const upB = tB.windows.filter(w => w.status !== 'past').slice(0, 4);
    const timing = {
      personA: { significators: tA.significators, windows: upA.map(w => ({ ...w, describe: describeWindow(w) })) },
      personB: { significators: tB.significators, windows: upB.map(w => ({ ...w, describe: describeWindow(w) })) },
      overlaps: overlaps(upA, upB),
      note: 'Marriage-timing windows are the classical activation periods (7th-house lord, Venus and Jupiter) from each person’s Vimshottari Dasha, computed as real date ranges — a likelihood window, never a guaranteed date. Overlaps are periods when BOTH partners are in a favourable window.',
    };

    // Narrative synthesis (Part M) — deterministic, built from the same result.
    // Wrapped so any failure degrades to the factual report, never a broken page.
    let synthesis = null;
    try { synthesis = buildMatchSynthesis({ gunaMilan, overlaps: timing.overlaps }); }
    catch (e) { console.debug('[kundali-match] synthesis fallback:', e); }

    return json({
      gunaMilan,
      porutham,
      manglik,
      synthesis,
      timing,
      people: {
        a: { lagna: chartA.lagna.sign, rashi: chartA.rashi, nakshatra: chartA.nakshatra.nakshatra, pada: chartA.nakshatra.pada },
        b: { lagna: chartB.lagna.sign, rashi: chartB.rashi, nakshatra: chartB.nakshatra.nakshatra, pada: chartB.nakshatra.pada },
      },
      _cache: 'miss',
    });
  } catch (e) {
    return json({ error: 'match-failed', detail: String(e?.message || e) }, 500);
  }
}

export const GET = handler;
