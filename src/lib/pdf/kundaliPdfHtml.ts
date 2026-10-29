/**
 * Free Kundali PDF HTML (Growth P2-6; rebuilt in Batch 9b). A self-contained, printable
 * A4 document built from the /api/kundali response, printed client-side through the
 * browser's print dialog (printHtmlViaIframe) — no server call, no stored user data.
 *
 * Print rules reused from the Birthday Blueprint print path (ReportView.tsx pageStyle +
 * scripts/verify-print.mjs), which are known to work in Blink:
 *   • a native <table> with <thead>/<tfoot> carries the running header/footer, so they
 *     repeat on every printed page; @page margin is 0 and the cell padding is the margin;
 *   • system fonts only (web fonts caused glyph corruption in printed PDFs);
 *   • ligatures off; any symbol glyph is followed by U+FE0E (text presentation) so it
 *     prints as a monochrome glyph rather than a colour emoji.
 *
 * Contents: name (optional), birth details, D1 + D9 charts in the visitor's chosen style,
 * planet table (sign, degree, nakshatra-pada, house, retrograde), Lagna/Rashi/Nakshatra,
 * current Mahadasha/Antardasha with dates, Manglik summary, birth-time edge notes, and a
 * one-line plain-language explanation per section (taken from the shared term list,
 * src/lib/vedic/termDefinitions.ts, so the PDF and the TermTips say the same thing).
 *
 * English only: /kundali has no Hindi labels/toggle today (and Devanagari needs a font
 * the reader's system may not have for print).
 */
import type { ChartBasis } from '../vedic/chartBasis';
import { formatDegreeInSign } from '../vedic/formatDegree';
import { birthTimeEdgeNote, type BirthTimeEdge } from '../vedic/birthTimeEdgeNote';
import { getTermDef } from '../vedic/termDefinitions';
import { kundaliChartSvg } from '../vedic/chartSvg';
import { signLabel } from '../vedic/signLabel';
import { TEXT_VS } from './printHtml';
export { signLabel, TEXT_VS };

type VargaChart = { lagnaSignIndex: number; planets: Array<{ name: string; signIndex: number; house: number }> };

export interface KundaliPdfData {
  lagna?: { sign?: string; signIndex?: number; degrees?: number };
  rashi?: string | null;
  nakshatra?: { nakshatra?: string; pada?: number };
  dasha?: {
    mahadasha?: string; antardasha?: string;
    mahadasha_start?: string; mahadasha_end?: string;
    antardasha_start?: string; antardasha_end?: string;
  } | null;
  dashaTimeline?: Array<{ lord: string; start: string; end: string; antardashas?: Array<{ lord: string; start: string; end: string }> }>;
  planets?: Array<{ name: string; sign: string; signIndex?: number; house: number; longitude: number; retrograde?: boolean }>;
  doshas?: {
    mangalDosha?: { hasDosha?: boolean; severityLabel?: string; marsHouseFromLagna?: number; marsHouseFromMoon?: number; fromLagna?: boolean; fromMoon?: boolean; cancellations?: string[]; cancelled?: boolean };
    kaalSarp?: { present?: boolean; isPartial?: boolean; type?: string | null };
    sadeSati?: { active?: boolean; phase?: string | null };
  } | null;
  divisionalCharts?: { d9?: VargaChart | null; d10?: VargaChart | null };
  shodashvarga?: Array<{ key: string } & VargaChart> | null;
  birthTimeEdges?: BirthTimeEdge[] | null;
  requires_birth_time?: boolean;
  warnings?: Array<{ code: string }>;
}

export interface KundaliPdfMeta {
  name?: string;
  dob?: string;      // YYYY-MM-DD
  time?: string;     // HH:MM (24-hour)
  place?: string;
  basis?: ChartBasis | null;
  chartStyle?: 'north' | 'south';
  generatedAt?: Date;
}

export const SITE_URL = 'https://bornclock.com';

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

/** Ashwini → Revati — must equal the engine's NAKSHATRA_NAMES (asserted in the test). */
export const NAKSHATRA_ORDER = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Sidereal longitude (0–360) → nakshatra + pada (same arithmetic as the engine's siderealBreakdown). */
export function nakshatraPadaOf(longitude: number): { nakshatra: string; pada: number } {
  const lon = ((longitude % 360) + 360) % 360;
  const span = 360 / 27;
  const idx = Math.min(26, Math.floor(lon / span));
  const pada = Math.min(4, Math.floor((lon % span) / (span / 4)) + 1);
  return { nakshatra: NAKSHATRA_ORDER[idx], pada };
}

/** Same display as DashaDeepDive: "4 Dec 2018" (UTC date of the boundary instant). */
export function fmtDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
function fmtDob(dob?: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob || '');
  return m ? `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}` : (dob || '');
}

/** Current Maha/Antar with dates: from the live `dasha` fields, else from the timeline. */
export function currentDashaPeriods(data: KundaliPdfData, now: Date = new Date()) {
  const d = data.dasha;
  if (!d?.mahadasha) return null;
  let maha = { lord: d.mahadasha, start: d.mahadasha_start, end: d.mahadasha_end };
  let antar = d.antardasha ? { lord: d.antardasha, start: d.antardasha_start, end: d.antardasha_end } : null;
  const t = now.getTime();
  if ((!maha.start || !maha.end) && data.dashaTimeline) {
    const m = data.dashaTimeline.find(p => p.lord === d.mahadasha && Date.parse(p.start) <= t && t < Date.parse(p.end))
      ?? data.dashaTimeline.find(p => p.lord === d.mahadasha);
    if (m) maha = { lord: m.lord, start: m.start, end: m.end };
    if (antar && m?.antardashas) {
      const a = m.antardashas.find(x => x.lord === antar!.lord);
      if (a) antar = { lord: a.lord, start: a.start, end: a.end };
    }
  }
  return { maha, antar };
}

/** One-line plain-language explanation from the shared term list (impact-first). */
const explain = (id: string, fallback = '') => getTermDef(id)?.impact || fallback;

function d9Of(data: KundaliPdfData): VargaChart | null {
  const sv = data.shodashvarga?.find(v => v.key === 'D9');
  return sv ?? data.divisionalCharts?.d9 ?? null;
}

export function manglikSummary(data: KundaliPdfData): string | null {
  const md = data.doshas?.mangalDosha;
  if (!md) return null;
  const where = [
    md.marsHouseFromLagna ? `Mars is in house ${md.marsHouseFromLagna} from the Lagna` : '',
    md.marsHouseFromMoon ? `house ${md.marsHouseFromMoon} from the Moon` : '',
  ].filter(Boolean).join(' and ');
  if (!md.hasDosha) return `Not Manglik.${where ? ` ${where} — neither is one of the Manglik houses (1, 4, 7, 8, 12).` : ''}`;
  const level = md.severityLabel ? ` (${md.severityLabel})` : '';
  const cancel = md.cancellations?.length
    ? ` Classical cancellation in your chart: ${md.cancellations.join('; ')} — many traditions treat the dosha as neutralised.`
    : '';
  return `Manglik${level}.${where ? ` ${where}.` : ''}${cancel}`;
}

export function buildKundaliPdfHtml(data: KundaliPdfData, meta: KundaliPdfMeta = {}): string {
  const style = meta.chartStyle === 'south' ? 'south' : 'north';
  const generated = meta.generatedAt ?? new Date();
  const generatedLabel = `${generated.getDate()} ${MONTHS[generated.getMonth()]} ${generated.getFullYear()}`;
  const b = meta.basis;
  const name = (meta.name || '').trim();
  const planets = data.planets || [];
  const moonLon = planets.find(p => p.name === 'Moon')?.longitude;

  // ── Birth details ────────────────────────────────────────────────────────
  const details: Array<[string, string]> = [];
  if (name) details.push(['Name', name]);
  if (meta.dob) details.push(['Date of birth', fmtDob(meta.dob)]);
  if (meta.time) details.push(['Time of birth', meta.time]);
  if (meta.place) details.push(['Place of birth', meta.place]);
  if (b) details.push(['Time zone used', `${b.timezone} · ${b.utcOffsetLabel}`]);
  const detailsHtml = details.map(([k, v]) => `<div class="kv"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('');

  // ── Key points ───────────────────────────────────────────────────────────
  const lagnaDeg = data.lagna?.degrees != null ? ` · ${formatDegreeInSign(data.lagna.degrees)}` : '';
  const moonSignIdx = planets.find(p => p.name === 'Moon')?.signIndex;
  const keyCards = [
    { id: 'lagna', label: 'Lagna (rising sign)', value: `${signLabel(data.lagna?.sign, data.lagna?.signIndex)}${lagnaDeg}`, testid: 'pdf-lagna' },
    { id: 'rashi', label: 'Rashi (Moon sign)', value: `${signLabel(data.rashi, moonSignIdx)}${moonLon != null ? ` · ${formatDegreeInSign(moonLon)}` : ''}`, testid: 'pdf-rashi' },
    { id: 'nakshatra', label: 'Nakshatra (birth star)', value: `${data.nakshatra?.nakshatra || '—'}${data.nakshatra?.pada ? ` · pada ${data.nakshatra.pada}` : ''}`, testid: 'pdf-nakshatra' },
  ].map(c => `<div class="card" data-testid="${c.testid}"><span>${esc(c.label)}</span><strong>${esc(c.value)}</strong><p class="ex">${esc(explain(c.id))}</p></div>`).join('');

  // ── Charts (D1 + D9) ─────────────────────────────────────────────────────
  const styleName = style === 'south' ? 'South Indian' : 'North Indian';
  const d1 = data.lagna?.signIndex
    ? kundaliChartSvg({ lagnaSignIndex: data.lagna.signIndex, planets, style, label: 'Rashi chart (D1)' })
    : '';
  const d9v = d9Of(data);
  const d9 = d9v ? kundaliChartSvg({ lagnaSignIndex: d9v.lagnaSignIndex, planets: d9v.planets, style, label: 'Navamsa chart (D9)' }) : '';
  const chartsHtml = `
    <div class="charts">
      ${d1 ? `<figure data-testid="pdf-chart-d1">${d1}<figcaption><strong>Rashi chart (D1)</strong><br>${esc(explain('d1'))}</figcaption></figure>` : ''}
      ${d9 ? `<figure data-testid="pdf-chart-d9">${d9}<figcaption><strong>Navamsa chart (D9)</strong><br>${esc(explain('navamsa'))}</figcaption></figure>` : ''}
    </div>
    <p class="note">${styleName} style. Su Sun · Mo Moon · Ma Mars · Me Mercury · Ju Jupiter · Ve Venus · Sa Saturn · Ra Rahu · Ke Ketu.
    ${style === 'south' ? 'Each box is a fixed sign (small number = sign, 1 Aries … 12 Pisces); "La" marks the Lagna.' : 'The top-centre diamond is the 1st house (Lagna); small numbers are signs (1 Aries … 12 Pisces).'}
    ${esc(explain('northSouthChart'))}</p>`;

  // ── Planet table ─────────────────────────────────────────────────────────
  const rows = planets.map(p => {
    const nk = nakshatraPadaOf(p.longitude);
    return `<tr data-planet="${esc(p.name)}"><td>${esc(p.name)}</td><td>${esc(signLabel(p.sign, p.signIndex))}</td><td class="num">${formatDegreeInSign(p.longitude)}</td><td>${esc(nk.nakshatra)}-${nk.pada}</td><td class="num">${esc(p.house)}</td><td>${p.retrograde ? 'R' : '—'}</td></tr>`;
  }).join('');

  // ── Dasha ────────────────────────────────────────────────────────────────
  const periods = currentDashaPeriods(data);
  const range = (s?: string, e?: string) => (s && e ? `${fmtDate(s)} – ${fmtDate(e)}` : '');
  const dashaHtml = periods ? `
    <div class="section" data-testid="pdf-dasha">
      <h2>Current Dasha (Vimshottari)</h2>
      <p class="ex">${esc(explain('dasha'))}</p>
      <table class="grid"><thead><tr><th>Level</th><th>Planet</th><th>From – to</th></tr></thead><tbody>
        <tr><td>Mahadasha</td><td><strong>${esc(periods.maha.lord)}</strong></td><td class="num">${esc(range(periods.maha.start, periods.maha.end))}</td></tr>
        ${periods.antar ? `<tr><td>Antardasha</td><td><strong>${esc(periods.antar.lord)}</strong></td><td class="num">${esc(range(periods.antar.start, periods.antar.end))}</td></tr>` : ''}
      </tbody></table>
      <p class="note">Mahadasha: ${esc(explain('mahadasha'))} Antardasha: ${esc(explain('antardasha'))}</p>
    </div>` : '';

  // ── Manglik + other checks ───────────────────────────────────────────────
  const manglik = manglikSummary(data);
  const other: string[] = [];
  const ks = data.doshas?.kaalSarp;
  if (ks) other.push(`Kaal Sarp (full): ${ks.present && !ks.isPartial ? 'present' : 'not present'}`);
  const ss = data.doshas?.sadeSati;
  if (ss) other.push(`Sade Sati: ${ss.active ? `running now${ss.phase ? ` (${esc(ss.phase)} phase)` : ''}` : 'not running now'}`);
  const manglikHtml = manglik ? `
    <div class="section" data-testid="pdf-manglik">
      <h2>Manglik (Mangal Dosha)</h2>
      <p class="ex">${esc(explain('manglik'))}</p>
      <p>${esc(manglik)}</p>
      <p class="note">Convention: Mars is checked from the Lagna and from the Moon in the 1st, 4th, 7th, 8th and 12th houses. ${other.length ? `Other checks: ${other.join(' · ')}.` : ''}</p>
    </div>` : '';

  // ── Birth-time notes ─────────────────────────────────────────────────────
  const edges = !data.requires_birth_time && Array.isArray(data.birthTimeEdges) ? data.birthTimeEdges : [];
  const polar = (data.warnings || []).some(w => w.code === 'POLAR_LATITUDE');
  const notes = [
    ...edges.map(e => birthTimeEdgeNote(e)),
    ...(polar ? ['This birth place is at an extreme (polar) latitude where the rising sign (Lagna) and houses are astronomically unreliable. Planet signs, the Moon sign and birth star remain accurate; treat the houses as approximate.'] : []),
  ];
  const notesHtml = notes.length ? `
    <div class="section callout" data-testid="pdf-edge-notes">
      <h2>A note about your birth time</h2>
      ${notes.map(n => `<p>${esc(n)}</p>`).join('')}
    </div>` : '';

  const title = name ? `${name}’s Kundali` : 'Janam Kundali';
  const star = `\u2726${TEXT_VS}`; // ✦ as a text glyph, never a colour emoji

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)} — BornClock</title>
<style>
  @page { size: A4; margin: 0; }
  :root { --ink:#0E2238; --soft:#3A4A5A; --muted:#6B7A89; --line:#D7E1EA; --panel:#F4F6FA; --navy:#103A5C; --gold:#A8842C; }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  html, body { background: #fff; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: var(--ink); font-size: 11.5px; line-height: 1.5;
         font-variant-ligatures: none; font-feature-settings: "liga" 0, "clig" 0, "tnum" 1; }
  table.pt { width: 100%; border-collapse: collapse; }
  .pc { padding: 0 14mm; vertical-align: top; }
  thead .pc { padding-top: 10mm; }
  tfoot .pc { padding-bottom: 9mm; }
  .rh { display: flex; justify-content: space-between; border-bottom: 1px solid var(--line); padding-bottom: 6px; margin-bottom: 10px;
        font-size: 8.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
  .rh b { color: var(--navy); }
  .rf { border-top: 1px solid var(--line); padding-top: 6px; margin-top: 10px; font-size: 8.5px; color: var(--muted); text-align: center; }
  h1 { font-size: 24px; color: var(--navy); letter-spacing: -.3px; }
  .sub { color: var(--muted); font-size: 11px; margin-top: 2px; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--navy); border-bottom: 1.5px solid var(--gold); padding-bottom: 4px; margin-bottom: 6px; break-after: avoid; page-break-after: avoid; }
  .section { margin-top: 14px; break-inside: avoid; page-break-inside: avoid; }
  .kvs { display: flex; flex-wrap: wrap; gap: 6px 22px; margin-top: 10px; padding: 10px 12px; background: var(--panel); border-radius: 6px; }
  .kv span, .card span { display: block; font-size: 9px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
  .kv strong { font-size: 12px; }
  .cards { display: flex; gap: 10px; }
  .card { flex: 1; border: 1px solid var(--line); border-top: 3px solid var(--gold); border-radius: 6px; padding: 8px 10px; }
  .card strong { display: block; font-size: 14px; color: var(--navy); margin: 2px 0 4px; }
  .ex { color: var(--soft); font-size: 10.5px; margin-bottom: 6px; }
  .card .ex { margin: 0; }
  .note { color: var(--muted); font-size: 9.5px; margin-top: 6px; }
  .charts { display: flex; gap: 16px; justify-content: space-between; }
  .charts figure { flex: 1; text-align: center; }
  .charts svg { width: 76mm; height: 76mm; display: block; margin: 0 auto 4px; }
  .charts figcaption { font-size: 10px; color: var(--soft); }
  table.grid { width: 100%; border-collapse: collapse; font-size: 11px; }
  table.grid th { text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); border-bottom: 1.5px solid var(--navy); padding: 4px 6px; }
  table.grid td { padding: 4px 6px; border-bottom: 1px solid var(--line); }
  table.grid tr { break-inside: avoid; page-break-inside: avoid; }
  .num { font-feature-settings: "tnum" 1; white-space: nowrap; }
  .callout { background: #FFF8E6; border: 1px solid #E8D29A; border-radius: 6px; padding: 8px 10px; }
  .callout h2 { border-bottom-color: #E8D29A; }
  .closing { margin-top: 16px; padding-top: 10px; border-top: 1px solid var(--line); font-size: 10px; color: var(--soft); break-inside: avoid; }
  .closing a { color: var(--navy); }
  .brand { font-weight: 700; color: var(--navy); font-size: 12px; }
</style></head><body>
<table class="pt">
  <thead><tr><td class="pc"><div class="rh"><span><b>${star} BornClock</b> · Free basic Kundali</span><span>bornclock.com/kundali</span></div></td></tr></thead>
  <tfoot><tr><td class="pc"><div class="rf">BornClock · ${SITE_URL.replace('https://', '')} · Generated ${esc(generatedLabel)} · Calculations: Lahiri ayanamsa · For reflection, not certainty</div></td></tr></tfoot>
  <tbody><tr><td class="pc">

  <h1 data-testid="pdf-title">${esc(title)}</h1>
  <div class="sub">Vedic birth chart · sidereal (Lahiri) · generated ${esc(generatedLabel)}</div>
  ${detailsHtml ? `<div class="kvs" data-testid="pdf-birth-details">${detailsHtml}</div>` : ''}

  <div class="section" data-testid="pdf-key-points">
    <h2>Your three key points</h2>
    <div class="cards">${keyCards}</div>
  </div>

  <div class="section" data-testid="pdf-charts">
    <h2>Your charts</h2>
    ${chartsHtml}
  </div>

  ${notesHtml}

  <div class="section" data-testid="pdf-planets">
    <h2>Planet positions</h2>
    <p class="ex">${esc(explain('graha'))} The house shows which area of life each one affects.</p>
    <table class="grid"><thead><tr><th>Planet</th><th>Sign</th><th>Degree</th><th>Nakshatra-pada</th><th>House</th><th>Retro</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6">—</td></tr>'}</tbody></table>
    <p class="note">Degree = how far into its 30° sign the planet is. R = retrograde: ${esc(explain('retrograde'))} Rahu and Ketu always move backward, so they always show R.</p>
  </div>

  ${dashaHtml}
  ${manglikHtml}

  <div class="closing" data-testid="pdf-closing">
    <p class="brand">${star} BornClock — <a href="${SITE_URL}/kundali">bornclock.com/kundali</a></p>
    <p>This is a free basic Kundali; calculations: Lahiri ayanamsa. How we check accuracy: <a href="${SITE_URL}/accuracy" data-testid="pdf-accuracy-link">bornclock.com/accuracy</a>.</p>
    <p>A traditional Vedic reading for reflection — not a prediction of specific events. Your full interactive chart, Dasha deep-dive and written reading are at bornclock.com/kundali. Generated ${esc(generatedLabel)}.</p>
  </div>

  </td></tr></tbody>
</table>
</body></html>`;
}
