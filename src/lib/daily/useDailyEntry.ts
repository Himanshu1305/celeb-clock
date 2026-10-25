/**
 * Browser loader for a daily page's content (see ./index.ts).
 *
 * Order: (1) the entry the Worker embedded in the HTML (<script id="daily-data">) —
 * identical to the injected markup, so there is no flash; (2) the precomputed month
 * JSON `/daily/<kind>/<slug>/<YYYY-MM>.json`; (3) only if that day is missing (a
 * deploy older than the 400-day window) compute it in the browser with the same
 * engine, and warn (the ops monitor separately alarms on an expiring window).
 */
import { useEffect, useState } from 'react';
import type { DailyEntry, DailyMonthFile } from './types';
import { istDateISO, monthKey } from './dates';
import { dailyJsonPath } from './registry';
import { DAILY_DATA_SCRIPT_ID } from './inject';

export type DailySource = 'embedded' | 'json' | 'computed';

export interface DailyState {
  entry: DailyEntry | null;
  source: DailySource | null;
  date: string;
}

function readEmbedded(kind: string, slug: string, date: string): DailyEntry | null {
  if (typeof document === 'undefined') return null;
  try {
    const el = document.getElementById(DAILY_DATA_SCRIPT_ID);
    if (!el?.textContent) return null;
    const data = JSON.parse(el.textContent) as { kind: string; slug: string; date: string; entry: DailyEntry };
    if (data.kind === kind && data.slug === slug && data.date === date && data.entry) return data.entry;
  } catch { /* fall through to the JSON */ }
  return null;
}

const monthCache = new Map<string, Promise<DailyMonthFile | null>>();

export function loadDailyMonth(kind: string, slug: string, month: string): Promise<DailyMonthFile | null> {
  const url = dailyJsonPath(kind, slug, month);
  let p = monthCache.get(url);
  if (!p) {
    p = fetch(url, { credentials: 'omit' })
      .then(r => (r.ok ? (r.json() as Promise<DailyMonthFile>) : null))
      .catch(() => null);
    monthCache.set(url, p);
  }
  return p;
}

/** Resolve the entry for (kind, slug, date) — JSON first, browser compute as fallback. */
export async function resolveDailyEntry(kind: string, slug: string, date: string): Promise<{ entry: DailyEntry | null; source: DailySource }> {
  const file = await loadDailyMonth(kind, slug, monthKey(date));
  const fromJson = file?.days?.[date];
  if (fromJson) return { entry: fromJson, source: 'json' };
  console.warn(`[daily] no precomputed ${kind}/${slug} for ${date} — computing in the browser`);
  try {
    const { computeDaily } = await import('./compute');
    return { entry: computeDaily(kind, date, slug), source: 'computed' };
  } catch (err) {
    console.error('[daily] browser fallback failed', err);
    return { entry: null, source: 'computed' };
  }
}

export function useDailyEntry(kind: string, slug: string | null | undefined, now: () => Date = () => new Date()): DailyState {
  const date = istDateISO(now());
  const [state, setState] = useState<DailyState>(() => {
    const embedded = slug ? readEmbedded(kind, slug, date) : null;
    return { entry: embedded, source: embedded ? 'embedded' : null, date };
  });

  useEffect(() => {
    if (!slug) return;
    if (state.entry && state.date === date && state.source === 'embedded') return;
    let alive = true;
    resolveDailyEntry(kind, slug, date).then(r => {
      if (alive) setState({ entry: r.entry, source: r.source, date });
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, slug, date]);

  return state.date === date ? state : { entry: null, source: null, date };
}
