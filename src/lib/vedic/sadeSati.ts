/**
 * Sade Sati & Dhaiya cycle calculator (Part I.10).
 *
 * Reuses the validated engine: the phase logic matches the chart's already-validated
 * sadeSati output (Saturn transiting the 12th/1st/2nd sign from the natal Moon =
 * the 7.5-year Sade Sati; 4th/8th = the 2.5-year Dhaiya / small Panoti). The only
 * new work is turning "current status" into real START/END DATES, done by scanning
 * Saturn's (validated) transit sign over time — no new astronomy.
 *
 * `saturnSignAt` is injected so this is unit-testable without the ephemeris.
 */
const DAY = 864e5;
const YEAR = 365.25 * DAY;

export type SaturnSignFn = (d: Date) => number; // 0-11 sidereal sign index

export interface SadeSatiCycle { start: string; end: string; }
export interface SadeSatiReport {
  moonSign: number;                       // 0-11
  active: boolean;
  phase: 'Rising (12th from Moon)' | 'Peak (on Moon sign)' | 'Setting (2nd from Moon)' | null;
  currentCycle: SadeSatiCycle | null;     // the ongoing 7.5yr cycle (if active)
  nextCycle: SadeSatiCycle | null;        // the next upcoming 7.5yr cycle
  previousCycle: SadeSatiCycle | null;    // the most-recent ended cycle (Part X narrative)
  methodology: string;                    // plain-language "what we computed" note (Item 2)
  dhaiya: { active: boolean; type: 'Kantaka (4th from Moon)' | 'Ashtama (8th from Moon)' | null; currentEnd: string | null };
}

// Binary-refine the exact ingress date between two samples whose signs differ.
function refineBoundary(loMs: number, hiMs: number, saturnSignAt: SaturnSignFn): Date {
  const target = saturnSignAt(new Date(hiMs));
  let a = loMs, b = hiMs;
  while (b - a > DAY) { const mid = (a + b) / 2; if (saturnSignAt(new Date(mid)) === target) b = mid; else a = mid; }
  return new Date(b);
}

/** All Saturn sign-ingress events across [from, to], refined to ~1 day. */
function ingressEvents(from: number, to: number, saturnSignAt: SaturnSignFn): Array<{ date: number; sign: number }> {
  const STEP = 15 * DAY;
  const events: Array<{ date: number; sign: number }> = [];
  let lastSign = saturnSignAt(new Date(from));
  let lastMs = from;
  for (let t = from + STEP; t <= to; t += STEP) {
    const s = saturnSignAt(new Date(t));
    if (s !== lastSign) { events.push({ date: refineBoundary(lastMs, t, saturnSignAt).getTime(), sign: s }); lastSign = s; }
    lastMs = t;
  }
  return events;
}

export function computeSadeSati(moonSign: number, now: Date, saturnSignAt: SaturnSignFn): SadeSatiReport {
  const s12 = (moonSign + 11) % 12, s1 = moonSign, s2 = (moonSign + 1) % 12, s3 = (moonSign + 2) % 12;
  const s4 = (moonSign + 3) % 12, s8 = (moonSign + 7) % 12;
  const cur = saturnSignAt(now);

  const phase: SadeSatiReport['phase'] =
    cur === s12 ? 'Rising (12th from Moon)' : cur === s1 ? 'Peak (on Moon sign)' : cur === s2 ? 'Setting (2nd from Moon)' : null;
  const active = phase !== null;

  // Scan a ±40-year window and derive each Sade Sati cycle (enter s12 → enter s3).
  const events = ingressEvents(now.getTime() - 40 * YEAR, now.getTime() + 40 * YEAR, saturnSignAt);
  const cycles: SadeSatiCycle[] = [];
  for (let i = 0; i < events.length; i++) {
    if (events[i].sign !== s12) continue;
    const end = events.find(e => e.date > events[i].date && e.sign === s3);
    if (end) cycles.push({ start: new Date(events[i].date).toISOString(), end: new Date(end.date).toISOString() });
  }
  const nowMs = now.getTime();
  const currentCycle = cycles.find(c => new Date(c.start).getTime() <= nowMs && nowMs < new Date(c.end).getTime()) || null;
  const nextCycle = cycles.find(c => new Date(c.start).getTime() > nowMs) || null;
  // Part X: the most-recent already-ENDED cycle (for the approved inactive-case narrative
  // "your last Sade Sati ran from …"). Derived from the same ±40yr scan — no new math.
  const previousCycle = [...cycles].reverse().find(c => new Date(c.end).getTime() <= nowMs) || null;

  // Dhaiya (2.5yr small Panoti): Saturn in the 4th (Kantaka) or 8th (Ashtama) from Moon.
  const dhaiyaType = cur === s4 ? 'Kantaka (4th from Moon)' as const : cur === s8 ? 'Ashtama (8th from Moon)' as const : null;
  let dhaiyaEnd: string | null = null;
  if (dhaiyaType) {
    const nextIngress = events.find(e => e.date > nowMs); // Saturn leaves the current sign at the next ingress
    dhaiyaEnd = nextIngress ? new Date(nextIngress.date).toISOString() : null;
  }

  // Methodology note (Item 2) — plain-language "what we computed".
  const RASHI = ['Mesha', 'Vrisha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
  const houseFromMoon = ((cur - moonSign + 12) % 12) + 1;
  const methodology = `How this was worked out: Sade Sati is defined by where the planet Saturn is transiting right now, measured from your Moon sign (${RASHI[moonSign]}). Saturn is currently in ${RASHI[cur]} — the ${houseFromMoon}${ordinalSuffix(houseFromMoon)} sign from your Moon${active ? ` — and the 12th, 1st and 2nd from the Moon are exactly the three signs that make up Sade Sati (the Rising, Peak and Setting phases), so it is active for you.` : `, which is outside the 12th/1st/2nd signs that make up Sade Sati, so it is not active right now.`} The start and end dates come from tracking the real dates Saturn enters and leaves those signs (its ~2.5-years-per-sign transit) — not an estimate.`;

  return { moonSign, active, phase, currentCycle, nextCycle, previousCycle, methodology, dhaiya: { active: dhaiyaType !== null, type: dhaiyaType, currentEnd: dhaiyaEnd } };
}

function ordinalSuffix(n: number): string { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return s[(v - 20) % 10] || s[v] || s[0]; }
