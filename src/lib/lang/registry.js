// @ts-check
/**
 * B18 — the regional languages with their vocabulary packs (titles for the prerender and
 * the pages). Route data lives in ./langs.js (no vocabulary, safe for every bundle).
 */
import ta from './vocab/ta.js';
import te from './vocab/te.js';
import bn from './vocab/bn.js';
import mr from './vocab/mr.js';
import gu from './vocab/gu.js';
import kn from './vocab/kn.js';
import ml from './vocab/ml.js';
import pa from './vocab/pa.js';

import { describePath, pathFor } from './langs.js';
export * from './langs.js';

/** @typedef {import('./types').LangCode} LangCode */
/** @typedef {import('./types').LangVocab} LangVocab */

/** @type {Record<LangCode, LangVocab>} */
export const VOCAB = { ta, te, bn, mr, gu, kn, ml, pa };

/** Static title / description / H1 of a regional-language route, else null.
 * @param {string} route @returns {import('./types').MetaText | null} */
export function langMetaFor(route) {
  const h = describePath(route);
  if (!h || h.lang === 'en' || h.lang === 'hi') return null;
  const own = pathFor(h.desc, h.lang);
  const norm = route.length > 1 ? route.replace(/\/+$/, '') : route;
  if (own !== norm) return null;
  const v = VOCAB[/** @type {LangCode} */ (h.lang)];
  const d = h.desc;
  if (d.page === 'landing') return v.meta.landing;
  if (d.page === 'rashifalHub') return v.meta.rashifalHub;
  if (d.page === 'rashifal') return v.meta.rashifal(v.rashis[d.rashi ?? 0]);
  if (d.page === 'yearHub') return v.meta.yearHub;
  if (d.page === 'year') return v.meta.year(v.rashis[d.rashi ?? 0]);
  if (d.page === 'panchang') return v.meta.panchang(v.cities[d.city || 'delhi'], !d.city);
  return v.meta.kundali;
}

