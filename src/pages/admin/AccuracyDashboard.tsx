import { useEffect, useState } from 'react';

// Ground truth = astronomically-correct Lahiri Nakshatras (Swiss Ephemeris),
// see src/__tests__/testData.ts. Kept inline so this shipped page never imports
// the Node-only ephemeris WASM; the actual value is fetched from /api/vedic-profile.
const GROUND_TRUTH = [
  { name: 'Virat Kohli', y: 1988, m: 11, d: 5, h: 12, min: 30, lat: 28.6139, lon: 77.2090, tz: 5.5, expected: 'Uttara Phalguni' },
  { name: 'Shah Rukh Khan', y: 1965, m: 11, d: 2, h: 14, min: 30, lat: 28.6139, lon: 77.2090, tz: 5.5, expected: 'Dhanishtha' },
  { name: 'Sachin Tendulkar', y: 1973, m: 4, d: 24, h: 12, min: 0, lat: 19.0760, lon: 72.8777, tz: 5.5, expected: 'Purva Ashadha' },
  { name: 'Narendra Modi', y: 1950, m: 9, d: 17, h: 11, min: 0, lat: 23.7867, lon: 72.6367, tz: 5.5, expected: 'Anuradha' },
  { name: 'Amitabh Bachchan', y: 1942, m: 10, d: 11, h: 16, min: 0, lat: 25.4358, lon: 81.8463, tz: 5.5, expected: 'Swati' },
];

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
        let actual: string | null = null;
        try {
          const params = new URLSearchParams({ y: `${g.y}`, m: `${g.m}`, d: `${g.d}`, h: `${g.h}`, min: `${g.min}`, lat: `${g.lat}`, lon: `${g.lon}`, tz: `${g.tz}` });
          const res = await fetch(`/api/vedic-profile?${params.toString()}`);
          if (res.ok) { const data = await res.json(); actual = data?.nakshatra?.nakshatra ?? null; }
        } catch { actual = null; }
        next.push({ name: g.name, expected: g.expected, actual, match: actual === null ? null : actual === g.expected });
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
        /api/vedic-profile vs known-correct Lahiri ground truth (Swiss Ephemeris).
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
