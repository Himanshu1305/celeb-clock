/**
 * "What's Ahead" — real Dasha data re-presented by LIFE AREA and by TIME HORIZON
 * (Backlog-1 Item G). Client-safe and date-dependent: every window/horizon is
 * computed in the browser against `now` (Rule 13), so a prerendered page never bakes
 * in the build-day's answer.
 *
 * It introduces NO new astronomy. It reuses exactly the engine's activation-window
 * logic (a significator's Maha/Antar periods from the already-computed dashaTimeline)
 * and the engine's SIGN_LORDS house-lord mapping — mirrored here as pure data so the
 * client bundle does not import the Node-only astronomy engine. A unit test
 * cross-checks this module against the real engine (yogaTiming) so they cannot drift.
 */
import { subPeriods, type DashaSubPeriod } from './dashaDeep';

/** Sidereal sign lords (Mesha→Meena), identical to engine/sthanaBala SIGN_LORDS. */
export const SIGN_LORDS = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'] as const;

export interface MahaPeriod {
  lord: string; start: string; end: string;
  antardashas?: Array<{ lord: string; start: string; end: string }>;
}

export type WindowStatus = 'past' | 'current' | 'upcoming';
export interface AheadWindow {
  planet: string;
  level: 'maha' | 'antar';
  start: string; end: string;
  status: WindowStatus;
  withinMaha?: string;
  doubleActivation?: boolean;
}

export function houseLord(lagnaSignIndex: number, house: number): string {
  const signIdx = (((lagnaSignIndex + (house - 1)) % 12) + 12) % 12;
  return SIGN_LORDS[signIdx];
}

function statusOf(start: string, end: string, now: number): WindowStatus {
  const s = Date.parse(start), e = Date.parse(end);
  if (now >= e) return 'past';
  if (now >= s) return 'current';
  return 'upcoming';
}

/** Mirror of engine windowsForSignificators + orderWindows (current, upcoming soonest, past recent). */
export function windowsFor(timeline: MahaPeriod[] | undefined, significators: string[], nowMs: number): AheadWindow[] {
  if (!timeline?.length || !significators.length) return [];
  const sig = new Set(significators);
  const out: AheadWindow[] = [];
  for (const maha of timeline) {
    const mahaIsSig = sig.has(maha.lord);
    if (mahaIsSig) out.push({ planet: maha.lord, level: 'maha', start: maha.start, end: maha.end, status: statusOf(maha.start, maha.end, nowMs) });
    for (const antar of maha.antardashas ?? []) {
      if (!sig.has(antar.lord)) continue;
      out.push({ planet: antar.lord, level: 'antar', start: antar.start, end: antar.end, withinMaha: maha.lord, doubleActivation: mahaIsSig, status: statusOf(antar.start, antar.end, nowMs) });
    }
  }
  const rank = (w: AheadWindow) => (w.status === 'current' ? 0 : w.status === 'upcoming' ? 1 : 2);
  return out.sort((a, b) => {
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    if (a.status === 'past') return Date.parse(b.start) - Date.parse(a.start); // recent first
    return Date.parse(a.start) - Date.parse(b.start); // soonest first
  });
}

export interface LifeArea {
  key: 'career' | 'relationships' | 'home' | 'health' | 'travel';
  label: string;
  significators: string[];
  note: string;
}

/** The five life areas, with significators drawn from the chart's real house lords + classical karakas. */
export function lifeAreas(lagnaSignIndex: number, planetsInHouse: (h: number) => string[]): LifeArea[] {
  const uniq = (a: string[]) => [...new Set(a.filter(Boolean))];
  return [
    { key: 'career', label: 'Career & work', significators: uniq([houseLord(lagnaSignIndex, 10), ...planetsInHouse(10)]),
      note: 'Career timing follows the periods of your 10th-house lord (work & standing) and any planet sitting in the 10th.' },
    { key: 'relationships', label: 'Relationships', significators: uniq([houseLord(lagnaSignIndex, 7), 'Venus', 'Jupiter']),
      note: 'Relationship-significant periods follow your 7th-house lord with Venus and Jupiter (the classical, gender-neutral relationship significators).' },
    { key: 'home', label: 'Home & property', significators: uniq([houseLord(lagnaSignIndex, 4), ...planetsInHouse(4)]),
      note: 'Home & property timing follows your 4th-house lord (home, land, comfort) and any planet in the 4th.' },
    { key: 'health', label: 'Health & energy', significators: uniq([houseLord(lagnaSignIndex, 1), houseLord(lagnaSignIndex, 6), 'Sun']),
      note: 'Vitality periods follow your 1st-house lord (the body) and 6th-house lord (health matters), with the Sun (vitality karaka).' },
    { key: 'travel', label: 'Travel & change of place', significators: uniq([houseLord(lagnaSignIndex, 3), houseLord(lagnaSignIndex, 9), houseLord(lagnaSignIndex, 12)]),
      note: 'Travel periods follow the lords of the 3rd (short journeys), 9th (long journeys) and 12th (distant/foreign places).' },
  ];
}

export interface HorizonChain {
  label: string;
  at: string;               // ISO of the point being described
  maha: string | null;
  antar: string | null;
  pratyantar: string | null;
  sookshma: string | null;
}

function find(periods: Array<{ lord: string; start: string; end: string }>, atMs: number) {
  return periods.find(p => atMs >= Date.parse(p.start) && atMs < Date.parse(p.end)) || null;
}

export type ActiveChain = Pick<HorizonChain, 'maha' | 'antar' | 'pratyantar' | 'sookshma'>;

/** The active Maha→Antar→Pratyantar→Sookshma chain at a given instant (deeper levels via subPeriods). */
export function activeChainAt(timeline: MahaPeriod[], atMs: number): ActiveChain {
  const maha = find(timeline, atMs);
  if (!maha) return { maha: null, antar: null, pratyantar: null, sookshma: null };
  const antar = find(maha.antardashas ?? [], atMs);
  let pratyantar: DashaSubPeriod | null = null, sookshma: DashaSubPeriod | null = null;
  if (antar) {
    pratyantar = find(subPeriods(antar.lord, antar.start, antar.end), atMs);
    if (pratyantar) sookshma = find(subPeriods(pratyantar.lord, pratyantar.start, pratyantar.end), atMs);
  }
  return { maha: maha.lord, antar: antar?.lord ?? null, pratyantar: pratyantar?.lord ?? null, sookshma: sookshma?.lord ?? null };
}

/** Time-horizon overview: now, +1 month, +6 months, +1 year — plus the lifetime Maha sequence. */
export function timeHorizons(timeline: MahaPeriod[], nowMs: number): { horizons: HorizonChain[]; lifetime: MahaPeriod[] } {
  const DAY = 86_400_000;
  const points: Array<{ label: string; ms: number }> = [
    { label: 'Right now', ms: nowMs },
    { label: 'In 1 month', ms: nowMs + 30 * DAY },
    { label: 'In 6 months', ms: nowMs + 182 * DAY },
    { label: 'In 1 year', ms: nowMs + 365 * DAY },
  ];
  const horizons = points.map(p => ({ label: p.label, at: new Date(p.ms).toISOString(), ...activeChainAt(timeline, p.ms) }));
  return { horizons, lifetime: timeline };
}
