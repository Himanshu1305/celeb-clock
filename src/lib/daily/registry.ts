/**
 * Registry of daily-changing page kinds — ROUTES ONLY (no engine imports), so the
 * Cloudflare Worker can import it cheaply. The matching compute functions live in
 * ./compute.ts (heavy; build script + browser fallback only).
 *
 * To register a new kind: add a DailyPageDef here AND a compute function with the
 * same `kind` key in ./compute.ts. See ./index.ts for the full API.
 */
import type { DailyLang } from './types';
import { monthKey, periodKeyOf, type DailyPeriod } from './dates';
import { PANCHANG_CITY_SLUGS, HINDI_PANCHANG_SLUGS } from '../seo/panchangSlugs';

export interface DailyPageDef {
  /** Folder name under /daily/ (and the key in DAILY_COMPUTERS). */
  kind: string;
  lang: DailyLang;
  /** Every slug that gets a page (and a precomputed JSON file per month). */
  slugs: readonly string[];
  /** Canonical route for a slug, no trailing slash (e.g. "/rashifal/mesh/today"). */
  path: (slug: string) => string;
  /**
   * "Data + render" variant (compact precompute): instead of storing the finished
   * DailyEntry per page, the build stores small per-day DATA in
   * /daily/<data.kind>/<data.slug(slug)>/<YYYY-MM>.json ({ data: { [date]: … } }) —
   * one file can serve many pages (e.g. one sky for all 12 rashis) — and the entry is
   * built from it by the pure template DAILY_TEMPLATES[kind] (./templates.ts), the same
   * function in the Worker and the browser. Omit for the original "finished entries" files.
   */
  data?: {
    kind: string;
    slug: (pageSlug: string) => string;
    /**
     * Batch 8 — a multi-day page (weekly / monthly / yearly view): the data changes once
     * per period, so it is stored ONCE per period, keyed by its period key (week → its
     * Monday, month → YYYY-MM, year → YYYY), in a file named after that key:
     * /daily/<data.kind>/<data.slug>/<period key>.json. Omit for one-entry-per-day data.
     */
    period?: DailyPeriod;
  };
}

/** Vedic rashi slugs (English pages) — same set the Worker validates for /rashifal/:rashi. */
export const RASHI_SLUGS = ['mesh', 'vrishabh', 'mithun', 'kark', 'simha', 'kanya', 'tula', 'vrishchik', 'dhanu', 'makar', 'kumbh', 'meen'] as const;
/** Legacy Hindi-page slugs (/hi/rashifal/:rashi), index-aligned with RASHI_SLUGS. */
export const RASHI_SLUGS_HI = ['mesha', 'vrisha', 'mithuna', 'karka', 'simha', 'kanya', 'tula', 'vrischika', 'dhanu', 'makara', 'kumbha', 'meena'] as const;
/** Western (tropical) sun-sign slugs, index-aligned (0 = Aries). */
export const SUN_SIGN_SLUGS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'] as const;

/** One shared data file for every page of a kind (e.g. the day's sky for all 12 signs). */
const ALL = () => 'all';
/** Weekly / monthly / yearly rashifal: one sky per period for all 12 rashis. */
const PERIOD = (p: DailyPeriod) => ({ kind: 'rashifal-period', slug: () => p, period: p });

/** Panchang pages: one data file per city ('index' pages show Delhi). */
const CITY = (s: string) => (s === 'index' ? 'delhi' : s);

/** W7 — the 50 Panchang cities plus 'index' (the /panchang, /rahu-kaal, /choghadiya index pages). */
export const PANCHANG_DAILY_SLUGS: readonly string[] = ['index', ...PANCHANG_CITY_SLUGS];
/** W7 — Hindi Panchang pages: the index + the 10 Hindi cities. */
export const PANCHANG_HI_DAILY_SLUGS: readonly string[] = ['index', ...HINDI_PANCHANG_SLUGS];
const panchangPath = (base: string) => (s: string) => (s === 'index' ? `/${base}` : `/${base}/${s}`);

export const DAILY_PAGES: DailyPageDef[] = [
  // W1 — Vedic daily rashifal (English), at the existing /rashifal/:rashi/today URL.
  { kind: 'rashifal', lang: 'en', slugs: RASHI_SLUGS, path: s => `/rashifal/${s}/today`, data: { kind: 'vedic-sky', slug: ALL } },
  // W1 — Vedic daily rashifal (Hindi), at the existing /hi/rashifal/:rashi URL.
  { kind: 'rashifal-hi', lang: 'hi', slugs: RASHI_SLUGS_HI, path: s => `/hi/rashifal/${s}`, data: { kind: 'vedic-sky', slug: ALL } },
  // Batch 8 — weekly (Mon–Sun) / monthly / yearly Vedic rashifal at the existing
  // /rashifal/:rashi/:period URLs, so the period's dates and text are current between deploys.
  { kind: 'rashifal-week', lang: 'en', slugs: RASHI_SLUGS, path: s => `/rashifal/${s}/week`, data: PERIOD('week') },
  { kind: 'rashifal-month', lang: 'en', slugs: RASHI_SLUGS, path: s => `/rashifal/${s}/month`, data: PERIOD('month') },
  { kind: 'rashifal-year', lang: 'en', slugs: RASHI_SLUGS, path: s => `/rashifal/${s}/year`, data: PERIOD('year') },
  // W2 — Western (tropical) daily horoscope, extending /zodiac/:sign with /today.
  { kind: 'horoscope', lang: 'en', slugs: SUN_SIGN_SLUGS, path: s => `/zodiac/${s}/today`, data: { kind: 'western-sky', slug: ALL } },
  // W7 — Panchang / Rahu Kaal / Choghadiya by city (50 cities + the index page, which shows Delhi).
  { kind: 'panchang', lang: 'en', slugs: PANCHANG_DAILY_SLUGS, path: panchangPath('panchang'), data: { kind: 'panchang-day', slug: CITY } },
  { kind: 'rahu-kaal', lang: 'en', slugs: PANCHANG_DAILY_SLUGS, path: panchangPath('rahu-kaal'), data: { kind: 'panchang-day', slug: CITY } },
  { kind: 'choghadiya', lang: 'en', slugs: PANCHANG_DAILY_SLUGS, path: panchangPath('choghadiya'), data: { kind: 'panchang-day', slug: CITY } },
  // W7 — Hindi Panchang (/hi/panchang + 10 cities), same per-city data as the English pages.
  { kind: 'panchang-hi', lang: 'hi', slugs: PANCHANG_HI_DAILY_SLUGS, path: s => (s === 'index' ? '/hi/panchang' : `/hi/panchang/${s}`), data: { kind: 'panchang-day', slug: CITY } },
  // Batch 10 — monthly Panchang calendar (New Delhi; other cities / months are computed in
  // the browser), "Planets today" and "Moon phase today": one small shared file per month.
  { kind: 'panchang-calendar', lang: 'en', slugs: ['index'], path: () => '/panchang-calendar', data: { kind: 'panchang-month', slug: () => 'delhi', period: 'month' } },
  { kind: 'planets-today', lang: 'en', slugs: ['index'], path: () => '/planets-today', data: { kind: 'planet-day', slug: ALL } },
  { kind: 'moon-phase', lang: 'en', slugs: ['index'], path: () => '/moon-phase', data: { kind: 'moon-day', slug: ALL } },
];

let routeMap: Map<string, { def: DailyPageDef; slug: string }> | null = null;

function buildMap(): Map<string, { def: DailyPageDef; slug: string }> {
  const m = new Map<string, { def: DailyPageDef; slug: string }>();
  for (const def of DAILY_PAGES) for (const slug of def.slugs) m.set(def.path(slug), { def, slug });
  return m;
}

/** Match a request pathname (with or without trailing slash) to a daily page, else null. */
export function matchDailyRoute(pathname: string): { def: DailyPageDef; slug: string } | null {
  if (!routeMap) routeMap = buildMap();
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return routeMap.get(p) ?? null;
}

/** All daily routes (for the prerender list / sitemap checks in tests). */
export function allDailyRoutes(): string[] {
  return DAILY_PAGES.flatMap(d => d.slugs.map(s => d.path(s)));
}

/** Public URL of one month's precomputed JSON. */
export function dailyJsonPath(kind: string, slug: string, month: string): string {
  return `/daily/${kind}/${slug}/${month}.json`;
}

/** Public URL of the month file a page reads: its shared DATA file when the kind uses
 *  the data + render variant, else its own finished-entries file. `fileKey` is the
 *  file name — dailyFileKey(def, date). */
export function dailyFilePath(def: DailyPageDef, slug: string, fileKey: string): string {
  return def.data ? dailyJsonPath(def.data.kind, def.data.slug(slug), fileKey) : dailyJsonPath(def.kind, slug, fileKey);
}

/** Name of the file holding a date's data: YYYY-MM, or the period key for period kinds. */
export function dailyFileKey(def: DailyPageDef, date: string): string {
  return def.data?.period ? periodKeyOf(def.data.period, date) : monthKey(date);
}

/** Key of a date's value inside that file's `data`: the date, or the period key. */
export function dailyDataKey(def: DailyPageDef, date: string): string {
  return def.data?.period ? periodKeyOf(def.data.period, date) : date;
}

/** Test/extension hook: forget the cached route map after DAILY_PAGES changes. */
export function resetDailyRouteCache(): void {
  routeMap = null;
}
