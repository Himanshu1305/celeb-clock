import { useState } from 'react';
import { geocodeCity, type GeoResult } from '@/services/geocoding';

interface VedicApiResult {
  nakshatra: { nakshatra: string; nakshatra_devanagari: string; pada: number; confidence: string; is_boundary: boolean };
  rashi: string | null;
  rashi_devanagari: string | null;
  lagna: string | null;
  dasha: { mahadasha: string; antardasha: string } | null;
  requires_birth_time: boolean;
}

/**
 * Optional birth time + city → accurate Vedic profile. The heavy sidereal
 * computation runs server-side (`/api/vedic-profile`, Node + Swiss Ephemeris) so
 * the Node-only WASM never ships to the browser. Degrades gracefully when the
 * endpoint is unavailable.
 */
export function BirthTimeVedicSection({ dob }: { dob: string | null }) {
  const [time, setTime] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [options, setOptions] = useState<GeoResult[]>([]);
  const [city, setCity] = useState<GeoResult | null>(null);
  const [result, setResult] = useState<VedicApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const hasTime = /^\d{2}:\d{2}$/.test(time);

  const onCityChange = async (v: string) => {
    setCityQuery(v);
    setCity(null);
    setResult(null);
    if (v.trim().length >= 3) {
      try { setOptions(await geocodeCity(v)); } catch { setOptions([]); }
    } else {
      setOptions([]);
    }
  };

  const pickCity = (c: GeoResult) => { setCity(c); setCityQuery(c.name); setOptions([]); };

  const compute = async () => {
    if (!dob || !hasTime || !city) return;
    setLoading(true); setFailed(false);
    try {
      const [y, m, d] = dob.split('-');
      const [h, min] = time.split(':');
      const params = new URLSearchParams({ y, m, d, h, min, lat: String(city.lat), lon: String(city.lon), tz: String(city.utcOffset) });
      const res = await fetch(`/api/vedic-profile?${params.toString()}`);
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      if (!data?.nakshatra?.nakshatra) throw new Error('bad');
      setResult(data);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
      <p className="text-sm font-semibold text-indigo-900 mb-2">🌙 Accurate Vedic profile (optional)</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1" htmlFor="birth-time">Birth time</label>
          <input
            id="birth-time"
            data-testid="birth-time-input"
            type="time"
            value={time}
            onChange={e => { setTime(e.target.value); setResult(null); }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900"
          />
        </div>
        <div className="relative">
          <label className="block text-xs text-gray-600 mb-1" htmlFor="birth-city">Birth city</label>
          <input
            id="birth-city"
            data-testid="birth-city-input"
            type="text"
            value={cityQuery}
            onChange={e => onCityChange(e.target.value)}
            placeholder="e.g. Delhi, Mumbai…"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900"
          />
          {options.length > 0 && (
            <ul data-testid="city-dropdown" className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow max-h-48 overflow-y-auto">
              {options.map((o, i) => (
                <li key={`${o.name}-${i}`}>
                  <button type="button" onClick={() => pickCity(o)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50">
                    {o.name}{o.state ? `, ${o.state}` : ''}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {!hasTime && (
        <p className="text-xs text-amber-700 mt-2">
          Enter your exact birth time for an accurate Nakshatra — the Moon moves ~13° a day, so the date alone can't pin it down.
        </p>
      )}

      {hasTime && city && !result && (
        <button type="button" onClick={compute} disabled={loading}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60">
          {loading ? 'Calculating…' : 'Reveal my Vedic profile →'}
        </button>
      )}

      {failed && (
        <p className="text-xs text-gray-500 mt-2">
          Precise Vedic chart is included in the full report — <a href="/kundali" className="text-indigo-600 underline">generate your Kundali</a>.
        </p>
      )}

      {result && (
        <div data-testid="vedic-profile-section" className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-white border border-gray-100 p-3">
            <span className="text-gray-500">Nakshatra</span>
            <div className="font-semibold text-gray-900">
              {result.nakshatra.nakshatra} {result.nakshatra.nakshatra_devanagari} · Pada {result.nakshatra.pada}
            </div>
          </div>
          <div className="rounded-lg bg-white border border-gray-100 p-3">
            <span className="text-gray-500">Rashi (Moon)</span>
            <div className="font-semibold text-gray-900">{result.rashi} {result.rashi_devanagari}</div>
          </div>
          {result.lagna && (
            <div className="rounded-lg bg-white border border-gray-100 p-3">
              <span className="text-gray-500">Lagna (Ascendant)</span>
              <div className="font-semibold text-gray-900">{result.lagna}</div>
            </div>
          )}
          {result.dasha && (
            <div className="rounded-lg bg-white border border-gray-100 p-3">
              <span className="text-gray-500">Current Dasha</span>
              <div className="font-semibold text-gray-900">{result.dasha.mahadasha} / {result.dasha.antardasha}</div>
            </div>
          )}
          {result.nakshatra.is_boundary && (
            <p className="sm:col-span-2 text-xs text-amber-700">
              ⚠️ Your Moon is near a Nakshatra boundary — a birth-time accurate to a few minutes matters here.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
