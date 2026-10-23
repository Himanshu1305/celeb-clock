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

export interface SadeSatiPause { start: string; end: string; }
/**
 * One Sade Sati cycle: from Saturn's FIRST entry into the 12th sign from the Moon to
 * its FINAL exit from the 2nd sign from the Moon. Retrograde loops that take Saturn
 * back out of the three signs for a few months are kept inside the cycle as `pauses`
 * (audit D2) instead of ending or restarting the cycle.
 */
export interface SadeSatiCycle {
  start: string;
  end: string;
  pauses: SadeSatiPause[];
  /** True when the cycle had already begun before the person was born (start is still the real Saturn ingress). */
  startedBeforeBirth?: boolean;
}
export interface SadeSatiReport {
  moonSign: number;                       // 0-11
  active: boolean;                        // Saturn is in the 12th/1st/2nd from the Moon right now
  phase: 'Rising (12th from Moon)' | 'Peak (on Moon sign)' | 'Setting (2nd from Moon)' | null;
  /** Saturn's current stay in the phase sign (entry → exit of that sign), when active. */
  currentPhase: { start: string; end: string } | null;
  currentCycle: SadeSatiCycle | null;     // the cycle that brackets now (active OR paused)
  /** Set when now falls in a retrograde pause inside the current cycle: Saturn is temporarily outside the three signs. */
  paused: { since: string; resumes: string } | null;
  nextCycle: SadeSatiCycle | null;        // the next upcoming cycle
  previousCycle: SadeSatiCycle | null;    // the most-recent ended cycle that overlaps the person's life (Part X narrative)
  methodology: string;                    // plain-language "what we computed" note (Item 2)
  dhaiya: { active: boolean; type: 'Kantaka (4th from Moon)' | 'Ashtama (8th from Moon)' | null; currentEnd: string | null };
}

const HOUR = 36e5;

// Binary-refine the exact ingress instant between two samples whose signs differ (~1 hour).
function refineBoundary(loMs: number, hiMs: number, saturnSignAt: SaturnSignFn): Date {
  const before = saturnSignAt(new Date(loMs));
  let a = loMs, b = hiMs;
  while (b - a > HOUR) { const mid = (a + b) / 2; if (saturnSignAt(new Date(mid)) === before) a = mid; else b = mid; }
  return new Date(b);
}

/** All Saturn sign-ingress events across [from, to], refined to ~1 hour. */
function ingressEvents(from: number, to: number, saturnSignAt: SaturnSignFn): Array<{ date: number; from: number; sign: number }> {
  // 7-day sampling: Saturn's shortest retrograde in-and-out of a sign between 1900 and
  // 2100 lasts 9.5 days (Tula, 28 Jan – 6 Feb 2041 — Swiss Ephemeris, Lahiri), so no
  // re-entry is skipped.
  const STEP = 7 * DAY;
  const events: Array<{ date: number; from: number; sign: number }> = [];
  let lastSign = saturnSignAt(new Date(from));
  let lastMs = from;
  for (let t = from + STEP; t <= to; t += STEP) {
    const s = saturnSignAt(new Date(t));
    if (s !== lastSign) { events.push({ date: refineBoundary(lastMs, t, saturnSignAt).getTime(), from: lastSign, sign: s }); lastSign = s; }
    lastMs = t;
  }
  return events;
}

/** Gaps shorter than this between two stays in the 12th/1st/2nd are retrograde pauses, not separate cycles. */
const MAX_PAUSE = 3 * YEAR;

export function computeSadeSati(moonSign: number, now: Date, saturnSignAt: SaturnSignFn, birth?: Date): SadeSatiReport {
  const s12 = (moonSign + 11) % 12, s1 = moonSign, s2 = (moonSign + 1) % 12;
  const s4 = (moonSign + 3) % 12, s8 = (moonSign + 7) % 12;
  const inSet = (s: number) => s === s12 || s === s1 || s === s2;
  const cur = saturnSignAt(now);
  const nowMs = now.getTime();

  const phase: SadeSatiReport['phase'] =
    cur === s12 ? 'Rising (12th from Moon)' : cur === s1 ? 'Peak (on Moon sign)' : cur === s2 ? 'Setting (2nd from Moon)' : null;
  const active = phase !== null;

  // Scan from 10 years before birth (enough to catch the start of a cycle running at
  // birth; −40y when no birth date is given) to +40y, and collect every stay of Saturn
  // in the 12th/1st/2nd from the Moon as [enter, leave) intervals.
  const from = birth ? Math.min(birth.getTime(), nowMs) - 10 * YEAR : nowMs - 40 * YEAR;
  const to = nowMs + 40 * YEAR;
  const events = ingressEvents(from, to, saturnSignAt);
  const stays: Array<{ start: number; end: number }> = [];
  let open: number | null = inSet(saturnSignAt(new Date(from))) ? NaN : null; // NaN = began before the scan window
  for (const e of events) {
    const wasIn = inSet(e.from), isIn = inSet(e.sign);
    if (!wasIn && isIn) open = e.date;
    else if (wasIn && !isIn && open !== null) { if (!Number.isNaN(open)) stays.push({ start: open, end: e.date }); open = null; }
  }
  // A stay still open at the end of the scan has no known end — drop it (beyond +40y).

  // Merge stays separated by a short (retrograde) gap into one cycle with pauses.
  const raw: Array<{ start: number; end: number; pauses: Array<{ start: number; end: number }> }> = [];
  for (const st of stays) {
    const last = raw[raw.length - 1];
    if (last && st.start - last.end < MAX_PAUSE) { last.pauses.push({ start: last.end, end: st.start }); last.end = st.end; }
    else raw.push({ start: st.start, end: st.end, pauses: [] });
  }
  const iso = (ms: number) => new Date(ms).toISOString();
  const birthMs = birth ? birth.getTime() : null;
  const cycles: SadeSatiCycle[] = raw.map(c => ({
    start: iso(c.start), end: iso(c.end),
    pauses: c.pauses.map(p => ({ start: iso(p.start), end: iso(p.end) })),
    ...(birthMs !== null && c.start < birthMs ? { startedBeforeBirth: true } : {}),
  }));
  const ms = (s: string) => new Date(s).getTime();

  const currentCycle = cycles.find(c => ms(c.start) <= nowMs && nowMs < ms(c.end)) || null;
  const nextCycle = cycles.find(c => ms(c.start) > nowMs) || null;
  // Part X: the most-recent already-ENDED cycle — but never one that ended before the
  // person was born (audit D10).
  const previousCycle = [...cycles].reverse().find(c => ms(c.end) <= nowMs && (birthMs === null || ms(c.end) > birthMs)) || null;
  const pause = currentCycle?.pauses.find(p => ms(p.start) <= nowMs && nowMs < ms(p.end)) || null;
  const paused = !active && pause ? { since: pause.start, resumes: pause.end } : null;

  // Saturn's current stay in its sign: last ingress at/before now → next ingress after now.
  const lastIngress = [...events].reverse().find(e => e.date <= nowMs);
  const nextIngress = events.find(e => e.date > nowMs);
  const currentPhase = active && lastIngress && nextIngress ? { start: iso(lastIngress.date), end: iso(nextIngress.date) } : null;

  // Dhaiya (2.5yr small Panoti): Saturn in the 4th (Kantaka) or 8th (Ashtama) from Moon.
  const dhaiyaType = cur === s4 ? 'Kantaka (4th from Moon)' as const : cur === s8 ? 'Ashtama (8th from Moon)' as const : null;
  let dhaiyaEnd: string | null = null;
  if (dhaiyaType) {
    dhaiyaEnd = nextIngress ? iso(nextIngress.date) : null; // Saturn leaves the current sign at the next ingress
  }

  // Methodology note (Item 2) — plain-language "what we computed".
  const RASHI = ['Mesha', 'Vrisha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
  const houseFromMoon = ((cur - moonSign + 12) % 12) + 1;
  const statusLine = active
    ? ` — and the 12th, 1st and 2nd from the Moon are exactly the three signs that make up Sade Sati (the Rising, Peak and Setting phases), so it is active for you.`
    : paused
      ? `, which is outside the 12th/1st/2nd signs for now — a retrograde loop has taken Saturn out of them temporarily, so your Sade Sati is paused and resumes when Saturn moves back.`
      : `, which is outside the 12th/1st/2nd signs that make up Sade Sati, so it is not active right now.`;
  const methodology = `How this was worked out: Sade Sati is defined by where the planet Saturn is transiting right now, measured from your Moon sign (${RASHI[moonSign]}). Saturn is currently in ${RASHI[cur]} — the ${houseFromMoon}${ordinalSuffix(houseFromMoon)} sign from your Moon${statusLine} A cycle runs from Saturn's first entry into the 12th sign from your Moon to its final exit from the 2nd; when Saturn's retrograde motion briefly takes it back out of those signs, that is shown as a pause inside the same cycle. The dates come from tracking the real dates Saturn enters and leaves those signs — not an estimate.`;

  return { moonSign, active, phase, currentPhase, currentCycle, paused, nextCycle, previousCycle, methodology, dhaiya: { active: dhaiyaType !== null, type: dhaiyaType, currentEnd: dhaiyaEnd } };
}

function ordinalSuffix(n: number): string { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return s[(v - 20) % 10] || s[v] || s[0]; }
