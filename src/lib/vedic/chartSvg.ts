/**
 * Batch 9b: the Kundali chart as a plain SVG string — for the printable Kundali PDF and
 * the share image, which cannot mount React components. Same geometry and layout code
 * as the on-page chart (src/components/KundaliChart.tsx via chartGeometry.ts), so the
 * printed / shared chart always matches what the visitor saw.
 *
 * Sign indices are 1-based (1 = Aries … 12 = Pisces), as in the /api/kundali response.
 */
import { abbr, SIGN_CELL, NORTH_HOUSE_POLY, layoutInPolygon, type Pt, type LabelRow, type ChartPlanet } from './chartGeometry';

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
const INK = '#0E2238';
const FONT = 'font-family="-apple-system, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif"';

function rowsSvg(rows: LabelRow[]): string {
  return rows.map(r =>
    `<text x="${r.x}" y="${r.y}" text-anchor="middle" font-size="${r.fontSize}"${r.kind === 'planets' ? ' font-weight="bold"' : ''} fill="${r.kind === 'planets' ? '#111827' : '#6b7280'}">${esc(r.text)}</text>`,
  ).join('');
}

export interface ChartSvgOptions {
  lagnaSignIndex: number;
  planets: ChartPlanet[];
  style?: 'north' | 'south';
  /** Accessible name, e.g. "Rashi chart (D1)". */
  label?: string;
  /** Rendered width/height in CSS units (default: fills its box). */
  size?: string;
}

export function kundaliChartSvg({ lagnaSignIndex, planets, style = 'north', label = 'Kundali chart', size }: ChartSvgOptions): string {
  const dims = size ? ` width="${size}" height="${size}"` : '';
  const open = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"${dims} role="img" aria-label="${esc(`${style === 'south' ? 'South' : 'North'} Indian ${label}`)}" data-chart-style="${style}" ${FONT}>`;
  const frame = `<rect x="2" y="2" width="296" height="296" fill="#fff" stroke="${INK}" stroke-width="2"/>`;

  if (style === 'south') {
    const bySign: Record<number, string[]> = {};
    for (const p of planets) {
      const si = p.signIndex ?? (((lagnaSignIndex - 1) + (p.house - 1)) % 12) + 1;
      (bySign[si] ||= []).push(abbr(p.name));
    }
    const S = 74, O = 2;
    let body = '';
    for (let sign = 1; sign <= 12; sign++) {
      const cell = SIGN_CELL[sign];
      const x = O + cell.col * S, y = O + cell.row * S;
      const isLagna = sign === lagnaSignIndex;
      const area: Pt[] = [[x, y + 14], [x + S, y + 14], [x + S, y + S], [x, y + S]];
      body += `<g data-sign="${sign}">`
        + `<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="${isLagna ? '#EEEBF6' : '#fff'}" stroke="${INK}" stroke-width="1"/>`
        + (isLagna ? `<line x1="${x}" y1="${y}" x2="${x + 16}" y2="${y + 16}" stroke="#6E5AA6" stroke-width="1.5"/>` : '')
        + `<text x="${x + 4}" y="${y + 12}" font-size="8" fill="#6b7280">${sign}${isLagna ? ' La' : ''}</text>`
        + rowsSvg(layoutInPolygon(area, bySign[sign] || [], undefined, [x + S / 2, y + 14 + (S - 14) / 2]))
        + `</g>`;
    }
    return `${open}${frame}${body}</svg>`;
  }

  const byHouse: Record<number, string[]> = {};
  for (const p of planets) (byHouse[p.house] ||= []).push(abbr(p.name));
  const rashiForHouse = (h: number) => (((lagnaSignIndex - 1) + (h - 1)) % 12) + 1;
  let body = `<line x1="2" y1="2" x2="298" y2="298" stroke="${INK}" stroke-width="1"/>`
    + `<line x1="298" y1="2" x2="2" y2="298" stroke="${INK}" stroke-width="1"/>`
    + `<polygon points="150,2 298,150 150,298 2,150" fill="none" stroke="${INK}" stroke-width="1"/>`;
  for (let h = 1; h <= 12; h++) {
    body += `<g data-house="${h}">${rowsSvg(layoutInPolygon(NORTH_HOUSE_POLY[h], byHouse[h] || [], String(rashiForHouse(h))))}</g>`;
  }
  return `${open}${frame}${body}</svg>`;
}
