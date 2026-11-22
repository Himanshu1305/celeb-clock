// @ts-check
/**
 * B18 — the regional-language registry: ONE list of languages, their URL segments and
 * Panchang cities, the route builders and the equivalent-page mapping. No vocabulary imports (this file is in
 * every page's header bundle via the language switcher); titles live in ./registry.js. Plain ES module so the app,
 * vitest, the Cloudflare Worker (route validation) and the Node prerender / sitemap
 * scripts all read the same data (like src/lib/year2027/meta.js).
 *
 * Adding a language = a row here + src/lib/lang/vocab/<code>.js + src/lib/lang/copy/<code>.ts.
 *
 * Equivalent pages across English / Hindi / the regional languages are described by a
 * small page descriptor ({ page, rashi?, city? }) so the hreflang cluster, the language
 * switcher and the tests share one mapping.
 */
/** @typedef {import('./types').LangCode} LangCode */
/** @typedef {import('./types').LangVocab} LangVocab */
/** @typedef {{ code: LangCode; english: string; native: string; script: string; seg: { rashifal: string; panchang: string; kundali: string }; cities: string[] }} LangDef */

/** English (and every regional language's) rashi slugs, Mesha = 0. */
export const LANG_RASHI_SLUGS = ['mesh', 'vrishabh', 'mithun', 'kark', 'simha', 'kanya', 'tula', 'vrishchik', 'dhanu', 'makar', 'kumbh', 'meen'];
/** Legacy Hindi slugs (= RASHI_SLUGS_HI, src/lib/daily/registry.ts). */
const HI_RASHI_SLUGS = ['mesha', 'vrisha', 'mithuna', 'karka', 'simha', 'kanya', 'tula', 'vrischika', 'dhanu', 'makara', 'kumbha', 'meena'];
/** Hindi Panchang cities (= HINDI_PANCHANG_SLUGS, src/lib/seo/panchangSlugs.ts). */
const HI_PANCHANG_CITIES = ['delhi', 'mumbai', 'bengaluru', 'kolkata', 'chennai', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow'];

/** @type {LangDef[]} */
export const LANGS = [
  { code: 'ta', english: 'Tamil', native: 'தமிழ்', script: 'Tamil', seg: { rashifal: 'rasi-palan', panchang: 'panchangam', kundali: 'jathaga-porutham' }, cities: ['chennai', 'coimbatore', 'madurai'] },
  { code: 'te', english: 'Telugu', native: 'తెలుగు', script: 'Telugu', seg: { rashifal: 'rasi-phalalu', panchang: 'panchangam', kundali: 'jataka-pontana' }, cities: ['hyderabad', 'visakhapatnam', 'vijayawada'] },
  { code: 'bn', english: 'Bengali', native: 'বাংলা', script: 'Bengali', seg: { rashifal: 'rashifal', panchang: 'panjika', kundali: 'jotok-bichar' }, cities: ['kolkata', 'howrah'] },
  { code: 'mr', english: 'Marathi', native: 'मराठी', script: 'Devanagari', seg: { rashifal: 'rashi-bhavishya', panchang: 'panchang', kundali: 'kundali-milan' }, cities: ['mumbai', 'pune', 'nagpur'] },
  { code: 'gu', english: 'Gujarati', native: 'ગુજરાતી', script: 'Gujarati', seg: { rashifal: 'rashifal', panchang: 'panchang', kundali: 'kundali-milan' }, cities: ['ahmedabad', 'surat', 'vadodara'] },
  { code: 'kn', english: 'Kannada', native: 'ಕನ್ನಡ', script: 'Kannada', seg: { rashifal: 'rashi-bhavishya', panchang: 'panchanga', kundali: 'jataka-hondanike' }, cities: ['bengaluru', 'hubballi-dharwad'] },
  { code: 'ml', english: 'Malayalam', native: 'മലയാളം', script: 'Malayalam', seg: { rashifal: 'rashiphalam', panchang: 'panchangam', kundali: 'jathaka-porutham' }, cities: ['kochi', 'thiruvananthapuram'] },
  { code: 'pa', english: 'Punjabi', native: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', seg: { rashifal: 'rashifal', panchang: 'panchang', kundali: 'kundali-milan' }, cities: ['amritsar', 'ludhiana', 'chandigarh'] },
];
/** @type {LangCode[]} */
export const LANG_CODES = LANGS.map(l => l.code);
/** @param {string} code @returns {LangDef | undefined} */
export const langDef = code => LANGS.find(l => l.code === code);

/** Paths (no trailing slash) of one language's pages. @param {LangDef} l */
export function langPaths(l) {
  const b = `/${l.code}`;
  return {
    landing: b,
    rashifalHub: `${b}/${l.seg.rashifal}`,
    /** @param {number} i */ rashifal: i => `${b}/${l.seg.rashifal}/${LANG_RASHI_SLUGS[i]}`,
    yearHub: `${b}/${l.seg.rashifal}-2027`,
    /** @param {number} i */ year: i => `${b}/${l.seg.rashifal}/${LANG_RASHI_SLUGS[i]}/2027`,
    /** @param {string | null} [city] */ panchang: city => (city ? `${b}/${l.seg.panchang}/${city}` : `${b}/${l.seg.panchang}`),
    kundali: `${b}/${l.seg.kundali}`,
  };
}

/** Every page of one language (prerender list + sitemap). @param {LangDef} l */
export function routesForLang(l) {
  const p = langPaths(l);
  return [
    p.landing,
    p.rashifalHub, ...LANG_RASHI_SLUGS.map((_, i) => p.rashifal(i)),
    p.yearHub, ...LANG_RASHI_SLUGS.map((_, i) => p.year(i)),
    p.panchang(null), ...l.cities.map(c => p.panchang(c)),
    p.kundali,
  ];
}
/** Every regional-language route. */
export function langRoutes() {
  return LANGS.flatMap(routesForLang);
}

/**
 * @typedef {{ page: 'landing' | 'rashifalHub' | 'rashifal' | 'yearHub' | 'year' | 'panchang' | 'kundali'; rashi?: number; city?: string | null }} PageDesc
 */

/** Describe a path (en / hi / regional) as an equivalent-page descriptor, else null.
 * @param {string} pathname @returns {{ lang: string; desc: PageDesc } | null} */
export function describePath(pathname) {
  const p = String(pathname || '/').split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  /** @type {RegExpMatchArray | null} */
  let m;
  const ri = (/** @type {string} */ s, /** @type {string[]} */ list) => list.indexOf(s);
  // English
  if (p === '/rashifal') return { lang: 'en', desc: { page: 'rashifalHub' } };
  if ((m = p.match(/^\/rashifal\/([a-z]+)\/today$/)) && ri(m[1], LANG_RASHI_SLUGS) >= 0) return { lang: 'en', desc: { page: 'rashifal', rashi: ri(m[1], LANG_RASHI_SLUGS) } };
  if (p === '/rashifal-2027') return { lang: 'en', desc: { page: 'yearHub' } };
  if ((m = p.match(/^\/rashifal\/([a-z]+)\/2027$/)) && ri(m[1], LANG_RASHI_SLUGS) >= 0) return { lang: 'en', desc: { page: 'year', rashi: ri(m[1], LANG_RASHI_SLUGS) } };
  if (p === '/panchang') return { lang: 'en', desc: { page: 'panchang', city: null } };
  if ((m = p.match(/^\/panchang\/([a-z-]+)$/))) return { lang: 'en', desc: { page: 'panchang', city: m[1] } };
  if (p === '/kundali-match') return { lang: 'en', desc: { page: 'kundali' } };
  // Hindi
  if (p === '/hi/rashifal') return { lang: 'hi', desc: { page: 'rashifalHub' } };
  if ((m = p.match(/^\/hi\/rashifal\/([a-z]+)$/)) && ri(m[1], HI_RASHI_SLUGS) >= 0) return { lang: 'hi', desc: { page: 'rashifal', rashi: ri(m[1], HI_RASHI_SLUGS) } };
  if (p === '/hi/rashifal-2027') return { lang: 'hi', desc: { page: 'yearHub' } };
  if ((m = p.match(/^\/hi\/rashifal\/([a-z]+)\/2027$/)) && ri(m[1], HI_RASHI_SLUGS) >= 0) return { lang: 'hi', desc: { page: 'year', rashi: ri(m[1], HI_RASHI_SLUGS) } };
  if (p === '/hi/panchang') return { lang: 'hi', desc: { page: 'panchang', city: null } };
  if ((m = p.match(/^\/hi\/panchang\/([a-z-]+)$/))) return { lang: 'hi', desc: { page: 'panchang', city: m[1] } };
  if (p === '/hi/kundli-milan') return { lang: 'hi', desc: { page: 'kundali' } };
  // Regional
  for (const l of LANGS) {
    const b = `/${l.code}`;
    if (p !== b && !p.startsWith(b + '/')) continue;
    const q = langPaths(l);
    if (p === q.landing) return { lang: l.code, desc: { page: 'landing' } };
    if (p === q.rashifalHub) return { lang: l.code, desc: { page: 'rashifalHub' } };
    if (p === q.yearHub) return { lang: l.code, desc: { page: 'yearHub' } };
    if (p === q.kundali) return { lang: l.code, desc: { page: 'kundali' } };
    if (p === q.panchang(null)) return { lang: l.code, desc: { page: 'panchang', city: null } };
    const rest = p.slice(b.length + 1).split('/');
    if (rest[0] === l.seg.panchang && rest.length === 2) return { lang: l.code, desc: { page: 'panchang', city: rest[1] } };
    if (rest[0] === l.seg.rashifal && ri(rest[1], LANG_RASHI_SLUGS) >= 0) {
      if (rest.length === 2) return { lang: l.code, desc: { page: 'rashifal', rashi: ri(rest[1], LANG_RASHI_SLUGS) } };
      if (rest.length === 3 && rest[2] === '2027') return { lang: l.code, desc: { page: 'year', rashi: ri(rest[1], LANG_RASHI_SLUGS) } };
    }
    return null;
  }
  return null;
}

/** The path of a page descriptor in a language, or null when that language has no such page.
 * @param {PageDesc} d @param {string} lang @returns {string | null} */
export function pathFor(d, lang) {
  const r = d.rashi ?? 0;
  if (lang === 'en') {
    if (d.page === 'landing') return null;
    if (d.page === 'rashifalHub') return '/rashifal';
    if (d.page === 'rashifal') return `/rashifal/${LANG_RASHI_SLUGS[r]}/today`;
    if (d.page === 'yearHub') return '/rashifal-2027';
    if (d.page === 'year') return `/rashifal/${LANG_RASHI_SLUGS[r]}/2027`;
    if (d.page === 'panchang') return d.city ? (d.city === 'kochi' || d.city === 'thiruvananthapuram' ? null : `/panchang/${d.city}`) : '/panchang';
    return '/kundali-match';
  }
  if (lang === 'hi') {
    if (d.page === 'landing') return null;
    if (d.page === 'rashifalHub') return '/hi/rashifal';
    if (d.page === 'rashifal') return `/hi/rashifal/${HI_RASHI_SLUGS[r]}`;
    if (d.page === 'yearHub') return '/hi/rashifal-2027';
    if (d.page === 'year') return `/hi/rashifal/${HI_RASHI_SLUGS[r]}/2027`;
    if (d.page === 'panchang') return d.city ? (HI_PANCHANG_CITIES.includes(d.city) ? `/hi/panchang/${d.city}` : null) : '/hi/panchang';
    return '/hi/kundli-milan';
  }
  const l = langDef(lang);
  if (!l) return null;
  const q = langPaths(l);
  if (d.page === 'landing') return q.landing;
  if (d.page === 'rashifalHub') return q.rashifalHub;
  if (d.page === 'rashifal') return q.rashifal(r);
  if (d.page === 'yearHub') return q.yearHub;
  if (d.page === 'year') return q.year(r);
  if (d.page === 'panchang') return d.city ? (l.cities.includes(d.city) ? q.panchang(d.city) : null) : q.panchang(null);
  return q.kundali;
}

/** All languages the switcher / hreflang cover, in display order. */
export const ALL_LANGS = [{ code: 'en', native: 'English' }, { code: 'hi', native: 'हिन्दी' }, ...LANGS.map(l => ({ code: l.code, native: l.native }))];

/** Where the language switcher sends a reader of `pathname` who picks `lang`: the
 * equivalent page when it exists, else that language's landing page.
 * @param {string} pathname @param {string} lang @returns {string} */
export function switchTarget(pathname, lang) {
  const here = describePath(pathname);
  const eq = here ? pathFor(here.desc, lang) : null;
  if (eq) return eq;
  if (lang === 'en') return '/';
  if (lang === 'hi') return '/hi/rashifal';
  return `/${lang}`;
}

/** hreflang cluster (absolute, trailing slash) for a path in any of the languages; [] when
 * the path is not one of the equivalent pages. @param {string} pathname */
export function hreflangCluster(pathname) {
  const here = describePath(pathname);
  if (!here) return [];
  const SITE = 'https://bornclock.com';
  /** @type {Array<{ lang: string; url: string }>} */
  const out = [];
  for (const { code } of ALL_LANGS) {
    const p = pathFor(here.desc, code);
    if (p) out.push({ lang: code, url: `${SITE}${p}/` });
  }
  const en = out.find(x => x.lang === 'en');
  if (en) out.push({ lang: 'x-default', url: en.url });
  return out;
}

/** Document language of a regional path ('ta', …), else null. @param {string} pathname */
export function regionalLangOf(pathname) {
  const p = String(pathname || '/');
  const m = p.match(/^\/([a-z]{2})(?:\/|$)/);
  return m && LANG_CODES.includes(/** @type {LangCode} */ (m[1])) ? /** @type {LangCode} */ (m[1]) : null;
}

/** True when `pathname` (with or without trailing slash) is one of the regional pages.
 * @param {string} pathname */
export function isLangRoute(pathname) {
  const lang = regionalLangOf(pathname);
  if (!lang) return false;
  const h = describePath(pathname);
  if (!h || h.lang !== lang) return false;
  const p = String(pathname).split(/[?#]/)[0].replace(/\/+$/, '');
  return pathFor(h.desc, lang) === p;
}

/** React Router patterns of one language's pages (App.tsx builds its routes from these).
 * @param {LangDef} l @returns {Array<{ page: 'landing' | 'rashifalHub' | 'rashifal' | 'yearHub' | 'year' | 'panchang' | 'panchangCity' | 'kundali'; path: string }>} */
export function langRoutePatterns(l) {
  const q = langPaths(l);
  return [
    { page: 'landing', path: q.landing },
    { page: 'rashifalHub', path: q.rashifalHub },
    { page: 'rashifal', path: `${q.rashifalHub}/:rashi` },
    { page: 'yearHub', path: q.yearHub },
    { page: 'year', path: `${q.rashifalHub}/:rashi/2027` },
    { page: 'panchang', path: q.panchang(null) },
    { page: 'panchangCity', path: `${q.panchang(null)}/:city` },
    { page: 'kundali', path: q.kundali },
  ];
}
