/**
 * North Indian (diamond) Kundali chart. House 1 (Lagna) is the top-centre
 * diamond; houses run anticlockwise. Rashi number is fixed per house from the
 * Lagna sign; planets are placed by their house.
 */
const PLANET_ABBR: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju',
  Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
};

// Label anchor (x,y) for each house 1..12 in a 300x300 viewBox.
const HOUSE_POS: Record<number, { x: number; y: number }> = {
  1: { x: 150, y: 60 }, 2: { x: 75, y: 35 }, 3: { x: 35, y: 75 }, 4: { x: 90, y: 150 },
  5: { x: 35, y: 225 }, 6: { x: 75, y: 265 }, 7: { x: 150, y: 235 }, 8: { x: 225, y: 265 },
  9: { x: 265, y: 225 }, 10: { x: 210, y: 150 }, 11: { x: 265, y: 75 }, 12: { x: 225, y: 35 },
};

export interface ChartPlanet { name: string; house: number; sign?: string }

export function KundaliChart({ lagnaSignIndex, planets }: { lagnaSignIndex: number; planets: ChartPlanet[] }) {
  const byHouse: Record<number, string[]> = {};
  for (const p of planets) {
    (byHouse[p.house] ||= []).push(PLANET_ABBR[p.name] || p.name.slice(0, 2));
  }
  const rashiForHouse = (h: number) => (((lagnaSignIndex - 1) + (h - 1)) % 12) + 1;

  return (
    <svg data-testid="kundali-chart" viewBox="0 0 300 300" className="w-full max-w-xs mx-auto" role="img" aria-label="North Indian Kundali chart">
      <rect x="2" y="2" width="296" height="296" fill="#fff" stroke="#4f46e5" strokeWidth="2" />
      <line x1="2" y1="2" x2="298" y2="298" stroke="#4f46e5" strokeWidth="1" />
      <line x1="298" y1="2" x2="2" y2="298" stroke="#4f46e5" strokeWidth="1" />
      <polygon points="150,2 298,150 150,298 2,150" fill="none" stroke="#4f46e5" strokeWidth="1" />
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
