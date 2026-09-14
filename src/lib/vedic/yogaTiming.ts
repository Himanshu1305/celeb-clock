/**
 * Part D-Fix3 — Yoga / life-event ACTIVATION-WINDOW calculator.
 *
 * Prior sessions computed THAT a Yoga exists (Part G) and the FULL Vimshottari
 * Dasha timeline (Part B, extended to full-life in this session). Neither
 * computed WHEN a chart promise activates. This module joins the two.
 *
 * ── Classical timing rules used (Part 1 research, multi-source) ──────────────
 *  • A Yoga/promise activates most strongly during the Mahadasha and/or
 *    Antardasha of a planet DIRECTLY INVOLVED in forming it (a participating
 *    planet, or a lord of a house that defines the theme). (indastro, prokerala,
 *    academyofvedicvidya, jagannathhora — consistent.)
 *  • Mahadasha = the PRIMARY, broad, stronger window (the "chapter"); Antardasha
 *    = the PRECISE sub-window inside it (the "paragraph"). Classical view: an
 *    event indicated only at Antardasha level (not Maha) is weaker. So the
 *    strongest activation is a significator's Antardasha sitting INSIDE a
 *    significator's Mahadasha ("double activation").
 *  • A life has several qualifying windows; a real "when will X happen" question
 *    is about the near future, so we emphasise the CURRENT or NEXT-UPCOMING
 *    window and keep the rest as secondary detail. If the strongest windows are
 *    already in the past, we say so honestly rather than inventing a soon one.
 *
 * ── Category significators (Part 1.4) ───────────────────────────────────────
 *  • Wealth  : 2nd-house lord, 11th-house lord, + Jupiter (Dhana karaka).
 *  • Career  : 10th-house lord, + any planet sitting in the 10th house.
 *  • Marriage: 7th-house lord, + Venus (Kalatra karaka), + Jupiter.
 *    GENDER decision (documented): classical texts make Jupiter the husband-
 *    significator in a woman's chart and Venus the wife-significator in a man's.
 *    Modern practice increasingly treats this as outdated, and this product does
 *    NOT collect gender. We therefore use a GENDER-NEUTRAL set — Venus (the
 *    universal Kalatra karaka) + Jupiter (a marriage benefic in all charts) +
 *    the 7th lord — for everyone. Documented, not silently guessed.
 */
import type { BirthChartResult, MahadashaPeriod } from './calculateBirthChart';
import { SIGN_LORDS } from './engine/sthanaBala';
import { RASHI_NAMES } from './engine/vedicEngine';

export type WindowLevel = 'maha' | 'antar';
export type WindowStatus = 'past' | 'current' | 'upcoming';

export interface ActivationWindow {
  planet: string;
  level: WindowLevel;
  start: string;            // ISO
  end: string;              // ISO
  withinMaha?: string;      // for an antar window: the Mahadasha lord it sits inside
  doubleActivation?: boolean; // antar of a significator INSIDE a maha of a significator = strongest
  status: WindowStatus;
}

export interface TimingResult {
  key: string;              // yoga name or category id
  label: string;            // human label
  significators: string[];  // planets whose Dasha periods count as activation
  windows: ActivationWindow[]; // ordered: current, then upcoming (soonest first), then past (recent first)
  current: ActivationWindow | null;
  next: ActivationWindow | null;   // primary emphasis: current if active, else nearest upcoming
  note?: string;
}

// ── house helpers (reuse the same SIGN_LORDS mapping the Yoga engine uses) ────
export function houseLordOf(chart: BirthChartResult, house: number): string {
  const lagnaIdx = chart.lagna.rashiIndex;                 // 0-based sign of the 1st house
  const signIdx = (lagnaIdx + (house - 1)) % 12;
  return SIGN_LORDS[signIdx];
}
export function planetsInHouse(chart: BirthChartResult, house: number): string[] {
  return chart.planets.filter(p => p.house === house).map(p => p.name);
}

// Rahu/Ketu HAVE Vimshottari Dashas, so they are valid significators when they
// participate in a Yoga; but they do NOT rule signs, so they never appear as a
// "house lord". That asymmetry is intentional and correct.
function statusOf(startISO: string, endISO: string, now: Date): WindowStatus {
  const s = new Date(startISO).getTime(), e = new Date(endISO).getTime(), t = now.getTime();
  if (t >= e) return 'past';
  if (t >= s) return 'current';
  return 'upcoming';
}

/**
 * Every Maha/Antar window ruled by one of `significators`, across the whole life.
 * Maha window = the significator's Mahadasha. Antar window = the significator's
 * Antardasha (tagged doubleActivation when the enclosing Maha lord is ALSO a
 * significator — the classically strongest case).
 */
export function windowsForSignificators(
  timeline: MahadashaPeriod[] | undefined,
  significators: string[],
  now: Date,
): ActivationWindow[] {
  if (!timeline?.length || !significators.length) return [];
  const sig = new Set(significators);
  const out: ActivationWindow[] = [];
  for (const maha of timeline) {
    const mahaIsSig = sig.has(maha.lord);
    if (mahaIsSig) {
      out.push({ planet: maha.lord, level: 'maha', start: maha.start, end: maha.end, status: statusOf(maha.start, maha.end, now) });
    }
    for (const antar of maha.antardashas) {
      if (!sig.has(antar.lord)) continue;
      out.push({
        planet: antar.lord, level: 'antar', start: antar.start, end: antar.end,
        withinMaha: maha.lord, doubleActivation: mahaIsSig,
        status: statusOf(antar.start, antar.end, now),
      });
    }
  }
  return orderWindows(out, now);
}

/** current first, then upcoming soonest-first, then past most-recent-first. */
export function orderWindows(windows: ActivationWindow[], now: Date): ActivationWindow[] {
  const rank = (w: ActivationWindow) => (w.status === 'current' ? 0 : w.status === 'upcoming' ? 1 : 2);
  return [...windows].sort((a, b) => {
    const ra = rank(a), rb = rank(b);
    if (ra !== rb) return ra - rb;
    const sa = new Date(a.start).getTime(), sb = new Date(b.start).getTime();
    return a.status === 'past' ? sb - sa : sa - sb;   // past: most recent first; else: soonest first
  });
}

function pickCurrentAndNext(windows: ActivationWindow[]): { current: ActivationWindow | null; next: ActivationWindow | null } {
  const current = windows.find(w => w.status === 'current') || null;
  const upcoming = windows.find(w => w.status === 'upcoming') || null;
  // Prefer a precise (antar) upcoming window for "next" if one exists soon, else the maha.
  return { current, next: current || upcoming };
}

/** Timing windows for every DETECTED Yoga in the chart (significators = its participating planets). */
export function yogaTimings(chart: BirthChartResult, now: Date = new Date()): TimingResult[] {
  const yogas = chart.yogas || [];
  const results: TimingResult[] = [];
  for (const y of yogas) {
    const significators = [...new Set(y.planets || [])].filter(Boolean);
    if (!significators.length) continue;
    const windows = windowsForSignificators(chart.dashaTimeline, significators, now);
    const { current, next } = pickCurrentAndNext(windows);
    results.push({
      key: y.name, label: y.name, significators, windows, current, next,
      note: windows.length && !current && !next
        ? 'All classical activation windows for this Yoga are in the past for this chart.'
        : undefined,
    });
  }
  return results;
}

export type LifeCategory = 'wealth' | 'career' | 'marriage' | 'family';

/** Significators for the three named life questions (Part 1.4). */
export function categorySignificators(chart: BirthChartResult, category: LifeCategory): { significators: string[]; note?: string } {
  if (category === 'wealth') {
    const sig = [houseLordOf(chart, 2), houseLordOf(chart, 11), 'Jupiter'];
    return { significators: [...new Set(sig)], note: 'Wealth timing uses the periods of your 2nd-house lord (savings), 11th-house lord (gains), and Jupiter (the natural significator of wealth).' };
  }
  if (category === 'career') {
    const sig = [houseLordOf(chart, 10), ...planetsInHouse(chart, 10)];
    return { significators: [...new Set(sig)], note: 'Career/job timing uses the periods of your 10th-house lord (profession) and any planet placed in your 10th house.' };
  }
  if (category === 'family') {
    // Family (Part S): 4th-house lord (home/mother) + 9th-house lord (father/fortune) —
    // the same houses the Family section already reads, now with a Dasha timing angle.
    const sig = [houseLordOf(chart, 4), houseLordOf(chart, 9)];
    return { significators: [...new Set(sig)], note: 'Family timing uses the periods of your 4th-house lord (home and mother) and 9th-house lord (father and fortune).' };
  }
  // marriage — gender-neutral (see module header).
  const sig = [houseLordOf(chart, 7), 'Venus', 'Jupiter'];
  return { significators: [...new Set(sig)], note: 'Marriage timing uses the periods of your 7th-house lord (partnership), Venus (the natural significator of marriage), and Jupiter — applied the same way regardless of gender.' };
}

/** Timing windows for one of the three named life categories. */
export function categoryTiming(chart: BirthChartResult, category: LifeCategory, now: Date = new Date()): TimingResult {
  const { significators, note } = categorySignificators(chart, category);
  const windows = windowsForSignificators(chart.dashaTimeline, significators, now);
  const { current, next } = pickCurrentAndNext(windows);
  const label = category === 'wealth' ? 'Wealth' : category === 'career' ? 'Career / job' : category === 'family' ? 'Family' : 'Marriage';
  let honest = note;
  if (windows.length && !current && !next) {
    honest = `${note} Your strongest classical windows for this have already passed; the next comparable one is beyond the computed range.`;
  }
  return { key: category, label, significators, windows, current, next, note: honest };
}

export function allCategoryTimings(chart: BirthChartResult, now: Date = new Date()): Record<LifeCategory, TimingResult> {
  return {
    wealth: categoryTiming(chart, 'wealth', now),
    career: categoryTiming(chart, 'career', now),
    marriage: categoryTiming(chart, 'marriage', now),
    family: categoryTiming(chart, 'family', now),
  };
}

// ── formatting helpers (shared by readings + chat so the wording is identical) ─
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function formatMonthYear(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
export function formatWindowRange(w: ActivationWindow): string {
  return `${formatMonthYear(w.start)} to ${formatMonthYear(w.end)}`;
}
/** A one-line, honest description of a window for prose ("your Jupiter Antardasha from March 2027 to August 2028"). */
export function describeWindow(w: ActivationWindow): string {
  const kind = w.level === 'maha' ? 'Mahadasha (main period)' : 'Antardasha (sub-period)';
  const when = w.status === 'current' ? 'currently running' : w.status === 'upcoming' ? 'upcoming' : 'past';
  return `${w.planet} ${kind} (${formatWindowRange(w)}, ${when})`;
}

/**
 * A cache-staleness tag (Part 3.5). Readings cite "current period" and "next
 * upcoming window" — both are TIME-dependent, changing as real time passes even
 * though the birth chart never does. This returns an identity for the CURRENT
 * Maha/Antar period; folding it into the reading cache key means a cached reading
 * is auto-invalidated the moment `now` crosses into a new sub-period (when the
 * "current"/"next" framing would otherwise go stale). Within one Antardasha the
 * tag is stable, so the expensive AI reading is still cached normally.
 */
export function currentDashaTag(chart: BirthChartResult, now: Date = new Date()): string {
  const tl = chart.dashaTimeline;
  if (!tl?.length) return 'nd';
  const maha = tl.find(m => now >= new Date(m.start) && now < new Date(m.end));
  if (!maha) return 'nd';
  const antar = maha.antardashas.find(a => now >= new Date(a.start) && now < new Date(a.end));
  if (!antar) return `${maha.lord}-x`;
  const endYM = new Date(antar.end).toISOString().slice(0, 7); // YYYY-MM of this sub-period's end
  return `${maha.lord}-${antar.lord}-${endYM}`;
}

// ── Reading/chat-ready timing facts (single source of truth for prose + checker) ─
export interface TimingFactWindow {
  planet: string; level: WindowLevel; start: string; end: string;
  range: string; status: WindowStatus; doubleActivation?: boolean;
}
export interface TimingFactCategory {
  key: string; label: string; significators: string[];
  next: TimingFactWindow | null; upcoming: TimingFactWindow[]; note?: string;
}
/**
 * Timing for a present dosha (Part S). `structural: true` means the dosha is a
 * permanent chart feature with NO phase-based timing (e.g. Kaal Sarp) — we say so
 * honestly and never invent a window; any windows listed are only the periods during
 * which its effects are traditionally most PRONOUNCED (the participating planets'
 * periods), not a start/end of the dosha itself. `phase` carries Sade Sati's genuine
 * phase timing (which is transit-based, not Dasha-based). */
export interface DoshaTimingFact {
  name: string; structural: boolean;
  significators: string[]; windows: TimingFactWindow[];
  phase?: string | null; note: string;
}
/** Timing for a divisional-chart placement (Part S): the varga promise is classically
 * activated during the Dasha of the placement's ruling planet (its dispositor). */
export interface DivisionalTimingFact {
  varga: string; placement: string; ruler: string; windows: TimingFactWindow[]; note: string;
}
export interface TimingFacts {
  categories: TimingFactCategory[];
  yogas: Array<{ name: string; significators: string[]; next: TimingFactWindow | null; upcoming: TimingFactWindow[] }>;
  /** Dosha expression timing (Part S) — empty when no dosha is present. */
  doshaTiming: DoshaTimingFact[];
  /** Divisional-placement activation timing (Part S). */
  divisionalTiming: DivisionalTimingFact[];
  currentPeriod: string | null;
  /** Every date-range the model is ALLOWED to cite ("March 2027 to August 2028"). */
  validRanges: string[];
  /** Every month-year endpoint that appears in a real computed window ("March 2027"). */
  validMonths: string[];
}

function toFactWindow(w: ActivationWindow): TimingFactWindow {
  return { planet: w.planet, level: w.level, start: w.start, end: w.end, range: formatWindowRange(w), status: w.status, doubleActivation: w.doubleActivation };
}
/** Up to `n` windows to surface: prefer current + soonest upcoming (precise antar windows first). */
function surfaceWindows(t: TimingResult, n = 3): TimingFactWindow[] {
  const relevant = t.windows.filter(w => w.status === 'current' || w.status === 'upcoming');
  const chosen = relevant.length ? relevant : t.windows.slice(0, n); // all-past → show the most recent past ones honestly
  return chosen.slice(0, n).map(toFactWindow);
}

/** Assemble the timing block consumed by both the reading prompt and the chat. */
export function buildTimingFacts(chart: BirthChartResult, now: Date = new Date()): TimingFacts {
  const cats = allCategoryTimings(chart, now);
  const categories: TimingFactCategory[] = (['wealth', 'career', 'marriage', 'family'] as LifeCategory[]).map(k => {
    const t = cats[k];
    return { key: t.key, label: t.label, significators: t.significators, next: t.next ? toFactWindow(t.next) : null, upcoming: surfaceWindows(t), note: t.note };
  });
  const yogas = yogaTimings(chart, now).map(t => ({
    name: t.key, significators: t.significators, next: t.next ? toFactWindow(t.next) : null, upcoming: surfaceWindows(t),
  }));

  // Dosha expression timing (Part S) — reuse the activation-window engine. Presence is
  // structural; EXPRESSION is time-bound to the participating planets' periods. Sade
  // Sati carries its own genuine phase timing (transit-based, not Dasha-based). Kaal
  // Sarp is a permanent/structural feature (no phase timing) — most felt in Rahu/Ketu
  // periods; we say that honestly rather than fabricating a start/end.
  const doshaTiming: DoshaTimingFact[] = [];
  const surfacePlain = (sig: string[]): TimingFactWindow[] => {
    const wins = windowsForSignificators(chart.dashaTimeline, sig, now);
    const rel = wins.filter(w => w.status === 'current' || w.status === 'upcoming');
    return (rel.length ? rel : wins).slice(0, 3).map(toFactWindow);
  };
  if (chart.doshas.mangalDosha.hasDosha) {
    doshaTiming.push({ name: 'Mangal Dosha', structural: false, significators: ['Mars'], windows: surfacePlain(['Mars']),
      note: 'Mangal Dosha is present in the chart at all times, but its effects are classically most pronounced during Mars Maha/Antar periods and comparatively dormant otherwise.' });
  }
  if (chart.doshas.kaalSarp.present) {
    doshaTiming.push({ name: 'Kaal Sarp', structural: true, significators: ['Rahu', 'Ketu'], windows: surfacePlain(['Rahu', 'Ketu']),
      note: 'Kaal Sarp is a permanent/structural chart pattern — it has no phase-based timing the way Sade Sati does. It is traditionally felt most during Rahu/Ketu periods.' });
  }
  if (chart.doshas.sadeSati.active) {
    doshaTiming.push({ name: 'Sade Sati', structural: false, significators: ['Saturn'], windows: [], phase: chart.doshas.sadeSati.phase,
      note: `Sade Sati has genuine phase-based timing: it is currently in its ${chart.doshas.sadeSati.phase || 'active'} phase.` });
  }

  // Divisional-placement activation timing (Part S): a varga promise activates during
  // the Dasha of the placement's ruling planet (dispositor). Verified classical basis:
  // "varga results only activate during supportive Maha/Antar periods." We tie the two
  // placements the reading already surfaces — Dasamsa (D10) Sun (public/career varga)
  // and Navamsa (D9) Moon (dharma/relationship varga) — to their dispositors' periods.
  const dispositorOf = (sign: string): string | null => {
    const idx = RASHI_NAMES.indexOf(sign);
    return idx >= 0 ? SIGN_LORDS[idx] : null;
  };
  const divisionalTiming: DivisionalTimingFact[] = [];
  const d10SunSign = chart.divisionalCharts.d10?.Sun;
  const d10Ruler = d10SunSign ? dispositorOf(d10SunSign) : null;
  if (d10Ruler) {
    divisionalTiming.push({ varga: 'Dasamsa (D10)', placement: `Sun in ${d10SunSign}`, ruler: d10Ruler, windows: surfacePlain([d10Ruler]),
      note: `Your Dasamsa (D10, career/public-life) placement of the Sun in ${d10SunSign} is ruled by ${d10Ruler}; its promise is classically most likely to express during ${d10Ruler} Maha/Antar periods.` });
  }
  const d9MoonSign = chart.divisionalCharts.d9?.Moon;
  const d9Ruler = d9MoonSign ? dispositorOf(d9MoonSign) : null;
  if (d9Ruler) {
    divisionalTiming.push({ varga: 'Navamsa (D9)', placement: `Moon in ${d9MoonSign}`, ruler: d9Ruler, windows: surfacePlain([d9Ruler]),
      note: `Your Navamsa (D9, inner/relationship) placement of the Moon in ${d9MoonSign} is ruled by ${d9Ruler}; its promise is classically most likely to express during ${d9Ruler} Maha/Antar periods.` });
  }

  // Valid-date set for the accuracy checker: all surfaced windows + the current
  // Maha and current Antar periods (always legitimately citable context).
  const validRanges = new Set<string>();
  const validMonths = new Set<string>();
  const addWin = (w: TimingFactWindow) => { validRanges.add(w.range); validMonths.add(formatMonthYear(w.start)); validMonths.add(formatMonthYear(w.end)); };
  for (const c of categories) { if (c.next) addWin(c.next); c.upcoming.forEach(addWin); }
  for (const y of yogas) { if (y.next) addWin(y.next); y.upcoming.forEach(addWin); }
  for (const d of doshaTiming) d.windows.forEach(addWin);
  for (const dv of divisionalTiming) dv.windows.forEach(addWin);
  // Current periods from the validated timeline.
  const curM = chart.dashaTimeline?.find(m => now >= new Date(m.start) && now < new Date(m.end));
  const curA = curM?.antardashas.find(a => now >= new Date(a.start) && now < new Date(a.end));
  let currentPeriod: string | null = null;
  if (curM) { validMonths.add(formatMonthYear(curM.start)); validMonths.add(formatMonthYear(curM.end)); }
  if (curM && curA) { currentPeriod = `${curM.lord} / ${curA.lord}`; validMonths.add(formatMonthYear(curA.start)); validMonths.add(formatMonthYear(curA.end)); }

  return { categories, yogas, doshaTiming, divisionalTiming, currentPeriod, validRanges: [...validRanges], validMonths: [...validMonths] };
}
