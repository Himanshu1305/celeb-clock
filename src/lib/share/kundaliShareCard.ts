/**
 * Batch 9b: "Share my Kundali" image. A compact 1080×1080 card — Lagna, Rashi, Nakshatra,
 * a thumbnail of the chart (visitor's chosen style) and the site URL — built as an SVG
 * string (pure, testable) and turned into a PNG in the browser with a canvas.
 *
 * Privacy: by default the card carries NO name, birth date, birth time or birth place.
 * They are added only when the visitor ticks the opt-in (`includeBirthDetails`).
 */
import { kundaliChartSvg } from '../vedic/chartSvg';
import { signLabel } from '../vedic/signLabel';
import { TEXT_VS } from '../pdf/printHtml';
import type { ChartPlanet } from '../vedic/chartGeometry';

export const SHARE_SIZE = 1080;
export const SHARE_URL_LABEL = 'bornclock.com/kundali';

export interface ShareCardData {
  lagna: { sign: string; signIndex: number };
  rashi: string | null;
  nakshatra: { nakshatra: string; pada: number };
  planets: Array<ChartPlanet & { signIndex?: number }>;
}
export interface ShareCardOptions {
  chartStyle?: 'north' | 'south';
  /** Opt-in only. When false (the default) none of `birth` is drawn. */
  includeBirthDetails?: boolean;
  birth?: { name?: string; dob?: string; time?: string; place?: string };
}

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDob = (dob?: string) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob || ''); return m ? `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}` : (dob || ''); };
const FONT = `-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

/** The lines that describe the person — empty unless the visitor opted in. */
export function shareBirthLines(opts: ShareCardOptions): string[] {
  if (!opts.includeBirthDetails || !opts.birth) return [];
  const b = opts.birth;
  const lines: string[] = [];
  if (b.name?.trim()) lines.push(b.name.trim());
  const when = [fmtDob(b.dob), b.time].filter(Boolean).join(' · ');
  const born = [when, b.place].filter(Boolean).join(' · ');
  if (born) lines.push(`Born ${born}`);
  return lines;
}

export function buildKundaliShareSvg(data: ShareCardData, opts: ShareCardOptions = {}): string {
  const style = opts.chartStyle === 'south' ? 'south' : 'north';
  const moonIdx = data.planets.find(p => p.name === 'Moon')?.signIndex;
  const facts: Array<[string, string]> = [
    ['Lagna · rising sign', signLabel(data.lagna.sign, data.lagna.signIndex)],
    ['Rashi · Moon sign', signLabel(data.rashi, moonIdx)],
    ['Nakshatra · birth star', `${data.nakshatra.nakshatra} · pada ${data.nakshatra.pada}`],
  ];
  const personal = shareBirthLines(opts);
  const title = personal[0] && opts.birth?.name?.trim() ? `${personal[0]}’s Kundali` : 'My Vedic Kundali';
  const bornLine = personal.find(l => l.startsWith('Born ')) ?? '';

  // Chart thumbnail: nest the same chart SVG the page draws, scaled into a 470px box.
  const chart = kundaliChartSvg({ lagnaSignIndex: data.lagna.signIndex, planets: data.planets, style, label: 'Kundali chart (D1)' })
    .replace('<svg ', '<svg x="70" y="250" width="470" height="470" ');

  const factSvg = facts.map(([k, v], i) => {
    const y = 290 + i * 150;
    return `<text x="600" y="${y}" font-size="26" fill="#A8842C" letter-spacing="2">${esc(k.toUpperCase())}</text>`
      + `<text x="600" y="${y + 52}" font-size="${v.length > 22 ? 34 : 42}" font-weight="700" fill="#FFFFFF">${esc(v)}</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SHARE_SIZE}" height="${SHARE_SIZE}" viewBox="0 0 ${SHARE_SIZE} ${SHARE_SIZE}" font-family="${FONT}">
<rect width="1080" height="1080" fill="#0E2238"/>
<rect x="30" y="30" width="1020" height="1020" rx="28" fill="none" stroke="#A8842C" stroke-width="3"/>
<text x="70" y="140" font-size="30" fill="#A8842C" letter-spacing="4">\u2726${TEXT_VS} BORNCLOCK</text>
<text x="70" y="205" font-size="56" font-weight="800" fill="#FFFFFF" data-testid="share-title">${esc(title)}</text>
<rect x="60" y="240" width="490" height="490" rx="14" fill="#FFFFFF"/>
${chart}
${factSvg}
${bornLine ? `<text x="70" y="800" font-size="30" fill="#D7E1EA" data-testid="share-born">${esc(bornLine)}</text>` : ''}
<text x="70" y="${bornLine ? 860 : 820}" font-size="28" fill="#D7E1EA">Sidereal (Lahiri) · ${style === 'south' ? 'South' : 'North'} Indian chart</text>
<rect x="60" y="930" width="960" height="90" rx="45" fill="#A8842C"/>
<text x="540" y="988" font-size="36" font-weight="700" fill="#0E2238" text-anchor="middle">Make yours at ${SHARE_URL_LABEL}</text>
</svg>`;
}

/** Browser only: SVG string → PNG Blob through a canvas. */
export async function svgToPngBlob(svg: string, size = SHARE_SIZE): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    img.decoding = 'async';
    await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('share image failed to load')); img.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas unavailable');
    ctx.drawImage(img, 0, 0, size, size);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}
