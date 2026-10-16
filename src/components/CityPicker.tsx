/**
 * Shared birth-city picker (fix-timezone-accuracy). Used by every form that collects a
 * birthplace, so place + time-zone handling is identical site-wide:
 *
 *  • suggestions read "City, State/Region, Country" (Pontiac, Michigan, USA vs
 *    Pontiac, Illinois, USA) and the EXACT suggestion the user clicks is saved —
 *    name, lat, lon and the IANA zone looked up from those coordinates;
 *  • typing without picking never guesses: the value stays empty and the user is
 *    asked to pick from the list;
 *  • "More places named …" searches beyond the bundled city list;
 *  • once picked, the zone and the UTC offset for the birth date are shown;
 *  • "Advanced: set timezone manually" lets the user override the zone (IANA list
 *    + live offset preview).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { geocodeCity, type GeoResult } from '@/services/geocoding';
import type { SavedCity } from '@/services/savedProfile';
import { listTimezones, timezoneForCoordinates } from '@/lib/timezone/birthTimezone';
import { resolveForPlace } from '@/lib/timezone/clientBirth';

export interface CityPickerProps {
  testid: string;
  value: SavedCity | null;
  onPick: (c: SavedCity | null) => void;
  /** Birth date/time (YYYY-MM-DD / HH:MM) — used to show the offset for that date. */
  dob?: string;
  time?: string;
  id?: string;
  placeholder?: string;
  ariaLabel?: string;
}

const DOB_RE = /^\d{4}-\d{2}-\d{2}$/;

export function CityPicker({ testid, value, onPick, dob, time, id, placeholder = 'Birth city (e.g. Delhi)', ariaLabel = 'Birth city' }: CityPickerProps) {
  const [query, setQuery] = useState(value?.name ?? '');
  const [options, setOptions] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchedNetwork, setSearchedNetwork] = useState(false);
  const reqId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-sync when a saved profile arrives asynchronously.
  useEffect(() => {
    if (value?.name && value.name !== query) setQuery(value.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.name, value?.lat]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const runSearch = async (q: string, network: boolean) => {
    const my = ++reqId.current;
    setSearching(true);
    try {
      const res = await geocodeCity(q, { network });
      if (my === reqId.current) { setOptions(res); setSearchedNetwork(network || res.some(r => r.source === 'osm')); }
    } catch { if (my === reqId.current) setOptions([]); }
    finally { if (my === reqId.current) setSearching(false); }
  };

  const onChange = (v: string) => {
    setQuery(v); onPick(null); setSearchedNetwork(false);
    if (timer.current) clearTimeout(timer.current);
    if (v.trim().length >= 3) timer.current = setTimeout(() => runSearch(v, false), 300);
    else { reqId.current++; setOptions([]); setSearching(false); }
  };

  const pick = (o: GeoResult) => {
    const base: SavedCity = { name: o.label, lat: o.lat, lon: o.lon, tz: o.utcOffset, timezone: timezoneForCoordinates(o.lat, o.lon), manualTimezone: false };
    if (dob && DOB_RE.test(dob)) {
      try { base.tz = resolveForPlace(dob, time, base).utcOffsetHours; } catch { /* keep today's offset */ }
    }
    onPick(base); setQuery(o.label); setOptions([]);
  };

  const resolved = useMemo(() => {
    if (!value) return null;
    try {
      return resolveForPlace(dob && DOB_RE.test(dob) ? dob : new Date().toISOString().slice(0, 10), time, value);
    } catch { return null; }
  }, [value, dob, time]);

  const zones = useMemo(() => listTimezones(), []);
  const setManual = (zone: string) => {
    if (!value) return;
    if (!zone) onPick({ ...value, timezone: timezoneForCoordinates(value.lat, value.lon), manualTimezone: false });
    else onPick({ ...value, timezone: zone, manualTimezone: true });
  };

  const needsPick = !value && query.trim().length > 0 && !searching && options.length === 0;

  return (
    <div className="relative">
      <input id={id} data-testid={testid} type="text" value={query} onChange={e => onChange(e.target.value)}
             placeholder={placeholder} aria-label={ariaLabel} autoComplete="off"
             className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
      {options.length > 0 && (
        <ul data-testid={`${testid}-options`} className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow max-h-56 overflow-y-auto">
          {options.map((o, i) => (
            <li key={`${o.label}-${o.lat}-${i}`}>
              <button type="button" onClick={() => pick(o)} data-testid={`${testid}-option`}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#6E5AA6]/10 text-gray-900">
                {o.label}
              </button>
            </li>
          ))}
          {!searchedNetwork && (
            <li>
              <button type="button" data-testid={`${testid}-more`} onClick={() => runSearch(query, true)}
                      className="w-full text-left px-3 py-2 text-xs text-[#6E5AA6] underline hover:bg-[#6E5AA6]/10">
                Not listed? Search more places named “{query.trim()}”
              </button>
            </li>
          )}
        </ul>
      )}
      {searching && <p className="text-[11px] text-muted-foreground mt-1">Searching…</p>}
      {needsPick && (
        <p data-testid={`${testid}-pick-hint`} className="text-xs text-amber-700 mt-1">
          Please pick your birth city from the list so we use the right place and time zone.
          {!searchedNetwork && query.trim().length >= 3 && (
            <> <button type="button" className="underline" onClick={() => runSearch(query, true)}>Search more places</button></>
          )}
        </p>
      )}
      {value && resolved && (
        <p data-testid={`${testid}-tz`} className="text-[11px] text-muted-foreground mt-1">
          Time zone: {resolved.timezone} · {resolved.utcOffsetLabel}{dob && DOB_RE.test(dob) ? ' on the birth date' : ' today'}
          {value.manualTimezone ? ' (set manually)' : ''}
        </p>
      )}
      {value && resolved?.note && <p className="text-[11px] text-amber-700 mt-1">{resolved.note}</p>}
      {value && (
        <details className="mt-1">
          <summary className="text-[11px] text-muted-foreground cursor-pointer">Advanced: set timezone manually</summary>
          <select data-testid={`${testid}-tz-manual`} aria-label="Time zone"
                  value={value.manualTimezone ? (value.timezone ?? '') : ''}
                  onChange={e => setManual(e.target.value)}
                  className="mt-1 w-full px-2 py-1 border border-border rounded-lg bg-background text-foreground text-xs">
            <option value="">Automatic (from birthplace)</option>
            {zones.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          {resolved && (
            <p data-testid={`${testid}-tz-preview`} className="text-[11px] text-muted-foreground mt-1">
              Offset applied: {resolved.utcOffsetLabel} ({resolved.timezone})
            </p>
          )}
        </details>
      )}
      <p className="text-[11px] text-muted-foreground mt-1">
        City search © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a> contributors
      </p>
    </div>
  );
}

export default CityPicker;
