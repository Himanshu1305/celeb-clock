/**
 * Famous people born on each date (Indian and global), generated at build time by
 * scripts/gen-celebs-by-day.mts. Static, so every date page has real names and profile links in its
 * prerendered HTML even when the live ranking service is unreachable.
 */
export type DayCeleb = { s: string; n: string };
export type DayCelebs = { india: DayCeleb[]; world: DayCeleb[] };
const BY_MONTH = import.meta.glob<Record<string, DayCelebs>>('../data/celebsByDay/*.json', { eager: true, import: 'default' });

export function celebsOn(month: number, day: number): DayCelebs {
  const mm = String(month).padStart(2, '0'), md = `${mm}-${String(day).padStart(2, '0')}`;
  return BY_MONTH[`../data/celebsByDay/${mm}.json`]?.[md] ?? { india: [], world: [] };
}

/** Indian and world lists merged, Indian first, no repeats. */
export function allCelebsOn(month: number, day: number): DayCeleb[] {
  const { india, world } = celebsOn(month, day);
  const seen = new Set<string>();
  return [...india, ...world].filter(c => (seen.has(c.s) ? false : (seen.add(c.s), true)));
}

/** Every date's lists for one month (used by the month hubs). */
export function celebsInMonth(month: number): Record<string, DayCelebs> {
  return BY_MONTH[`../data/celebsByDay/${String(month).padStart(2, '0')}.json`] ?? {};
}
