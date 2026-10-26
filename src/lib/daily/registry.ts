/**
 * Registry of daily-changing page kinds — ROUTES ONLY (no engine imports), so the
 * Cloudflare Worker can import it cheaply. The matching compute functions live in
 * ./compute.ts (heavy; build script + browser fallback only).
 *
 * To register a new kind: add a DailyPageDef here AND a compute function with the
 * same `kind` key in ./compute.ts. See ./index.ts for the full API.
 */
import type { DailyLang } from './types';
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
  data?: { kind: string; slug: (pageSlug: string) => string };
}

/** Vedic rashi slugs (English pages) — same set the Worker validates for /rashifal/:rashi. */
export const RASHI_SLUGS = ['mesh', 'vrishabh', 'mithun', 'kark', 'simha', 'kanya', 'tula', 'vrishchik', 'dhanu', 'makar', 'kumbh', 'meen'] as const;
/** Legacy Hindi-page slugs (/hi/rashifal/:rashi), index-aligned with RASHI_SLUGS. */
export const RASHI_SLUGS_HI = ['mesha', 'vrisha', 'mithuna', 'karka', 'simha', 'kanya', 'tula', 'vrischika', 'dhanu', 'makara', 'kumbha', 'meena'] as const;
/** Western (tropical) sun-sign slugs, index-aligned (0 = Aries). */
export const SUN_SIGN_SLUGS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'] as const;

/** One shared data file for every page of a kind (e.g. the day's sky for all 12 signs). */
const ALL = () => 'all';
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
  // W2 — Western (tropical) daily horoscope, extending /zodiac/:sign with /today.
  { kind: 'horoscope', lang: 'en', slugs: SUN_SIGN_SLUGS, path: s => `/zodiac/${s}/today`, data: { kind: 'western-sky', slug: ALL } },
  // W7 — Panchang / Rahu Kaal / Choghadiya by city (50 cities + the index page, which shows Delhi).
  { kind: 'panchang', lang: 'en', slugs: PANCHANG_DAILY_SLUGS, path: panchangPath('panchang'), data: { kind: 'panchang-day', slug: CITY } },
  { kind: 'rahu-kaal', lang: 'en', slugs: PANCHANG_DAILY_SLUGS, path: panchangPath('rahu-kaal'), data: { kind: 'panchang-day', slug: CITY } },
  { kind: 'choghadiya', lang: 'en', slugs: PANCHANG_DAILY_SLUGS, path: panchangPath('choghadiya'), data: { kind: 'panchang-day', slug: CITY } },
  // W7 — Hindi Panchang (/hi/panchang + 10 cities), same per-city data as the English pages.
  { kind: 'panchang-hi', lang: 'hi', slugs: PANCHANG_HI_DAILY_SLUGS, path: s => (s === 'index' ? '/hi/panchang' : `/hi/panchang/${s}`), data: { kind: 'panchang-day', slug: CITY } },
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
 *  the data + render variant, else its own finished-entries file. */
export function dailyFilePath(def: DailyPageDef, slug: string, month: string): string {
  return def.data ? dailyJsonPath(def.data.kind, def.data.slug(slug), month) : dailyJsonPath(def.kind, slug, month);
}

/** Test/extension hook: forget the cached route map after DAILY_PAGES changes. */
export function resetDailyRouteCache(): void {
  routeMap = null;
}
