// Batch 10 — the document language of a route, shared by the client (<html lang> via
// Helmet), the prerender (scripts/prerender.mjs) and the Worker (functions/_worker.ts).
// Plain JS so node scripts and the Worker can import it without a TS step.
//
// Hindi pages: everything under /hi/ (rashifal, panchang, kundli-milan, sade-sati, upay,
// numerology, life expectancy …) and the legacy "-hindi" routes (/biological-age-hindi).

/** @param {string} pathname @returns {'hi' | 'en'} */
export function pageLangForPath(pathname) {
  const p = String(pathname || '/').split(/[?#]/)[0];
  if (p === '/hi' || p.startsWith('/hi/')) return 'hi';
  if (/-hindi\/?$/.test(p)) return 'hi';
  return 'en';
}

/** Set (or add) the lang attribute on the document's <html> tag.
 *  @param {string} html @param {'hi' | 'en'} lang @returns {string} */
export function withHtmlLang(html, lang) {
  return String(html).replace(/<html\b([^>]*)>/i, (_m, attrs) => {
    const rest = String(attrs).replace(/\s+lang=("[^"]*"|'[^']*'|[^\s>]+)/i, '');
    return `<html lang="${lang}"${rest}>`;
  });
}
