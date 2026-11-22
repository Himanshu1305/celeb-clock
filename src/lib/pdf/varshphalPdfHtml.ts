/**
 * B18 — free Varshphal PDF (print) HTML, built client-side from the /api/varshphal response
 * and printed through the browser's print dialog (printHtmlViaIframe) — same mechanism and
 * print rules as the free Kundali PDF (kundaliPdfHtml.ts): A4, @page margin 0, system fonts,
 * ligatures off, symbol glyphs followed by U+FE0E. Colours come from palette.ts / ui only.
 */
import { kundaliChartSvg } from '../vedic/chartSvg';
import { TEXT_VS } from './printHtml';
import { palette, ui } from '../../theme/palette';
import type { VarshphalResult } from '../vedic/varshphal';
import type { Outlook } from '../vedic/varshphalOutlook';
import { type Lang, pName, sName, toneLabel, HOUSE_THEME } from '../vedic/varshphalLabels';

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const deg = (lon: number) => { const d = ((lon % 30) + 30) % 30; let w = Math.floor(d); let m = Math.round((d - w) * 60); if (m === 60) { w += 1; m = 0; } return `${w}°${String(m).padStart(2, '0')}′`; };

export interface VarshphalPdfMeta { name?: string; dob: string; time: string; place: string; castPlace?: string; fmtDate: (iso: string) => string; sahamLabel: (key: string) => string }

export function buildVarshphalPdfHtml(r: VarshphalResult, o: Outlook, lang: Lang, meta: VarshphalPdfMeta): string {
  const hi = lang === 'hi';
  const t = (en: string, h: string) => (hi ? h : en);
  const P = (p: string) => pName(p, lang);
  const title = meta.name ? t(`${meta.name}’s Varshphal ${r.year}`, `${meta.name} का वर्षफल ${r.year}`) : t(`Varshphal ${r.year}`, `वर्षफल ${r.year}`);
  const chart = kundaliChartSvg({
    lagnaSignIndex: r.lagna.sign + 1,
    planets: r.planets.map(p => ({ name: p.name, house: p.house, signIndex: p.sign + 1 })),
    style: 'north', label: t('annual chart', 'वर्ष कुंडली'),
  });
  const vp = r.varshaPravesh;
  const star = `✦${TEXT_VS}`;
  const rows = r.planets.map(p => `<tr><td>${esc(P(p.name))}${p.retrograde && p.name !== 'Rahu' && p.name !== 'Ketu' ? ' (R)' : ''}</td><td>${esc(sName(p.sign, lang))}</td><td class="num">${deg(p.longitude)}</td><td class="num">${p.house}</td><td class="num">${(r.panchaVargiya as Record<string, { vimshopaka: number }>)[p.name]?.vimshopaka.toFixed(1) ?? '—'}</td></tr>`).join('');
  const blocks = o.blocks.map(b => `<div class="blk"><h3>${esc(b.title)} — <span>${esc(toneLabel(b.tone, lang))}</span></h3><p><b>${t('Impact', 'असर')}:</b> ${esc(b.impact)}</p><p><b>${t('Why', 'कारण')}:</b> ${esc(b.reason)}</p><p><b>${t('What to do', 'क्या करें')}:</b> ${esc(b.todo)}</p></div>`).join('');
  const months = o.months.map(m => `<tr><td>${esc(P(m.lord))}</td><td class="num">${esc(meta.fmtDate(m.start))} – ${esc(meta.fmtDate(m.end))}</td><td>${esc(toneLabel(m.tone, lang))}</td><td>${esc(m.impact)}</td></tr>`).join('');
  const sahams = r.sahams.map(s => `<tr><td>${esc(meta.sahamLabel(s.key))}</td><td>${esc(sName(s.sign, lang))} ${deg(s.longitude)}</td><td class="num">${s.house}</td><td>${esc(HOUSE_THEME[lang][s.house])}</td></tr>`).join('');
  const windows = o.bestWindows.map(w => `<li>${esc(meta.fmtDate(w.start))} – ${esc(meta.fmtDate(w.end))} (${esc(P(w.lord))}): ${esc(w.goodFor)}</li>`).join('');

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${esc(title)} — BornClock</title>
<style>
  @page { size: A4; margin: 0; }
  :root { --ink:${palette.navy}; --soft:${palette.inkSoft}; --muted:${ui.reportMuted}; --line:${palette.lineBlue}; --panel:${palette.mist}; --navy:${palette.blueDark}; --gold:${ui.goldBronze}; }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  html, body { background: ${palette.paper}; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Noto Sans Devanagari", "Mangal", sans-serif; color: var(--ink); font-size: 11.5px; line-height: 1.5; font-variant-ligatures: none; }
  .page { padding: 12mm 14mm; }
  h1 { font-size: 22px; color: var(--navy); }
  .sub { color: var(--muted); font-size: 11px; margin-top: 2px; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--navy); border-bottom: 1.5px solid var(--gold); padding-bottom: 4px; margin: 14px 0 6px; break-after: avoid; }
  h3 { font-size: 12px; color: var(--navy); margin-bottom: 2px; } h3 span { color: var(--soft); font-weight: 600; }
  .kvs { display: flex; flex-wrap: wrap; gap: 6px 22px; margin-top: 10px; padding: 10px 12px; background: var(--panel); border-radius: 6px; }
  .kv span { display: block; font-size: 9px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); } .kv strong { font-size: 12px; }
  .top { display: flex; gap: 16px; align-items: flex-start; } .top svg { width: 70mm; height: 70mm; flex: none; }
  table.grid { width: 100%; border-collapse: collapse; font-size: 10.5px; }
  table.grid th { text-align: left; font-size: 9px; text-transform: uppercase; color: var(--muted); border-bottom: 1.5px solid var(--navy); padding: 3px 5px; }
  table.grid td { padding: 3px 5px; border-bottom: 1px solid var(--line); vertical-align: top; }
  tr, .blk { break-inside: avoid; page-break-inside: avoid; }
  .blk { margin: 6px 0 8px; } .blk p { color: var(--soft); }
  .num { white-space: nowrap; }
  .note { color: var(--muted); font-size: 9.5px; margin-top: 8px; }
</style></head><body><div class="page">
  <h1>${star} ${esc(title)}</h1>
  <p class="sub">${esc(meta.dob)} · ${esc(meta.time)} · ${esc(meta.place)}${meta.castPlace ? ` · ${t('cast for', 'स्थान')}: ${esc(meta.castPlace)}` : ''}</p>
  <div class="kvs">
    <div class="kv"><span>${t('Varsha Pravesh', 'वर्ष प्रवेश')}</span><strong>${esc(meta.fmtDate(vp.utc))} · ${esc(vp.localTime)} (${esc(vp.offset)})</strong></div>
    <div class="kv"><span>${t('Annual Lagna', 'वर्ष लग्न')}</span><strong>${esc(sName(r.lagna.sign, lang))} ${deg(r.lagna.longitude)}</strong></div>
    <div class="kv"><span>${t('Muntha', 'मुंथा')}</span><strong>${esc(sName(r.muntha.sign, lang))} · ${t('house', 'भाव')} ${r.muntha.house}</strong></div>
    <div class="kv"><span>${t('Lord of the year', 'वर्षेश')}</span><strong>${esc(P(r.varshesh.planet))}</strong></div>
  </div>
  <h2>${t('Annual chart', 'वर्ष कुंडली')}</h2>
  <div class="top">${chart}<table class="grid"><thead><tr><th>${t('Planet', 'ग्रह')}</th><th>${t('Sign', 'राशि')}</th><th>${t('Degree', 'अंश')}</th><th>${t('House', 'भाव')}</th><th>${t('Strength /20', 'बल /20')}</th></tr></thead><tbody>${rows}</tbody></table></div>
  <h2>${esc(o.headline)}</h2>
  ${blocks}
  ${windows ? `<h2>${t('Best windows', 'सबसे अनुकूल अवधियाँ')}</h2><ul style="padding-left:16px">${windows}</ul>` : ''}
  <h2>${t('Month by month (Mudda dasha)', 'महीनेवार (मुद्दा दशा)')}</h2>
  <table class="grid"><thead><tr><th>${t('Period', 'दशा')}</th><th>${t('Dates', 'तिथियाँ')}</th><th>${t('Tone', 'स्वर')}</th><th>${t('What it means', 'अर्थ')}</th></tr></thead><tbody>${months}</tbody></table>
  <h2>${t('Sahams', 'सहम')}</h2>
  <table class="grid"><thead><tr><th>${t('Saham', 'सहम')}</th><th>${t('Position', 'स्थिति')}</th><th>${t('House', 'भाव')}</th><th>${t('Area', 'क्षेत्र')}</th></tr></thead><tbody>${sahams}</tbody></table>
  <p class="note">${t('Tajik annual chart, Lahiri sidereal (true Lahiri, as AstroSage). A guide to the year’s tendencies — not fixed events, not medical, legal or financial advice.', 'ताजिक वर्ष कुंडली, लाहिड़ी अयनांश। यह वर्ष की प्रवृत्तियों का मार्गदर्शन है — निश्चित घटनाएँ नहीं, और न ही चिकित्सा, कानूनी या वित्तीय सलाह।')} · bornclock.com/${hi ? 'hi/' : ''}varshphal/</p>
</div></body></html>`;
}
