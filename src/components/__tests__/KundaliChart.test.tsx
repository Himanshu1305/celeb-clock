import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { KundaliChart, layoutInPolygon, NORTH_HOUSE_POLY, rowBox, insideConvex, type LabelRow } from '../KundaliChart';
import { calculateBirthChart } from '@/lib/vedic/calculateBirthChart';
import { toKundaliLegacy } from '@/lib/vedic/legacyAdapters';

const ALL = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
type Pt = [number, number];

/** Parse <text x y font-size>…</text> rows from one <g data-*=N> group of the rendered SVG. */
function rowsOfGroup(svg: string, attr: 'data-house' | 'data-sign', n: number): LabelRow[] {
  const g = new RegExp(`<g ${attr}="${n}">([\\s\\S]*?)</g>`).exec(svg);
  if (!g) return [];
  return [...g[1].matchAll(/<text x="([\d.]+)" y="([\d.]+)" text-anchor="middle" font-size="([\d.]+)"(?: font-weight="bold")? fill="#111827">([^<]*)<\/text>/g)]
    .map(m => ({ x: +m[1], y: +m[2], fontSize: +m[3], text: m[4], kind: 'planets' as const }));
}
const inside = (poly: Pt[], r: LabelRow) => rowBox(r).every(p => insideConvex(poly, p, 0));

describe('KundaliChart label layout (K12)', () => {
  it('every house fits 1–9 planet labels plus its sign number inside its own polygon', () => {
    for (let h = 1; h <= 12; h++) {
      for (let n = 1; n <= 9; n++) {
        const rows = layoutInPolygon(NORTH_HOUSE_POLY[h], ALL.slice(0, n), '12');
        for (const r of rows) expect(inside(NORTH_HOUSE_POLY[h], r), `house ${h}, ${n} planets, row "${r.text}"`).toBe(true);
        expect(rows.filter(r => r.kind === 'planets').map(r => r.text).join(' ').split(' ')).toEqual(ALL.slice(0, n));
      }
    }
  });

  // P7 (round-2 panel): 2002-05-14 16:45 Edison NJ (EDT, UTC-4). The engine puts six
  // planets in house 9 (Vrishabha); round 2 saw "Mo Me" drawn inside house 8.
  it('P7: all six house-9 planets are drawn inside house 9 (North) and the Vrishabha cell (South)', async () => {
    const k = toKundaliLegacy(await calculateBirthChart({ year: 2002, month: 5, day: 14, hour: 16, minute: 45, latitude: 40.5187, longitude: -74.4121, timezoneOffset: -4 }));
    const in9 = k.planets.filter(p => p.house === 9).map(p => p.name);
    expect(in9.length).toBe(6);
    const north = renderToStaticMarkup(<KundaliChart lagnaSignIndex={k.lagna.signIndex} planets={k.planets} style="north" />);
    for (let h = 1; h <= 12; h++) {
      const rows = rowsOfGroup(north, 'data-house', h);
      for (const r of rows) expect(inside(NORTH_HOUSE_POLY[h], r), `house ${h} row "${r.text}"`).toBe(true);
      const drawn = rows.flatMap(r => r.text.split(' ')).sort();
      const expected = k.planets.filter(p => p.house === h).map(p => ({ Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke' } as Record<string, string>)[p.name]).sort();
      expect(drawn, `house ${h}`).toEqual(expected);
    }
    const south = renderToStaticMarkup(<KundaliChart lagnaSignIndex={k.lagna.signIndex} planets={k.planets} style="south" />);
    // Vrishabha (sign 2) is grid col 2, row 0 → x 150–224; planet rows sit below the number strip.
    const vrish: Pt[] = [[150, 16], [224, 16], [224, 76], [150, 76]];
    const rows = rowsOfGroup(south, 'data-sign', 2);
    expect(rows.flatMap(r => r.text.split(' ')).length).toBe(6);
    for (const r of rows) expect(inside(vrish, r), `south row "${r.text}"`).toBe(true);
  });
});
