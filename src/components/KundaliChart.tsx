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

// North Indian: label anchor (x,y) for each house 1..12 in a 300x300 viewBox.
const HOUSE_POS: Record<number, { x: number; y: number }> = {
  1: { x: 150, y: 60 }, 2: { x: 75, y: 35 }, 3: { x: 35, y: 75 }, 4: { x: 90, y: 150 },
  5: { x: 35, y: 225 }, 6: { x: 75, y: 265 }, 7: { x: 150, y: 235 }, 8: { x: 225, y: 265 },
  9: { x: 265, y: 225 }, 10: { x: 210, y: 150 }, 11: { x: 265, y: 75 }, 12: { x: 225, y: 35 },
};

// South Indian: grid cell (col,row) for each sign 1..12 (Pisces top-left, clockwise).
const SIGN_CELL: Record<number, { col: number; row: number }> = {
  12: { col: 0, row: 0 }, 1: { col: 1, row: 0 }, 2: { col: 2, row: 0 }, 3: { col: 3, row: 0 },
  4: { col: 3, row: 1 }, 5: { col: 3, row: 2 }, 6: { col: 3, row: 3 }, 7: { col: 2, row: 3 },
  8: { col: 1, row: 3 }, 9: { col: 0, row: 3 }, 10: { col: 0, row: 2 }, 11: { col: 0, row: 1 },
};

export interface ChartPlanet { name: string; house: number; sign?: string; signIndex?: number }

const abbr = (name: string) => PLANET_ABBR[name] || name.slice(0, 2);

function NorthChart({ lagnaSignIndex, planets }: { lagnaSignIndex: number; planets: ChartPlanet[] }) {
  const byHouse: Record<number, string[]> = {};
  for (const p of planets) (byHouse[p.house] ||= []).push(abbr(p.name));
  const rashiForHouse = (h: number) => (((lagnaSignIndex - 1) + (h - 1)) % 12) + 1;
  return (
    <svg data-testid="kundali-chart" viewBox="0 0 300 300" className="w-full max-w-xs mx-auto" role="img" aria-label="North Indian Kundali chart">
      <rect x="2" y="2" width="296" height="296" fill="#fff" stroke="#0E2238" strokeWidth="2" />
      <line x1="2" y1="2" x2="298" y2="298" stroke="#0E2238" strokeWidth="1" />
      <line x1="298" y1="2" x2="2" y2="298" stroke="#0E2238" strokeWidth="1" />
      <polygon points="150,2 298,150 150,298 2,150" fill="none" stroke="#0E2238" strokeWidth="1" />
      {Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
        const pos = HOUSE_POS[h];
        const planetsHere = byHouse[h] || [];
        return (
          <g key={h}>
            <text x={pos.x} y={pos.y - 8} textAnchor="middle" fontSize="9" fill="#9ca3af">{rashiForHouse(h)}</text>
            <text x={pos.x} y={pos.y + 6} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#111827">
              {planetsHere.join(' ')}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function SouthChart({ lagnaSignIndex, planets }: { lagnaSignIndex: number; planets: ChartPlanet[] }) {
  // Place planets by sign. Fall back to deriving the sign from house+lagna if a
  // planet lacks an explicit signIndex (older cached shapes).
  const bySign: Record<number, string[]> = {};
  for (const p of planets) {
    const si = p.signIndex ?? (((lagnaSignIndex - 1) + (p.house - 1)) % 12) + 1;
    (bySign[si] ||= []).push(abbr(p.name));
  }
  const S = 74; const O = 2; // cell size, origin offset
  return (
    <svg data-testid="kundali-chart-south" viewBox="0 0 300 300" className="w-full max-w-xs mx-auto" role="img" aria-label="South Indian Kundali chart">
      <rect x="2" y="2" width="296" height="296" fill="#fff" stroke="#0E2238" strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => i + 1).map(sign => {
        const cell = SIGN_CELL[sign];
        const x = O + cell.col * S, y = O + cell.row * S;
        const planetsHere = bySign[sign] || [];
        const isLagna = sign === lagnaSignIndex;
        return (
          <g key={sign}>
            <rect x={x} y={y} width={S} height={S} fill={isLagna ? '#6E5AA6' : '#fff'} fillOpacity={isLagna ? 0.1 : 1} stroke="#0E2238" strokeWidth="1" />
            {isLagna && <line x1={x} y1={y} x2={x + 16} y2={y + 16} stroke="#6E5AA6" strokeWidth="1.5" />}
            <text x={x + 4} y={y + 12} fontSize="8" fill="#9ca3af">{sign}{isLagna ? ' La' : ''}</text>
            <text x={x + S / 2} y={y + S / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#111827">
              {planetsHere.join(' ')}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function KundaliChart({ lagnaSignIndex, planets, style = 'north' }: { lagnaSignIndex: number; planets: ChartPlanet[]; style?: 'north' | 'south' }) {
  return style === 'south'
    ? <SouthChart lagnaSignIndex={lagnaSignIndex} planets={planets} />
    : <NorthChart lagnaSignIndex={lagnaSignIndex} planets={planets} />;
}
