/**
 * Scan Saturn's sidereal (Lahiri) sign over a time range with the chart engine and return
 * every sign ingress, refined to one minute. Build-time / test-time only (it imports the
 * full engine); pages read the generated src/data/saturnIngresses.json instead.
 */
import { getSaturnSignIndex } from './engine/vedicEngine';

export interface SaturnIngress { utc: string; from: number; to: number }

const DAY = 864e5, MIN = 6e4;

export function saturnIngressesBetween(fromMs: number, toMs: number): { initialSign: number; ingresses: SaturnIngress[] } {
  // 2-day sampling: Saturn's shortest retrograde in-and-out of a sign 1900–2100 lasts
  // 9.5 days (see src/lib/vedic/sadeSati.ts), so no crossing is skipped.
  const STEP = 2 * DAY;
  const sign = (ms: number) => getSaturnSignIndex(new Date(ms));
  const initialSign = sign(fromMs);
  const ingresses: SaturnIngress[] = [];
  let last = initialSign, lastMs = fromMs;
  for (let t = fromMs + STEP; t <= toMs; t += STEP) {
    const s = sign(t);
    if (s !== last) {
      let a = lastMs, b = t;
      while (b - a > MIN) { const m = (a + b) / 2; if (sign(m) === last) a = m; else b = m; }
      const iso = new Date(Math.round(b / MIN) * MIN).toISOString().slice(0, 16) + 'Z';
      ingresses.push({ utc: iso, from: last, to: s });
      last = s;
    }
    lastMs = t;
  }
  return { initialSign, ingresses };
}
