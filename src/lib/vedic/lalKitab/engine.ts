/**
 * Lal Kitab engine (B18) — pure functions over a list of { planet, house } where `house` is
 * the whole-sign house counted from the Lagna (the /api/kundali `planets[].house`). All rules
 * and their sources are in ./tables.ts.
 */
import {
  LK_PLANETS, type LkPlanet, PAKKA_GHAR, EXALTED, DEBILITATED, ASPECTS, aspectedBy, inimical,
  MASNUI, RINS, type RinKey, VARSHPHAL, CYCLE_35,
} from './tables';

export interface LkInputPlanet { name: string; house: number }

export interface LkPlacement {
  planet: LkPlanet;
  house: number;
  /** House 1 is always Aries in the Lal Kitab chart, so the fixed sign index = house - 1. */
  fixedSignIndex: number;
  pakkaGhar: boolean;
  exalted: boolean;
  debilitated: boolean;
  /** Houses this planet looks at (Lal Kitab aspects). */
  aspects: number[];
  /** Planets in the houses this planet looks at. */
  sees: LkPlanet[];
  sleeping: boolean;
  /** Kaayam (settled): no inimical planet beside it and none looking at its house. */
  kaayam: boolean;
  /** Dharmi (pious) planet — Rahu/Ketu in the 4th or with the Moon; Saturn in the 11th or with Jupiter. */
  dharmi: boolean;
}

export interface LkRin { key: RinKey; causes: Array<{ planet: LkPlanet; house: number }> }
export interface LkMasnui { house: number; pair: [LkPlanet, LkPlanet]; acts: LkPlanet; quality?: 'exalted' | 'debilitated' }

export interface LkChart {
  placements: LkPlacement[];
  /** house (1-12) → planets in it */
  houses: Record<number, LkPlanet[]>;
  sleepingHouses: number[];
  rins: LkRin[];
  masnui: LkMasnui[];
  teva: {
    /** Andha teva: two or more mutually inimical planets together in the 10th house. */
    blind: boolean;
    /** Ratandha (semi-blind) teva: Sun in the 4th and Saturn in the 7th. */
    semiBlind: boolean;
    /** Dharmi teva: Jupiter and Saturn together, Saturn in the 11th, or Rahu/Ketu in the 4th or with the Moon. */
    dharmi: boolean;
    /** Nabaligh (minor) teva: the 1st, 4th, 7th and 10th hold no planet other than Mercury, Saturn, Rahu or Ketu. */
    nabaligh: boolean;
  };
}

const isLk = (n: string): n is LkPlanet => (LK_PLANETS as readonly string[]).includes(n);

export function buildLalKitabChart(input: LkInputPlanet[]): LkChart {
  const rows = input.filter(p => isLk(p.name) && p.house >= 1 && p.house <= 12) as Array<{ name: LkPlanet; house: number }>;
  const houses: Record<number, LkPlanet[]> = {};
  for (let h = 1; h <= 12; h++) houses[h] = [];
  for (const p of rows) houses[p.house].push(p.name);
  const occupied = (h: number) => houses[h].length > 0;

  const placements: LkPlacement[] = LK_PLANETS.filter(n => rows.some(r => r.name === n)).map(planet => {
    const house = rows.find(r => r.name === planet)!.house;
    const aspects = ASPECTS[house];
    const sees = aspects.flatMap(h => houses[h]);
    const pakkaGhar = PAKKA_GHAR[planet].includes(house);
    const together = houses[house].filter(o => o !== planet);
    const lookers = aspectedBy(house).flatMap(h => houses[h]);
    const kaayam = ![...together, ...lookers].some(o => inimical(planet, o));
    const dharmi =
      ((planet === 'Rahu' || planet === 'Ketu') && (house === 4 || houses[house].includes('Moon'))) ||
      (planet === 'Saturn' && (house === 11 || houses[house].includes('Jupiter')));
    return {
      planet, house, fixedSignIndex: house - 1, pakkaGhar,
      exalted: EXALTED[planet].includes(house), debilitated: DEBILITATED[planet].includes(house),
      aspects, sees,
      // AstroSage: a planet that gives sight to no other planet is sleeping; a planet in its
      // own pakka ghar is never counted as sleeping.
      sleeping: !pakkaGhar && sees.length === 0,
      kaayam, dharmi,
    };
  });

  // A house sleeps when no planet sits in it and no planet looks at it.
  const sleepingHouses: number[] = [];
  for (let h = 1; h <= 12; h++) {
    if (!occupied(h) && !aspectedBy(h).some(occupied)) sleepingHouses.push(h);
  }

  const rins: LkRin[] = RINS.map(r => ({
    key: r.key,
    causes: rows.filter(p => r.planets.includes(p.name) && r.houses.includes(p.house)).map(p => ({ planet: p.name, house: p.house })),
  })).filter(r => r.causes.length > 0);

  const masnui: LkMasnui[] = [];
  for (let h = 1; h <= 12; h++) {
    for (const m of MASNUI) {
      if (houses[h].includes(m.pair[0]) && houses[h].includes(m.pair[1])) masnui.push({ house: h, pair: m.pair, acts: m.acts, quality: m.quality });
    }
  }

  const tenth = houses[10];
  const blind = tenth.some((a, i) => tenth.slice(i + 1).some(b => inimical(a, b)));
  const semiBlind = houses[4].includes('Sun') && houses[7].includes('Saturn');
  const jupSat = Object.values(houses).some(ps => ps.includes('Jupiter') && ps.includes('Saturn'));
  const dharmi = jupSat || houses[11].includes('Saturn') ||
    houses[4].some(p => p === 'Rahu' || p === 'Ketu') ||
    Object.values(houses).some(ps => ps.includes('Moon') && (ps.includes('Rahu') || ps.includes('Ketu')));
  const nabaligh = [1, 4, 7, 10].every(h => houses[h].every(p => p === 'Mercury' || p === 'Saturn' || p === 'Rahu' || p === 'Ketu'));

  return { placements, houses, sleepingHouses, rins, masnui, teva: { blind, semiBlind, dharmi, nabaligh } };
}

/** Running year of life (1 = birth to the first birthday) on `on`, from an ISO birth date. */
export function runningYearOfLife(dobIso: string, on: Date): number {
  const [y, m, d] = dobIso.slice(0, 10).split('-').map(Number);
  let age = on.getFullYear() - y;
  if (on.getMonth() + 1 < m || (on.getMonth() + 1 === m && on.getDate() < d)) age -= 1;
  return Math.max(0, age) + 1;
}

export interface LkVarshphal {
  year: number;
  /** natal house → house for this year */
  rotation: number[];
  placements: Array<{ planet: LkPlanet; natalHouse: number; yearHouse: number }>;
}

/** Annual (Varshphal) chart for a running year of life 1–120; null outside that range. */
export function lalKitabVarshphal(input: LkInputPlanet[], year: number): LkVarshphal | null {
  if (!Number.isInteger(year) || year < 1 || year > VARSHPHAL.length) return null;
  const rotation = VARSHPHAL[year - 1];
  const placements = input.filter(p => isLk(p.name) && p.house >= 1 && p.house <= 12)
    .map(p => ({ planet: p.name as LkPlanet, natalHouse: p.house, yearHouse: rotation[p.house - 1] }));
  return { year, rotation, placements };
}

/** The planet whose period of the 35-year cycle covers a given completed age (in years, fractional ok). */
export function cyclePlanetAt(ageYears: number): { planet: LkPlanet; fromAge: number; toAge: number; round: number } {
  const a = Math.max(0, ageYears);
  const round = Math.floor(a / 35);
  let t = a - round * 35;
  let start = 0;
  for (const c of CYCLE_35) {
    if (t < start + c.years) return { planet: c.planet, fromAge: round * 35 + start, toAge: round * 35 + start + c.years, round: round + 1 };
    start += c.years;
  }
  const last = CYCLE_35[CYCLE_35.length - 1];
  return { planet: last.planet, fromAge: round * 35 + 35 - last.years, toAge: round * 35 + 35, round: round + 1 };
}

/** Completed age in fractional years (for the 35-year cycle). */
export function ageInYears(dobIso: string, on: Date): number {
  const [y, m, d] = dobIso.slice(0, 10).split('-').map(Number);
  const born = Date.UTC(y, m - 1, d);
  const now = Date.UTC(on.getFullYear(), on.getMonth(), on.getDate());
  return Math.max(0, (now - born) / (365.2425 * 86400000));
}
