/**
 * Kundali chart — North Indian (diamond) or South Indian (fixed-sign grid).
 *
 * North: House 1 (Lagna) is the top-centre diamond; houses run anticlockwise;
 *   rashi number is fixed per house from the Lagna sign; planets by house.
 * South (Growth P2, GP2-SOUTH): a 4×4 grid with the twelve signs in FIXED cells
 *   (Pisces top-left, clockwise); the Lagna sign's cell is marked "La" with a
 *   corner diagonal; planets are placed by their sign.
 */
const PLANET_ABBR: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju',
  Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
};

// South Indian: grid cell (col,row) for each sign 1..12 (Pisces top-left, clockwise).
const SIGN_CELL: Record<number, { col: number; row: number }> = {
  12: { col: 0, row: 0 }, 1: { col: 1, row: 0 }, 2: { col: 2, row: 0 }, 3: { col: 3, row: 0 },
  4: { col: 3, row: 1 }, 5: { col: 3, row: 2 }, 6: { col: 3, row: 3 }, 7: { col: 2, row: 3 },
  8: { col: 1, row: 3 }, 9: { col: 0, row: 3 }, 10: { col: 0, row: 2 }, 11: { col: 0, row: 1 },
};

export interface ChartPlanet { name: string; house: number; sign?: string; signIndex?: number }

const abbr = (name: string) => PLANET_ABBR[name] || name.slice(0, 2);

// ── K12: label layout that always stays inside its own house ─────────────────
// Previously every planet in a house was drawn on ONE centred line, so 4+ planets
// spilled into the neighbouring house (P7: "Mo Me" appeared in house 8, not 9).
// Labels are now wrapped into rows and each row's estimated box is checked
// against the house polygon; the font shrinks / rows re-flow until it fits.
type Pt = [number, number];
export interface LabelRow { text: string; x: number; y: number; fontSize: number; kind: 'sign' | 'planets' }

// North Indian house polygons in the 300×300 viewBox (outer square 2..298).
export const NORTH_HOUSE_POLY: Record<number, Pt[]> = {
  1: [[150, 2], [224, 76], [150, 150], [76, 76]],
  2: [[2, 2], [150, 2], [76, 76]],
  3: [[2, 2], [76, 76], [2, 150]],
  4: [[76, 76], [150, 150], [76, 224], [2, 150]],
  5: [[2, 150], [76, 224], [2, 298]],
  6: [[76, 224], [150, 298], [2, 298]],
  7: [[150, 150], [224, 224], [150, 298], [76, 224]],
  8: [[224, 224], [298, 298], [150, 298]],
  9: [[298, 150], [298, 298], [224, 224]],
  10: [[224, 76], [298, 150], [224, 224], [150, 150]],
  11: [[298, 2], [298, 150], [224, 76]],
  12: [[150, 2], [298, 2], [224, 76]],
};

/** Approximate rendered width of bold sans text (conservative: ~0.75em per glyph; bold Arial "Mo" is 1.44em). */
export const textWidth = (text: string, fontSize: number) => {
  let w = 0;
  for (const ch of text) w += ch === ' ' ? 0.3 : 0.75;
  return w * fontSize;
};

const cross = (a: Pt, b: Pt, c: Pt) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
/** Point inside (or on the edge of) a convex polygon, shrunk by `pad` px. */
export function insideConvex(poly: Pt[], p: Pt, pad = 0): boolean {
  let sign = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const c = cross(a, b, p) / len; // signed distance from edge
    if (Math.abs(c) < pad) return false;
    const sg = Math.sign(c);
    if (sg === 0) continue;
    if (sign === 0) sign = sg; else if (sg !== sign) return false;
  }
  return true;
}
/** Bounding box of a text row drawn with textAnchor="middle" and baseline y. */
export const rowBox = (r: LabelRow): [Pt, Pt, Pt, Pt] => {
  const w = textWidth(r.text, r.fontSize), top = r.y - r.fontSize * 0.8, bot = r.y + r.fontSize * 0.22;
  return [[r.x - w / 2, top], [r.x + w / 2, top], [r.x + w / 2, bot], [r.x - w / 2, bot]];
};
const rowFits = (poly: Pt[], r: LabelRow, pad: number) => rowBox(r).every(pt => insideConvex(poly, pt, pad));

const centroid = (poly: Pt[]): Pt => [poly.reduce((s, p) => s + p[0], 0) / poly.length, poly.reduce((s, p) => s + p[1], 0) / poly.length];

/**
 * Lay out an optional small sign number plus the planet labels as centred rows
 * inside `poly`. Tries the largest font first, then fewer items per row, then a
 * few offsets around the centroid, and returns the first layout whose every row
 * box lies inside the polygon (with a small padding).
 */
export function layoutInPolygon(poly: Pt[], labels: string[], signLabel?: string, center?: Pt): LabelRow[] {
  const [cx, cy] = center ?? centroid(poly);
  const pad = 1.5;
  const build = (fs: number, perRow: number, dx: number, dy: number): LabelRow[] => {
    const rows: Array<{ text: string; fs: number; kind: LabelRow['kind'] }> = [];
    if (signLabel) rows.push({ text: signLabel, fs: Math.min(9, fs), kind: 'sign' });
    for (let i = 0; i < labels.length; i += perRow) rows.push({ text: labels.slice(i, i + perRow).join(' '), fs, kind: 'planets' });
    const gap = 1.5;
    const heights = rows.map(r => r.fs + gap);
    const total = heights.reduce((s, h) => s + h, 0) - gap;
    let y = cy + dy - total / 2;
    return rows.map((r, i) => {
      y += r.fs * 0.8;
      const row: LabelRow = { text: r.text, x: cx + dx, y: Math.round(y * 10) / 10, fontSize: r.fs, kind: r.kind };
      y += heights[i] - r.fs * 0.8;
      return row;
    });
  };
  const offsets: Pt[] = [[0, 0]];
  for (const d of [4, 8, 12, 16, 20]) offsets.push([0, d], [0, -d], [d, 0], [-d, 0], [d, d], [-d, d], [d, -d], [-d, -d]);
  for (const fs of [11, 10, 9, 8, 7]) {
    for (let perRow = Math.min(3, Math.max(1, labels.length)); perRow >= 1; perRow--) {
      for (const [dx, dy] of offsets) {
        const rows = build(fs, perRow, dx, dy);
        if (rows.every(r => rowFits(poly, r, pad))) return rows;
      }
    }
  }
  return build(7, 1, 0, 0); // degenerate fallback (never reached for ≤9 planets)
}

function Rows({ rows }: { rows: LabelRow[] }) {
  return (
    <>
      {rows.map((r, i) => (
        <text key={i} x={r.x} y={r.y} textAnchor="middle" fontSize={r.fontSize}
              fontWeight={r.kind === 'planets' ? 'bold' : undefined} fill={r.kind === 'planets' ? '#111827' : '#9ca3af'}>
          {r.text}
        </text>
      ))}
    </>
  );
}

function NorthChart({ lagnaSignIndex, planets, label }: { lagnaSignIndex: number; planets: ChartPlanet[]; label: string }) {
  const byHouse: Record<number, string[]> = {};
  for (const p of planets) (byHouse[p.house] ||= []).push(abbr(p.name));
  const rashiForHouse = (h: number) => (((lagnaSignIndex - 1) + (h - 1)) % 12) + 1;
  return (
    <svg data-testid="kundali-chart" viewBox="0 0 300 300" className="w-full max-w-xs mx-auto" role="img" aria-label={`North Indian ${label}`}>
      <rect x="2" y="2" width="296" height="296" fill="#fff" stroke="#0E2238" strokeWidth="2" />
      <line x1="2" y1="2" x2="298" y2="298" stroke="#0E2238" strokeWidth="1" />
      <line x1="298" y1="2" x2="2" y2="298" stroke="#0E2238" strokeWidth="1" />
      <polygon points="150,2 298,150 150,298 2,150" fill="none" stroke="#0E2238" strokeWidth="1" />
      {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
        <g key={h} data-house={h}>
          <Rows rows={layoutInPolygon(NORTH_HOUSE_POLY[h], byHouse[h] || [], String(rashiForHouse(h)))} />
        </g>
      ))}
    </svg>
  );
}

function SouthChart({ lagnaSignIndex, planets, label }: { lagnaSignIndex: number; planets: ChartPlanet[]; label: string }) {
  // Place planets by sign. Fall back to deriving the sign from house+lagna if a
  // planet lacks an explicit signIndex (older cached shapes).
  const bySign: Record<number, string[]> = {};
  for (const p of planets) {
    const si = p.signIndex ?? (((lagnaSignIndex - 1) + (p.house - 1)) % 12) + 1;
    (bySign[si] ||= []).push(abbr(p.name));
  }
  const S = 74; const O = 2; // cell size, origin offset
  return (
    <svg data-testid="kundali-chart-south" viewBox="0 0 300 300" className="w-full max-w-xs mx-auto" role="img" aria-label={`South Indian ${label}`}>
      <rect x="2" y="2" width="296" height="296" fill="#fff" stroke="#0E2238" strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => i + 1).map(sign => {
        const cell = SIGN_CELL[sign];
        const x = O + cell.col * S, y = O + cell.row * S;
        const isLagna = sign === lagnaSignIndex;
        // Planet rows live below the sign-number strip at the top of the cell.
        const area: Pt[] = [[x, y + 14], [x + S, y + 14], [x + S, y + S], [x, y + S]];
        return (
          <g key={sign} data-sign={sign}>
            <rect x={x} y={y} width={S} height={S} fill={isLagna ? '#6E5AA6' : '#fff'} fillOpacity={isLagna ? 0.1 : 1} stroke="#0E2238" strokeWidth="1" />
            {isLagna && <line x1={x} y1={y} x2={x + 16} y2={y + 16} stroke="#6E5AA6" strokeWidth="1.5" />}
            <text x={x + 4} y={y + 12} fontSize="8" fill="#9ca3af">{sign}{isLagna ? ' La' : ''}</text>
            <Rows rows={layoutInPolygon(area, bySign[sign] || [], undefined, [x + S / 2, y + 14 + (S - 14) / 2])} />
          </g>
        );
      })}
    </svg>
  );
}

export function KundaliChart({ lagnaSignIndex, planets, style = 'north', label = 'Kundali chart' }: { lagnaSignIndex: number; planets: ChartPlanet[]; style?: 'north' | 'south'; label?: string }) {
  return style === 'south'
    ? <SouthChart lagnaSignIndex={lagnaSignIndex} planets={planets} label={label} />
    : <NorthChart lagnaSignIndex={lagnaSignIndex} planets={planets} label={label} />;
}
