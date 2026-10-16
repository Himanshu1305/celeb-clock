/**
 * "Birth data used" summary (fix-timezone-accuracy) — what every Kundali, Matching and
 * report result shows so the user can verify the inputs: zone + UTC offset applied,
 * Moon rashi / nakshatra / pada / degree, Lagna sign / degree, and boundary warnings.
 * Shared by the API (from a BirthChartResult) and the browser (from legacy chart JSON).
 */
import { boundaryNote, METHOD_LINE, type BirthTimezone } from '../timezone/birthTimezone';

export interface ChartBasis {
  timezone: string;
  utcOffsetHours: number;
  utcOffsetLabel: string;
  utcISO: string;
  timezoneSource: 'coordinates' | 'manual';
  rashi: string;
  nakshatra: string;
  pada: number;
  /** Sidereal longitude 0-360 and the degree within the sign. */
  moonLongitude: number | null;
  moonDegreeInSign: number | null;
  lagna: string;
  lagnaLongitude: number | null;
  lagnaDegree: number | null;
  /** Boundary + DST-changeover notes, ready to display. */
  notes: string[];
  method: string;
}

const r2 = (x: number) => Math.round(x * 100) / 100;

export function buildChartBasis(p: {
  birthTimezone: BirthTimezone;
  rashi: string; nakshatra: string; pada: number; lagna: string;
  moonLongitude: number | null | undefined; lagnaLongitude: number | null | undefined;
}): ChartBasis {
  const moon = typeof p.moonLongitude === 'number' && Number.isFinite(p.moonLongitude) ? p.moonLongitude : null;
  const lag = typeof p.lagnaLongitude === 'number' && Number.isFinite(p.lagnaLongitude) ? p.lagnaLongitude : null;
  const notes = [
    moon != null ? boundaryNote('Moon', moon) : null,
    lag != null ? boundaryNote('Lagna', lag) : null,
    p.birthTimezone.note,
  ].filter((n): n is string => !!n);
  return {
    timezone: p.birthTimezone.timezone,
    utcOffsetHours: p.birthTimezone.utcOffsetHours,
    utcOffsetLabel: p.birthTimezone.utcOffsetLabel,
    utcISO: p.birthTimezone.utcISO,
    timezoneSource: p.birthTimezone.source,
    rashi: p.rashi, nakshatra: p.nakshatra, pada: p.pada, lagna: p.lagna,
    moonLongitude: moon != null ? r2(moon) : null,
    moonDegreeInSign: moon != null ? r2(moon % 30) : null,
    lagnaLongitude: lag != null ? r2(lag) : null,
    lagnaDegree: lag != null ? r2(lag % 30) : null,
    notes,
    method: METHOD_LINE,
  };
}

/** From the engine's BirthChartResult (server side). */
export function chartBasisFromResult(chart: {
  rashi: string; nakshatra: { nakshatra: string; pada: number };
  lagna: { sign: string; rashiIndex: number; degrees: number };
  planets: Array<{ name: string; longitude: number }>;
}, birthTimezone: BirthTimezone): ChartBasis {
  const moon = chart.planets.find(x => x.name === 'Moon');
  return buildChartBasis({
    birthTimezone, rashi: chart.rashi, nakshatra: chart.nakshatra.nakshatra, pada: chart.nakshatra.pada,
    lagna: chart.lagna.sign, moonLongitude: moon?.longitude,
    // lagna.degrees is rounded to 0.01° by the engine; good enough for display + 1° test.
    lagnaLongitude: chart.lagna.rashiIndex * 30 + chart.lagna.degrees,
  });
}
