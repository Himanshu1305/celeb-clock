// Chart-event notifications endpoint (Part P, Part 2). Given birth params, computes
// the chart and returns the meaningful UPCOMING events (Dasha changes, active Sade
// Sati, upcoming favourable windows) via the deterministic detectChartEvents engine.
//
// This is the OPPORTUNISTIC / MANUALLY-triggerable delivery point deliberately used
// INSTEAD of a Cloudflare cron job — the schedules deploy is broken in this
// environment (400 Bad Request; see docs/part-p-flags.md), so a background daily job
// is not reliable. The client calls this when an opted-in user visits, and can also
// be hit by an external scheduler later to drive email. Fully deterministic (no LLM).

import { calculateBirthChart } from '../src/lib/vedic/calculateBirthChart.js';
import { categoryTiming, ageInYears, ADULT_TIMING_AGE } from '../src/lib/vedic/yogaTiming.js';
import { detectChartEvents } from '../src/lib/vedic/notificationTriggers.js';
import { resolveRequestBirthTz } from './_birthParams.js';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

function num(sp, k) { const v = sp.get(k); return v === null || v === '' ? undefined : Number(v); }

async function handler(request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const { searchParams } = new URL(request.url, 'http://localhost');
  const y = num(searchParams, 'y'), m = num(searchParams, 'm'), d = num(searchParams, 'd');
  if (![y, m, d].every(Number.isFinite)) return json({ error: 'Missing birth date' }, 400);

  const h = num(searchParams, 'h') ?? 12, min = num(searchParams, 'min') ?? 0;
  const lat = num(searchParams, 'lat') ?? 28.6139, lon = num(searchParams, 'lon') ?? 77.209;
  // fix-timezone-accuracy: offset from the birthplace + date via the shared resolver.
  const btz = resolveRequestBirthTz(k => searchParams.get(k), { y, m, d, h, min, lat, lon });
  if ('error' in btz) return json({ error: btz.error }, 400);

  try {
    const now = new Date();
    const chart: any = await calculateBirthChart({
      year: y, month: m, day: d, hour: h, minute: min, latitude: lat, longitude: lon,
      timezoneOffset: btz.tz,
    }, { refDate: now });

    // Upcoming favourable windows: the soonest still-future window per life category.
    const upcomingWindows: Array<{ label: string; planet: string; start: string; end: string }> = [];
    // Audit K3: no "marriage/career window opens soon" alerts for anyone under 18.
    const birthUTC = new Date(Date.UTC(y, m - 1, d, h, min) - btz.tz * 3600_000);
    const minor = ageInYears(birthUTC, now, btz.tz) < ADULT_TIMING_AGE;
    // Marital status (optional profile field): a married user's Venus / 7th-lord window
    // is announced as a PARTNERSHIP window, never a "marriage window".
    const married = searchParams.get('ms') === 'married';
    const cats = ([['career', 'Career'], ['marriage', married ? 'Partnership' : 'Marriage'], ['wealth', 'Wealth']] as const).filter(([c]) => !minor || c === 'wealth');
    for (const [cat, label] of cats) {
      try {
        const t = categoryTiming(chart, cat, now);
        const next = (t.windows || []).find((w: any) => w.status === 'upcoming');
        if (next) upcomingWindows.push({ label, planet: next.planet, start: next.start, end: next.end });
      } catch { /* a category may not apply — skip it */ }
    }

    const cd = chart.currentDasha;
    const events = detectChartEvents({
      now,
      currentDasha: cd ? { mahadasha: cd.mahadasha, mahadasha_end: cd.mahadasha_end, antardasha: cd.antardasha, antardasha_end: cd.antardasha_end } : null,
      sadeSati: chart.doshas?.sadeSati ? { active: chart.doshas.sadeSati.active, phase: chart.doshas.sadeSati.phase } : null,
      upcomingWindows,
    });

    return json({ events, checkedAt: now.toISOString() });
  } catch (e) {
    return json({ error: 'chart-events-failed', detail: String(e?.message || e) }, 500);
  }
}

export const GET = handler;
