/**
 * Batch 10 — engine side of the "Planets today" and "Moon phase" daily pages: compute the
 * compact per-day data (./skyTemplate.ts turns it into text). Used by the build precompute
 * (scripts/gen-daily.mts — data kinds 'planet-day' and 'moon-day', slug 'all') and by the
 * browser for other dates (the Moon-phase calculator).
 */
import { istInstant, addDaysISO } from '../dates';
import { GRAHAS, grahaPositions, moonPhase, nextSignChange, speedAt } from '../../vedic/sky';
import type { MoonDayData, PlanetDayData } from './skyTemplate';

const r4 = (x: number) => Math.round(x * 1e4) / 1e4;
const minOf = (d: Date) => Math.round(d.getTime() / 60000);

/** Positions at 12:00 noon IST of an India date, and each graha's next sign change. */
export function computePlanetDayData(date: string): PlanetDayData {
  const at = istInstant(date, 12, 0);
  const pos = grahaPositions(at);
  const x = GRAHAS.map(g => {
    if (g === 'Ketu') return null; // filled from Rahu below
    const n = nextSignChange(g, at);
    if (!n) return null;
    // Clock time only where the planet moves fast enough at the change for the minute to
    // be meaningful (≥ 0.5°/day; Swiss Ephemeris check within 5 min); slow movers (Jupiter, Saturn), planets near a station
    // and the mean nodes show the date only.
    const fast = g !== 'Rahu' && Math.abs(speedAt(g, n.at)) >= 0.5;
    return [minOf(n.at), n.to, fast ? 1 : 0] as [number, number, number];
  });
  const rahu = x[7];
  x[8] = rahu ? [rahu[0], (rahu[1] + 6) % 12, 0] : null;
  return { p: pos.map(q => [r4(q.lon), r4(q.speed)] as [number, number]), x };
}

/** Moon phase at 12:00 noon IST of an India date (principal phase if one falls in that IST day). */
export function computeMoonDayData(date: string): MoonDayData {
  const at = istInstant(date, 12, 0);
  const m = moonPhase(at, [istInstant(date, 0, 0), istInstant(addDaysISO(date, 1), 0, 0)]);
  const d: MoonDayData = {
    e: Math.round(m.elongation * 1000) / 1000,
    i: r4(m.illumination),
    a: Math.round(m.ageDays * 100) / 100,
    nn: minOf(m.nextNew), nf: minOf(m.nextFull),
  };
  if (m.principalToday) d.pt = [['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'].indexOf(m.principalToday.name), minOf(m.principalToday.at)];
  return d;
}
