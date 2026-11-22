/**
 * B18 — printable Lal Kitab Kundli (A4), built in the browser from the same Lal Kitab chart the
 * page shows and printed through printHtmlViaIframe — no server call, nothing stored. Same print
 * rules as the Kundali PDF (src/lib/pdf/kundaliPdfHtml.ts): a native table carries the running
 * header/footer, system fonts only, symbol glyphs in text presentation. The Hindi version lists
 * the common Devanagari system fonts first.
 */
import { kundaliChartSvg } from '../vedic/chartSvg';
import { TEXT_VS } from './printHtml';
import { palette } from '../../theme/palette';
import type { LkChart, LkVarshphal } from '../vedic/lalKitab/engine';
import {
  type Lang, planetName, reading, remedyFor, toneOf, rinText, TEVA_TEXT, DIGNITY_LABEL, label, houseTheme,
} from '../vedic/lalKitab/text';
import { REMEDY_DAYS } from '../vedic/lalKitab/tables';

const SITE_URL = 'https://bornclock.com';
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface LalKitabPdfMeta { name?: string; dob?: string; time?: string; place?: string; lang?: Lang; generatedAt?: Date }

export function buildLalKitabPdfHtml(chart: LkChart, varshphal: LkVarshphal | null, meta: LalKitabPdfMeta = {}): string {
  const lang: Lang = meta.lang === 'hi' ? 'hi' : 'en';
  const T = (en: string, hi: string) => (lang === 'hi' ? hi : en);
  const g = meta.generatedAt ?? new Date();
  const generated = `${g.getDate()} ${MONTHS[g.getMonth()]} ${g.getFullYear()}`;
  const name = (meta.name || '').trim();
  const title = name ? T(`${name}’s Lal Kitab Kundli`, `${name} की लाल किताब कुंडली`) : T('Lal Kitab Kundli', 'लाल किताब कुंडली');
  const star = `✦${TEXT_VS}`;
  const path = lang === 'hi' ? '/hi/lal-kitab' : '/lal-kitab';

  const details: Array<[string, string]> = [];
  if (name) details.push([T('Name', 'नाम'), name]);
  if (meta.dob) details.push([T('Date of birth', 'जन्म तिथि'), meta.dob]);
  if (meta.time) details.push([T('Time of birth', 'जन्म समय'), meta.time]);
  if (meta.place) details.push([T('Place of birth', 'जन्म स्थान'), meta.place]);

  const svg = kundaliChartSvg({
    lagnaSignIndex: 1, style: 'north', label: 'Lal Kitab chart',
    planets: chart.placements.map(p => ({ name: p.planet, house: p.house, signIndex: p.house })),
  });

  const badges = (p: LkChart['placements'][number]) => [
    p.pakkaGhar && label(DIGNITY_LABEL.pakka, lang), p.exalted && label(DIGNITY_LABEL.exalted, lang),
    p.debilitated && label(DIGNITY_LABEL.debilitated, lang), p.sleeping && label(DIGNITY_LABEL.sleeping, lang),
    p.kaayam && label(DIGNITY_LABEL.kaayam, lang), p.dharmi && label(DIGNITY_LABEL.dharmi, lang),
  ].filter(Boolean).join(', ') || '—';
  const rows = chart.placements.map(p => `<tr><td>${esc(planetName(p.planet, lang))}</td><td class="num">${p.house}</td><td>${esc(badges(p))}</td><td>${esc(reading(p.planet, p.house, lang))}</td></tr>`).join('');

  const rins = chart.rins.map(r => { const t = rinText(r.key, lang); return `<li><strong>${esc(t.name)}</strong> — ${esc(t.meaning)} <em>${T('Optional remedy', 'वैकल्पिक उपाय')}:</em> ${esc(t.remedy)}</li>`; }).join('');
  const tevas = (Object.keys(chart.teva) as Array<keyof LkChart['teva']>).filter(k => chart.teva[k]).map(k => `<li><strong>${esc(label(TEVA_TEXT[k].name, lang))}</strong> — ${esc(label(TEVA_TEXT[k].meaning, lang))}</li>`).join('');
  const care = chart.placements.filter(p => toneOf(p.planet, p.house) === 'care' || p.debilitated);
  const remedies = care.map(p => `<li><strong>${esc(planetName(p.planet, lang))} (${p.house})</strong> — ${esc(remedyFor(p.planet, p.house, lang))}</li>`).join('');
  const vp = varshphal ? `<div class="section"><h2>${T(`Varshphal — year ${varshphal.year} of life`, `वर्षफल — जीवन का ${varshphal.year}वाँ वर्ष`)}</h2>
    <table class="grid"><thead><tr><th>${T('Planet', 'ग्रह')}</th><th>${T('Birth house', 'जन्म का घर')}</th><th>${T('House this year', 'इस वर्ष का घर')}</th></tr></thead><tbody>
    ${varshphal.placements.map(p => `<tr><td>${esc(planetName(p.planet, lang))}</td><td class="num">${p.natalHouse}</td><td class="num">${p.yearHouse}</td></tr>`).join('')}</tbody></table></div>` : '';

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${esc(title)} — BornClock</title>
<style>
  @page { size: A4; margin: 0; }
  :root { --ink:${palette.navy}; --soft:${palette.inkSoft}; --muted:${palette.muted}; --line:${palette.lineBlue}; --navy:${palette.blueDark}; --gold:${palette.goldDeep}; }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body { font-family: ${lang === 'hi' ? '"Nirmala UI", "Noto Sans Devanagari", Mangal, ' : ''}-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: var(--ink); font-size: 11px; line-height: 1.5; font-variant-ligatures: ${lang === 'hi' ? 'normal' : 'none'}; }
  table.pt { width: 100%; border-collapse: collapse; }
  .pc { padding: 0 14mm; vertical-align: top; }
  thead .pc { padding-top: 10mm; } tfoot .pc { padding-bottom: 9mm; }
  .rh { display: flex; justify-content: space-between; border-bottom: 1px solid var(--line); padding-bottom: 6px; margin-bottom: 10px; font-size: 8.5px; letter-spacing: .1em; color: var(--muted); }
  .rf { border-top: 1px solid var(--line); padding-top: 6px; margin-top: 10px; font-size: 8.5px; color: var(--muted); text-align: center; }
  h1 { font-size: 22px; color: var(--navy); }
  h2 { font-size: 12px; color: var(--navy); border-bottom: 1.5px solid var(--gold); padding-bottom: 4px; margin-bottom: 6px; break-after: avoid; }
  .sub, .note { color: var(--muted); font-size: 9.5px; }
  .section { margin-top: 14px; break-inside: avoid; }
  .kvs { display: flex; flex-wrap: wrap; gap: 6px 22px; margin-top: 10px; }
  .kv span { display: block; font-size: 9px; color: var(--muted); }
  .chart { display: flex; gap: 16px; align-items: center; }
  .chart svg { width: 72mm; height: 72mm; flex: none; }
  table.grid { width: 100%; border-collapse: collapse; font-size: 10.5px; }
  table.grid th { text-align: left; font-size: 9px; color: var(--muted); border-bottom: 1.5px solid var(--navy); padding: 4px 6px; }
  table.grid td { padding: 4px 6px; border-bottom: 1px solid var(--line); vertical-align: top; }
  table.grid tr { break-inside: avoid; }
  .num { white-space: nowrap; }
  ul { padding-left: 16px; } li { margin-bottom: 4px; }
</style></head><body>
<table class="pt">
  <thead><tr><td class="pc"><div class="rh"><span><b>${star} BornClock</b> · ${T('Lal Kitab Kundli', 'लाल किताब कुंडली')}</span><span>bornclock.com${path}</span></div></td></tr></thead>
  <tfoot><tr><td class="pc"><div class="rf">BornClock · bornclock.com${path} · ${esc(generated)} · ${T('Lahiri sidereal · for reflection, not certainty', 'लाहिड़ी निरयण · चिंतन के लिए, निश्चितता नहीं')}</div></td></tr></tfoot>
  <tbody><tr><td class="pc">
  <h1 data-testid="lk-pdf-title">${esc(title)}</h1>
  <div class="sub">${T('Houses counted from your Lagna; house 1 is read as Aries, house 2 as Taurus … house 12 as Pisces.', 'घर आपके लग्न से गिने गए हैं; पहला घर मेष, दूसरा वृषभ … बारहवाँ मीन माना गया है।')}</div>
  ${details.length ? `<div class="kvs">${details.map(([k, v]) => `<div class="kv"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}</div>` : ''}
  <div class="section chart" data-testid="lk-pdf-chart">${svg}
    <p class="note">${T('North Indian style. The top-centre diamond is house 1; the small numbers are house numbers (= the fixed Lal Kitab signs, 1 Aries … 12 Pisces). Su Sun · Mo Moon · Ma Mars · Me Mercury · Ju Jupiter · Ve Venus · Sa Saturn · Ra Rahu · Ke Ketu.', 'उत्तर भारतीय शैली। ऊपर बीच का खाना पहला घर है; छोटे अंक घर-संख्या हैं (= लाल किताब की निश्चित राशियाँ, 1 मेष … 12 मीन)।')}</p></div>
  <div class="section"><h2>${T('Planets by house', 'घरों में ग्रह')}</h2>
    <table class="grid"><thead><tr><th>${T('Planet', 'ग्रह')}</th><th>${T('House', 'घर')}</th><th>${T('Status', 'स्थिति')}</th><th>${T('Reading', 'फल')}</th></tr></thead><tbody>${rows}</tbody></table></div>
  <div class="section"><h2>${T('Sleeping houses', 'सोये घर')}</h2><p>${chart.sleepingHouses.length ? chart.sleepingHouses.map(h => `${h} (${esc(houseTheme(h, lang))})`).join('; ') : T('None', 'कोई नहीं')}</p></div>
  <div class="section"><h2>${T('Rin (karmic debts)', 'ऋण')}</h2>${rins ? `<ul>${rins}</ul>` : `<p>${T('None of the nine Lal Kitab debts is indicated.', 'लाल किताब के नौ ऋणों में से कोई संकेत नहीं।')}</p>`}</div>
  ${tevas ? `<div class="section"><h2>${T('Chart type (teva)', 'टेवा का प्रकार')}</h2><ul>${tevas}</ul></div>` : ''}
  ${vp}
  <div class="section"><h2>${T('Simple remedies (optional)', 'सरल उपाय (वैकल्पिक)')}</h2>
    ${remedies ? `<ul>${remedies}</ul>` : `<p>${T('No placement here asks for a remedy.', 'यहाँ किसी स्थिति के लिए उपाय ज़रूरी नहीं।')}</p>`}
    <p class="note">${T(`Lal Kitab sources advise one remedy at a time, done daily between sunrise and sunset for ${REMEDY_DAYS.min}–${REMEDY_DAYS.max} days, restarting the count if a day is missed. Everything here is optional, free or near-free, and never guaranteed.`, `लाल किताब के स्रोत एक समय में एक उपाय, सूर्योदय से सूर्यास्त के बीच, लगातार ${REMEDY_DAYS.min}–${REMEDY_DAYS.max} दिन करने की सलाह देते हैं; कोई दिन छूटे तो गिनती फिर से। सब कुछ वैकल्पिक, मुफ़्त या लगभग मुफ़्त है, और कोई गारंटी नहीं।`)}</p></div>
  <div class="section note"><p>${star} BornClock — ${SITE_URL}${path}. ${T('A traditional Lal Kitab reading for reflection, rigorously computed from your birth chart (Lahiri sidereal) — not a prediction of specific events.', 'चिंतन के लिए पारंपरिक लाल किताब पाठ, आपकी जन्म कुंडली (लाहिड़ी निरयण) से सावधानी से गणना किया गया — किसी विशेष घटना की भविष्यवाणी नहीं।')}</p></div>
  </td></tr></tbody>
</table>
</body></html>`;
}
