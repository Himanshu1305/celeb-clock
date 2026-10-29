/**
 * Kundali chart — North Indian (diamond) or South Indian (fixed-sign grid).
 *
 * North: House 1 (Lagna) is the top-centre diamond; houses run anticlockwise;
 *   rashi number is fixed per house from the Lagna sign; planets by house.
 * South (Growth P2, GP2-SOUTH): a 4×4 grid with the twelve signs in FIXED cells
 *   (Pisces top-left, clockwise); the Lagna sign's cell is marked "La" with a
 *   corner diagonal; planets are placed by their sign.
 */
import { abbr, SIGN_CELL, NORTH_HOUSE_POLY, layoutInPolygon, type Pt, type LabelRow, type ChartPlanet } from '@/lib/vedic/chartGeometry';
export { NORTH_HOUSE_POLY, textWidth, insideConvex, rowBox, layoutInPolygon, type LabelRow, type ChartPlanet } from '@/lib/vedic/chartGeometry';

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
