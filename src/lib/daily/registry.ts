/**
 * Registry of daily-changing page kinds — ROUTES ONLY (no engine imports), so the
 * Cloudflare Worker can import it cheaply. The matching compute functions live in
 * ./compute.ts (heavy; build script + browser fallback only).
 *
 * To register a new kind: add a DailyPageDef here AND a compute function with the
 * same `kind` key in ./compute.ts. See ./index.ts for the full API.
 */
import type { DailyLang } from './types';
import { PANCHANG_CITY_SLUGS } from '../seo/panchangSlugs';

export interface DailyPageDef {
  /** Folder name under /daily/ (and the key in DAILY_COMPUTERS). */
  kind: string;
  lang: DailyLang;
  /** Every slug that gets a page (and a precomputed JSON file per month). */
  slugs: readonly string[];
  /** Canonical route for a slug, no trailing slash (e.g. "/rashifal/mesh/today"). */
  path: (slug: string) => string;
}

/** Vedic rashi slugs (English pages) — same set the Worker validates for /rashifal/:rashi. */
export const RASHI_SLUGS = ['mesh', 'vrishabh', 'mithun', 'kark', 'simha', 'kanya', 'tula', 'vrishchik', 'dhanu', 'makar', 'kumbh', 'meen'] as const;
/** Legacy Hindi-page slugs (/hi/rashifal/:rashi), index-aligned with RASHI_SLUGS. */
export const RASHI_SLUGS_HI = ['mesha', 'vrisha', 'mithuna', 'karka', 'simha', 'kanya', 'tula', 'vrischika', 'dhanu', 'makara', 'kumbha', 'meena'] as const;
/** Western (tropical) sun-sign slugs, index-aligned (0 = Aries). */
export const SUN_SIGN_SLUGS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'] as const;

/** W7 — the 50 Panchang cities plus 'index' (the /panchang, /rahu-kaal, /choghadiya index pages). */
export const PANCHANG_DAILY_SLUGS: readonly string[] = ['index', ...PANCHANG_CITY_SLUGS];
const panchangPath = (base: string) => (s: string) => (s === 'index' ? `/${base}` : `/${base}/${s}`);

export const DAILY_PAGES: DailyPageDef[] = [
  // W1 — Vedic daily rashifal (English), at the existing /rashifal/:rashi/today URL.
  { kind: 'rashifal', lang: 'en', slugs: RASHI_SLUGS, path: s => `/rashifal/${s}/today` },
  // W1 — Vedic daily rashifal (Hindi), at the existing /hi/rashifal/:rashi URL.
  { kind: 'rashifal-hi', lang: 'hi', slugs: RASHI_SLUGS_HI, path: s => `/hi/rashifal/${s}` },
  // W2 — Western (tropical) daily horoscope, extending /zodiac/:sign with /today.
  { kind: 'horoscope', lang: 'en', slugs: SUN_SIGN_SLUGS, path: s => `/zodiac/${s}/today` },
  // W7 — Panchang / Rahu Kaal / Choghadiya by city (50 cities + the index page, which shows Delhi).
  { kind: 'panchang', lang: 'en', slugs: PANCHANG_DAILY_SLUGS, path: panchangPath('panchang') },
  { kind: 'rahu-kaal', lang: 'en', slugs: PANCHANG_DAILY_SLUGS, path: panchangPath('rahu-kaal') },
  { kind: 'choghadiya', lang: 'en', slugs: PANCHANG_DAILY_SLUGS, path: panchangPath('choghadiya') },
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

/** Test/extension hook: forget the cached route map after DAILY_PAGES changes. */
export function resetDailyRouteCache(): void {
  routeMap = null;
}
