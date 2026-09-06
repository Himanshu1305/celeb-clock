import { useEffect, useState } from 'react';
import { calculateVedicProfile } from '@/utils/vedicCalculations';
import { VIRAT, SRK, SACHIN, MODI, AMITABH } from '@/__tests__/testData';

// Ground truth = astronomically-correct Lahiri Nakshatras (Swiss Ephemeris),
// see src/__tests__/testData.ts. Any drift here means the ephemeris/ayanamsha
// wiring regressed.
const GROUND_TRUTH = [VIRAT, SRK, SACHIN, MODI, AMITABH].map(c => ({
  name: c.name,
  dob: c.dob,
  time: c.time,
  loc: { city: c.city, lat: c.lat, lon: c.lon, timezone: c.tz },
  expected: c.nakshatra,
}));

interface Row { name: string; expected: string; actual: string | null; match: boolean | null; }

export default function AccuracyDashboard() {
  const [rows, setRows] = useState<Row[]>(
    GROUND_TRUTH.map(g => ({ name: g.name, expected: g.expected, actual: null, match: null }))
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next: Row[] = [];
      for (const g of GROUND_TRUTH) {
        const [y, m, d] = g.dob.split('-').map(Number);
        const [h, min] = g.time.split(':').map(Number);
        let actual: string | null = null;
        try {
          const r = await calculateVedicProfile(d, m, y, h, min, g.loc);
          actual = r.nakshatra.nakshatra;
        } catch {
          actual = null;
        }
        next.push({ name: g.name, expected: g.expected, actual, match: actual === g.expected });
      }
      if (!cancelled) setRows(next);
    })();
    return () => { cancelled = true; };
  }, []);

  const done = rows.filter(r => r.match !== null);
  const matched = done.filter(r => r.match).length;
  const accuracy = done.length ? Math.round((matched / done.length) * 100) : null;

  return (
    <div data-testid="accuracy-dashboard" className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Nakshatra Accuracy</h1>
      <p className="text-sm text-gray-500 mb-4">
        calculateVedicProfile vs known-correct Lahiri ground truth (Swiss Ephemeris).
      </p>
      <div className="mb-4 text-lg font-semibold" data-testid="accuracy-summary">
        Accuracy: {accuracy === null ? 'calculating…' : `${accuracy}% (${matched}/${done.length})`}
      </div>
      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left px-3 py-2">Celebrity</th>
            <th className="text-left px-3 py-2">Expected</th>
            <th className="text-left px-3 py-2">Computed</th>
            <th className="text-left px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.name} data-testid="ground-truth-row" className="border-t border-gray-100">
              <td className="px-3 py-2 text-gray-900">{r.name}</td>
              <td className="px-3 py-2 text-gray-700">{r.expected}</td>
              <td className="px-3 py-2 text-gray-700">{r.actual ?? '…'}</td>
              <td className="px-3 py-2">
                {r.match === null ? '⏳' : r.match ? '✅ match' : '❌ fail'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
