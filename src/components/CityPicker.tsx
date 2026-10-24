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
 *
 * f5-city-picker additions:
 *  • a CONFIRM line after picking — "Born in Pontiac, Michigan, USA · time zone
 *    America/Detroit (UTC−5 on that date, standard time)" — computed for the BIRTH
 *    date (historical offset: DST, war time, older standard offsets), with "Edit";
 *  • a pre-1970 note, and the DST-changeover note when the time is ambiguous;
 *  • ARIA combobox/listbox semantics + keyboard (↑ ↓ Enter Esc);
 *  • same-name suggestions with an identical label get their coordinates appended.
 */
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { geocodeCity, type GeoResult } from '@/services/geocoding';
import type { SavedCity } from '@/services/savedProfile';
import { listTimezones, timezoneForCoordinates } from '@/lib/timezone/birthTimezone';
import { resolveForPlace } from '@/lib/timezone/clientBirth';
import { describeBirthZone, birthPlaceConfirmLine } from '@/lib/timezone/placeConfirm';

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
  const [active, setActive] = useState(-1);
  const reqId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const uid = useId();
  const listId = `${testid}-listbox-${uid}`;
  const confirmId = `${testid}-confirm-${uid}`;

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
      if (my === reqId.current) { setOptions(res); setActive(-1); setSearchedNetwork(network || res.some(r => r.source === 'osm')); }
    } catch { if (my === reqId.current) setOptions([]); }
    finally { if (my === reqId.current) setSearching(false); }
  };

  const onChange = (v: string) => {
    // Free text is never accepted: any edit clears the picked place until one is chosen again.
    setQuery(v); onPick(null); setSearchedNetwork(false); setActive(-1);
    if (timer.current) clearTimeout(timer.current);
    if (v.trim().length >= 3) timer.current = setTimeout(() => runSearch(v, false), 300);
    else { reqId.current++; setOptions([]); setSearching(false); }
  };

  const pick = (o: GeoResult) => {
    const base: SavedCity = { name: o.label, lat: o.lat, lon: o.lon, tz: o.utcOffset, timezone: timezoneForCoordinates(o.lat, o.lon), manualTimezone: false };
    if (dob && DOB_RE.test(dob)) {
      try { base.tz = resolveForPlace(dob, time, base).utcOffsetHours; } catch { /* keep today's offset */ }
    }
    onPick(base); setQuery(o.label); setOptions([]); setActive(-1);
  };

  const edit = () => {
    const el = inputRef.current;
    if (el) { el.focus(); el.select(); }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!options.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => (a + 1) % options.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => (a <= 0 ? options.length - 1 : a - 1)); }
    else if (e.key === 'Enter') { if (active >= 0) { e.preventDefault(); pick(options[active]); } }
    else if (e.key === 'Escape') { e.preventDefault(); setOptions([]); setActive(-1); }
  };

  // Same-name suggestions that would read identically get their coordinates appended.
  const labels = useMemo(() => {
    const count = new Map<string, number>();
    options.forEach(o => count.set(o.label, (count.get(o.label) ?? 0) + 1));
    const fmt = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(2)}°${v >= 0 ? pos : neg}`;
    return options.map(o => (count.get(o.label)! > 1 ? `${o.label} (${fmt(o.lat, 'N', 'S')}, ${fmt(o.lon, 'E', 'W')})` : o.label));
  }, [options]);

  const resolved = useMemo(() => {
    if (!value) return null;
    try {
      return resolveForPlace(dob && DOB_RE.test(dob) ? dob : new Date().toISOString().slice(0, 10), time, value);
    } catch { return null; }
  }, [value, dob, time]);

  const summary = useMemo(() => {
    if (!value) return null;
    try { return describeBirthZone(dob, time, value); } catch { return null; }
  }, [value, dob, time]);

  const zones = useMemo(() => listTimezones(), []);
  const setManual = (zone: string) => {
    if (!value) return;
    if (!zone) onPick({ ...value, timezone: timezoneForCoordinates(value.lat, value.lon), manualTimezone: false });
    else onPick({ ...value, timezone: zone, manualTimezone: true });
  };

  const needsPick = !value && query.trim().length > 0 && !searching && options.length === 0;
  const open = options.length > 0;

  return (
    <div className="relative">
      <input id={id} ref={inputRef} data-testid={testid} type="text" value={query} onChange={e => onChange(e.target.value)}
             onKeyDown={onKeyDown}
             placeholder={placeholder} aria-label={ariaLabel} autoComplete="off"
             role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={listId}
             aria-activedescendant={open && active >= 0 ? `${listId}-opt-${active}` : undefined}
             aria-describedby={value ? confirmId : undefined}
             aria-invalid={needsPick || undefined}
             className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
      {open && (
        <ul id={listId} role="listbox" aria-label={`${ariaLabel} suggestions`} data-testid={`${testid}-options`} className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow max-h-56 overflow-y-auto">
          {options.map((o, i) => (
            <li key={`${o.label}-${o.lat}-${i}`} role="presentation">
              <button type="button" role="option" id={`${listId}-opt-${i}`} aria-selected={i === active} tabIndex={-1}
                      onMouseDown={e => e.preventDefault()} onClick={() => pick(o)} data-testid={`${testid}-option`}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[#6E5AA6]/10 text-gray-900 ${i === active ? 'bg-[#6E5AA6]/10' : ''}`}>
                {labels[i]}
              </button>
            </li>
          ))}
          {!searchedNetwork && (
            <li role="presentation">
              <button type="button" data-testid={`${testid}-more`} onClick={() => runSearch(query, true)}
                      className="w-full text-left px-3 py-2 text-xs text-[#6E5AA6] underline hover:bg-[#6E5AA6]/10">
                Not listed? Search more places named “{query.trim()}”
              </button>
            </li>
          )}
        </ul>
      )}
      {searching && <p className="text-[11px] text-muted-foreground mt-1" aria-live="polite">Searching…</p>}
      {needsPick && (
        <p data-testid={`${testid}-pick-hint`} className="text-xs text-amber-700 mt-1" role="status">
          Please pick your birth city from the list so we use the right place and time zone.
          {!searchedNetwork && query.trim().length >= 3 && (
            <> <button type="button" className="underline" onClick={() => runSearch(query, true)}>Search more places</button></>
          )}
        </p>
      )}
      {value && summary && (
        <div id={confirmId} data-testid={`${testid}-confirm`} role="status" aria-live="polite"
             className="mt-1 flex items-start justify-between gap-2 rounded-lg border border-border bg-background/60 px-2 py-1">
          <p data-testid={`${testid}-tz`} className="text-xs text-foreground break-words">
            {birthPlaceConfirmLine(value.name, summary, !!value.manualTimezone)}
          </p>
          <button type="button" data-testid={`${testid}-edit`} onClick={edit}
                  aria-label={`Edit birth city (${value.name})`}
                  className="shrink-0 text-xs text-[#6E5AA6] underline">
            Edit
          </button>
        </div>
      )}
      {value && summary?.changeoverNote && <p className="text-[11px] text-amber-700 mt-1">{summary.changeoverNote}</p>}
      {value && summary?.pre1970Note && <p data-testid={`${testid}-pre1970`} className="text-[11px] text-muted-foreground mt-1">{summary.pre1970Note}</p>}
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
