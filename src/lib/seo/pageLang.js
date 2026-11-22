// Batch 10 — the document language of a route, shared by the client (<html lang> via
// Helmet), the prerender (scripts/prerender.mjs) and the Worker (functions/_worker.ts).
// Plain JS so node scripts and the Worker can import it without a TS step.
//
// Hindi pages: everything under /hi/ (rashifal, panchang, kundli-milan, sade-sati, upay,
// numerology, life expectancy …) and the legacy "-hindi" routes (/biological-age-hindi).

/** B18: the regional languages (mirror of LANG_CODES in src/lib/lang/langs.js — a test
 *  keeps them equal; duplicated here so this tiny module stays import-free). */
export const REGIONAL_LANGS = ['ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'];

/** @param {string} pathname @returns {string} 'en' | 'hi' | a regional code */
export function pageLangForPath(pathname) {
  const p = String(pathname || '/').split(/[?#]/)[0];
  if (p === '/hi' || p.startsWith('/hi/')) return 'hi';
  const m = p.match(/^\/([a-z]{2})(?:\/|$)/);
  if (m && REGIONAL_LANGS.includes(m[1])) return m[1];
  if (/-hindi\/?$/.test(p)) return 'hi';
  return 'en';
}

/** Set (or add) the lang attribute on the document's <html> tag.
 *  @param {string} html @param {string} lang @returns {string} */
export function withHtmlLang(html, lang) {
  return String(html).replace(/<html\b([^>]*)>/i, (_m, attrs) => {
    const rest = String(attrs).replace(/\s+lang=("[^"]*"|'[^']*'|[^\s>]+)/i, '');
    return `<html lang="${lang}"${rest}>`;
  });
}
