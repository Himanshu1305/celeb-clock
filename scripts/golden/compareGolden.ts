/**
 * Golden-chart comparison — shared by the CI suite (src/lib/vedic/__tests__/goldenCharts.test.ts)
 * and the weekly drift check (scripts/golden/driftCheck.ts).
 *
 * Input: the stored reference (src/lib/vedic/__tests__/golden/goldenCharts.json, generated from the
 * Swiss Ephemeris + hand-recorded AstroSage values by scripts/golden/generate_golden.py) and the JSON
 * returned by BornClock's /api/kundali, /api/sade-sati and /api/kundali-match (either the local handlers
 * or the live site). Output: a list of plain-language differences — empty means "matches the reference".
 */
import golden from '../../src/lib/vedic/__tests__/golden/goldenCharts.json';

export type Golden = typeof golden;
export type GoldenChart = Golden['charts'][number];
export type GoldenCouple = Golden['couples'][number];

export interface Diff {
  /** Chart or couple id, e.g. "P3" or "P1×P2". */
  id: string;
  /** Which API produced the value: kundali | sade-sati | kundali-match. */
  api: string;
  field: string;
  expected: string;
  got: string;
  /** Ready-to-print sentence, e.g. "P3 Moon nakshatra changed: expected Purva Phalguni 2, got Magha 4". */
  message: string;
}

export const GOLDEN: Golden = golden;
export const REF_DATE = new Date(golden.referenceDate);
const RASHI = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
const ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const;
const DAY = 864e5;
/** Dasha / Sade Sati date tolerance. Engine vs Swiss is ~1″ on the Moon (≈ hours on a dasha date). */
export const DATE_TOL_DAYS = 1;

const signName = (idx1: unknown) => (typeof idx1 === 'number' && idx1 >= 1 && idx1 <= 12 ? RASHI[idx1 - 1] : String(idx1));
/** Spelling variants the site uses for the same sign (e.g. "Vrisha" for Vrishabha). */
const SIGN_ALIASES: Record<string, string> = { Vrisha: 'Vrishabha', Vrishchika: 'Vrischika', Makar: 'Makara', Kumbh: 'Kumbha', Meen: 'Meena' };
const canonicalSign = (name: unknown) => (typeof name === 'string' ? SIGN_ALIASES[name] ?? name : name);
const day = (iso: unknown) => (typeof iso === 'string' ? iso.slice(0, 10) : String(iso));
const ms = (iso: string) => new Date(iso).getTime();

class Collector {
  diffs: Diff[] = [];
  constructor(private id: string, private api: string) {}
  eq(field: string, label: string, expected: unknown, got: unknown) {
    const e = String(expected), g = got === undefined ? '(missing)' : String(got);
    if (e !== g) this.push(field, label, e, g);
  }
  date(field: string, label: string, expectedISO: string, gotISO: unknown, tolDays = DATE_TOL_DAYS) {
    const ok = typeof gotISO === 'string' && Number.isFinite(ms(gotISO)) && Math.abs(ms(gotISO) - ms(expectedISO)) <= tolDays * DAY;
    if (!ok) this.push(field, label, day(expectedISO), gotISO === undefined || gotISO === null ? '(missing)' : day(gotISO));
  }
  push(field: string, label: string, expected: string, got: string) {
    this.diffs.push({ id: this.id, api: this.api, field, expected, got, message: `${this.id} ${label} changed: expected ${expected}, got ${got}` });
  }
}

/**
 * Differences that are KNOWN, already reported to the founder, and not yet fixed. They are kept out
 * of the pass/fail (so they don't block every deploy) but are still checked: the golden suite fails
 * if a known issue STOPS showing up, so the entry gets removed once the engine is fixed, and the
 * weekly drift report lists them in their own section.
 */
export const KNOWN_ISSUES: Array<{ id: string; field: string; note: string }> = [
  { id: 'G15', field: 'lagna', note: 'Audit B7: above the Arctic Circle the Ascendant formula returns the setting (western) point — Kanya instead of Meena for Tromsø (Swiss Ephemeris: 15° tropical is on the eastern horizon and rising). The site already shows a POLAR_LATITUDE warning on such charts.' },
  { id: 'G15', field: 'd9.Lagna', note: 'Follows from the B7 polar Ascendant above (D9 Lagna is computed from the wrong Ascendant).' },
];
const isKnown = (d: Diff) => KNOWN_ISSUES.some(k => k.id === d.id && k.field === d.field);
/** Split differences into real drift and known open issues. */
export function splitKnown<T extends Diff>(diffs: T[]): { drift: T[]; known: T[] } {
  return { drift: diffs.filter(d => !isKnown(d)), known: diffs.filter(isKnown) };
}

/** Sade Sati as the stored Swiss ingress table gives it, at any instant. */
export function expectedSadeSati(moonSign: string, at: Date, birthISO?: string) {
  const t = at.getTime();
  const last = [...golden.saturnIngresses].reverse().find(i => ms(i.at) <= t);
  if (!last) throw new Error(`golden saturnIngresses do not cover ${at.toISOString()}`);
  const m = RASHI.indexOf(moonSign), s = RASHI.indexOf(last.toSign);
  const house = ((s - m + 12) % 12) + 1;
  const phase = house === 12 ? 'Rising (12th from Moon)' : house === 1 ? 'Peak (on Moon sign)' : house === 2 ? 'Setting (2nd from Moon)' : null;
  const cycles = (golden.sadeSatiCyclesByMoonSign as Record<string, Array<{ start: string; end: string; pauses: Array<{ start: string; end: string }> }>>)[moonSign];
  const birth = birthISO ? ms(birthISO) : -Infinity;
  return {
    active: phase !== null,
    phase,
    currentCycle: cycles.find(c => ms(c.start) <= t && t < ms(c.end)) || null,
    nextCycle: cycles.find(c => ms(c.start) > t) || null,
    previousCycle: [...cycles].reverse().find(c => ms(c.end) <= t && ms(c.end) > birth) || null,
  };
}

/** The Mahadasha / Antardasha the reference gives at `at` (Antardasha only inside the stored Mahadasha). */
export function expectedDashaAt(g: GoldenChart, at: Date) {
  const t = at.getTime();
  const md = g.expected.mahadashas.find(p => ms(p.start) <= t && t < ms(p.end)) || null;
  const sameMd = md && md.lord === g.expected.dashaAtRef.mahadasha && md.start === g.expected.dashaAtRef.mahadashaStart;
  const ad = sameMd ? g.expected.antardashasOfRefMahadasha.find(p => ms(p.start) <= t && t < ms(p.end)) || null : null;
  return { md, ad };
}

const near = (a: string, b: string) => Math.abs(ms(a) - ms(b)) <= DATE_TOL_DAYS * DAY;

/**
 * Compare one /api/kundali response with the reference.
 * `now` = the instant the server used for "current" values (the local suite pins it to REF_DATE;
 * the live check passes the request time).
 */
export function compareKundali(g: GoldenChart, k: any, now: Date): Diff[] {
  const c = new Collector(g.id, 'kundali');
  const e = g.expected;
  if (!k || typeof k !== 'object' || k.error) {
    c.push('response', 'chart response', 'a chart', k?.error ? `error "${k.error}"` : 'no data');
    return c.diffs;
  }
  c.eq('utc', 'birth instant (UTC)', g.utc.replace(/Z$/, ''), String(k.birthTimezone?.utcISO ?? '').replace(/\.000Z$|Z$/, ''));
  c.eq('lagna', 'Lagna sign', e.lagna, signName(k.lagna?.signIndex));
  const planets: any[] = Array.isArray(k.planets) ? k.planets : [];
  const moon = planets.find(p => p.name === 'Moon');
  c.eq('moonSign', 'Moon sign', e.moonSign, signName(moon?.signIndex));
  c.eq('nakshatra', 'Moon nakshatra', `${e.nakshatra} ${e.pada}`, `${k.nakshatra?.nakshatra} ${k.nakshatra?.pada}`);
  for (const p of ORDER) {
    c.eq(`planets.${p}`, `${p} sign`, e.planets[p], signName(planets.find(x => x.name === p)?.signIndex));
  }
  const d9 = k.divisionalCharts?.d9;
  c.eq('d9.Lagna', 'D9 Lagna sign', e.d9.Lagna, signName(d9?.lagnaSignIndex));
  for (const p of ORDER) {
    c.eq(`d9.${p}`, `D9 ${p} sign`, e.d9[p], signName(d9?.planets?.find((x: any) => x.name === p)?.signIndex));
  }

  // Dasha timeline (time-independent): every Mahadasha boundary, and the Antardashas of the reference-date Mahadasha.
  const tl: any[] = Array.isArray(k.dashaTimeline) ? k.dashaTimeline : [];
  e.mahadashas.forEach((md, i) => {
    const got = tl[i];
    c.eq(`mahadashas[${i}].lord`, `Mahadasha #${i + 1} lord`, md.lord, got?.lord);
    c.date(`mahadashas[${i}].start`, `${md.lord} Mahadasha start`, md.start, got?.start);
    c.date(`mahadashas[${i}].end`, `${md.lord} Mahadasha end`, md.end, got?.end);
  });
  const refMd = tl.find(p => p?.lord === e.dashaAtRef.mahadasha && typeof p.start === 'string' && near(p.start, e.dashaAtRef.mahadashaStart));
  e.antardashasOfRefMahadasha.forEach((ad, i) => {
    const got = refMd?.antardashas?.[i];
    c.eq(`antardashas[${i}].lord`, `${e.dashaAtRef.mahadasha} Mahadasha, Antardasha #${i + 1} lord`, ad.lord, got?.lord);
    c.date(`antardashas[${i}].start`, `${e.dashaAtRef.mahadasha}–${ad.lord} Antardasha start`, ad.start, got?.start);
  });

  // "Current" dasha the API reports, against the reference at the server's `now`.
  const exp = expectedDashaAt(g, now);
  if (exp.md) {
    c.eq('dasha.mahadasha', `current Mahadasha (${day(now.toISOString())})`, exp.md.lord, k.dasha?.mahadasha);
    c.date('dasha.mahadasha_start', 'current Mahadasha start', exp.md.start, k.dasha?.mahadasha_start);
    c.date('dasha.mahadasha_end', 'current Mahadasha end', exp.md.end, k.dasha?.mahadasha_end);
  }
  if (exp.ad) {
    c.eq('dasha.antardasha', `current Antardasha (${day(now.toISOString())})`, exp.ad.lord, k.dasha?.antardasha);
    c.date('dasha.antardasha_start', 'current Antardasha start', exp.ad.start, k.dasha?.antardasha_start);
    c.date('dasha.antardasha_end', 'current Antardasha end', exp.ad.end, k.dasha?.antardasha_end);
  }

  const md = k.doshas?.mangalDosha;
  c.eq('manglik.fromLagna', 'Manglik from Lagna', e.manglik.fromLagna, md?.fromLagna);
  c.eq('manglik.fromMoon', 'Manglik from Moon', e.manglik.fromMoon, md?.fromMoon);
  c.eq('manglik.level', 'Manglik level', e.manglik.level, md?.severityLabel);
  const astro = (e.manglik as { astrosageLevel?: string }).astrosageLevel;
  if (astro) c.eq('manglik.astrosage', 'Manglik level vs AstroSage', astro, md?.severityLabel);
  c.eq('kaalSarpFull', 'Kaal Sarp (full)', e.kaalSarpFull ? 'present' : 'not present', k.doshas?.kaalSarp?.present === true ? 'present' : k.doshas?.kaalSarp ? 'not present' : undefined);
  const ss = expectedSadeSati(e.moonSign, now, g.utc);
  c.eq('doshas.sadeSati.active', `Sade Sati status (${day(now.toISOString())})`, ss.active ? 'active' : 'not active', k.doshas?.sadeSati ? (k.doshas.sadeSati.active ? 'active' : 'not active') : undefined);
  return c.diffs;
}

/** Compare one /api/sade-sati response with the reference at the server's `now`. */
export function compareSadeSati(g: GoldenChart, s: any, now: Date): Diff[] {
  const c = new Collector(g.id, 'sade-sati');
  if (!s || typeof s !== 'object' || s.error) {
    c.push('response', 'Sade Sati response', 'a report', s?.error ? `error "${s.error}"` : 'no data');
    return c.diffs;
  }
  const exp = expectedSadeSati(g.expected.moonSign, now, g.utc);
  const when = day(now.toISOString());
  c.eq('moonSignName', 'Sade Sati Moon sign', g.expected.moonSign, canonicalSign(s.moonSignName));
  c.eq('active', `Sade Sati status (${when})`, exp.active ? 'active' : 'not active', s.active === true ? 'active' : s.active === false ? 'not active' : undefined);
  c.eq('phase', `Sade Sati phase (${when})`, exp.phase ?? 'none', s.phase ?? 'none');
  for (const k of ['currentCycle', 'nextCycle', 'previousCycle'] as const) {
    const ec = exp[k];
    const label = { currentCycle: 'current Sade Sati cycle', nextCycle: 'next Sade Sati cycle', previousCycle: 'last Sade Sati cycle' }[k];
    if (!ec) { if (s[k]) c.push(k, label, 'none', `${day(s[k].start)} → ${day(s[k].end)}`); continue; }
    const got = s[k];
    const okStart = got && near(got.start, ec.start), okEnd = got && near(got.end, ec.end);
    if (!okStart || !okEnd) c.push(k, label, `${day(ec.start)} → ${day(ec.end)}`, got ? `${day(got.start)} → ${day(got.end)}` : 'none');
  }
  return c.diffs;
}

/** Compare one /api/kundali-match response (boy entered as groom) with AstroSage. */
export function compareMatch(couple: GoldenCouple, m: any): Diff[] {
  const id = `${couple.boy}×${couple.girl}`;
  const c = new Collector(id, 'kundali-match');
  if (!m || typeof m !== 'object' || m.error || !m.gunaMilan) {
    c.push('response', 'match response', 'a Guna Milan result', m?.error ? `error "${m.error}"` : 'no data');
    return c.diffs;
  }
  c.eq('total', 'Guna Milan total (AstroSage)', couple.astrosageTotal, m.gunaMilan.total);
  for (const [key, val] of Object.entries(couple.astrosageKootas as Record<string, number>)) {
    c.eq(`kootas.${key}`, `${key[0].toUpperCase()}${key.slice(1)} koota (AstroSage)`, val, m.gunaMilan.kootas?.find((x: any) => x.key === key)?.score);
  }
  return c.diffs;
}

/** All golden births by id (the 20 charts plus the couple-only births). */
export function birthById(id: string): GoldenChart {
  const b = [...golden.charts, ...golden.coupleBirths].find(x => x.id === id);
  if (!b) throw new Error(`no golden birth ${id}`);
  return b as GoldenChart;
}

/** Query string the site's own pages send for a birth (y/m/d/h/min/lat/lon + IANA zone). */
export function birthQuery(g: GoldenChart, suffix = ''): Record<string, string> {
  const [date, time] = g.birth.local.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  return {
    [`y${suffix}`]: String(y), [`m${suffix}`]: String(m), [`d${suffix}`]: String(d),
    [`h${suffix}`]: String(h), [`min${suffix}`]: String(min),
    [`lat${suffix}`]: String(g.birth.lat), [`lon${suffix}`]: String(g.birth.lon), [`tzid${suffix}`]: g.birth.tz,
  };
}

export function matchQuery(couple: GoldenCouple): Record<string, string> {
  return { ...birthQuery(birthById(couple.boy), 'A'), ...birthQuery(birthById(couple.girl), 'B'), groom: 'A' };
}

/** Markdown table of differences (for the GitHub issue and the console). */
export function diffTable(diffs: Array<Diff & { source?: string }>): string {
  const esc = (s: string) => s.replace(/\|/g, '\\|');
  const rows = diffs.map(d => `| ${d.source ?? ''} | ${esc(d.id)} | ${d.api} | ${esc(d.field)} | ${esc(d.expected)} | ${esc(d.got)} |`);
  return ['| Source | Chart | API | Field | Expected (reference) | Got |', '|---|---|---|---|---|---|', ...rows].join('\n');
}
