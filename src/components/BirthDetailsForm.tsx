/**
 * Shared birth-details form (Part E) — date + time + city, used by the Vedic
 * features so a user enters these once. Uses native date/time inputs and the
 * existing geocoding service (matches KundaliPage's prior inline form, so its
 * data-testids and behaviour are preserved).
 *
 * Includes an OPTIONAL "Save my birth details" opt-in checkbox — persistence is
 * always the user's explicit choice (privacy decision, Part E Phase 0).
 */
import { useState, useEffect } from 'react';
import { geocodeCity, type GeoResult } from '@/services/geocoding';
import type { SavedCity } from '@/services/savedProfile';

export interface BirthDetails { dob: string; time: string; city: SavedCity }

export interface BirthDetailsFormProps {
  initial?: { dob?: string; time?: string; city?: SavedCity | null };
  submitLabel: string;
  loadingLabel?: string;
  loading?: boolean;
  onSubmit: (details: BirthDetails) => void;
  /** Show the "Save my birth details" opt-in checkbox. */
  showSaveOption?: boolean;
  saveChecked?: boolean;
  onSaveCheckedChange?: (checked: boolean) => void;
  /** data-testid prefix (default 'birth'). KundaliPage passes 'kundali'. */
  testIdPrefix?: string;
}

export function BirthDetailsForm({
  initial, submitLabel, loadingLabel = 'Generating…', loading = false, onSubmit,
  showSaveOption = false, saveChecked = false, onSaveCheckedChange, testIdPrefix = 'birth',
}: BirthDetailsFormProps) {
  const p = testIdPrefix;
  const [dob, setDob] = useState(initial?.dob ?? '');
  const [time, setTime] = useState(initial?.time ?? '');
  const [cityQuery, setCityQuery] = useState(initial?.city?.name ?? '');
  const [options, setOptions] = useState<GeoResult[]>([]);
  const [city, setCity] = useState<SavedCity | null>(initial?.city ?? null);

  // Re-sync when the initial (e.g. a saved profile that loads async) arrives.
  useEffect(() => {
    if (initial?.dob !== undefined) setDob(initial.dob);
    if (initial?.time !== undefined) setTime(initial.time);
    if (initial?.city) { setCity(initial.city); setCityQuery(initial.city.name); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.dob, initial?.time, initial?.city?.name, initial?.city?.lat]);

  const validDob = /^\d{4}-\d{2}-\d{2}$/.test(dob);
  const validTime = /^\d{2}:\d{2}$/.test(time);
  const canSubmit = validDob && validTime && !!city && !loading;

  const onCity = async (v: string) => {
    setCityQuery(v); setCity(null);
    if (v.trim().length >= 3) { try { setOptions(await geocodeCity(v)); } catch { setOptions([]); } }
    else setOptions([]);
  };
  const pickCity = (c: GeoResult) => {
    setCity({ name: c.name, lat: c.lat, lon: c.lon, tz: c.utcOffset });
    setCityQuery(c.name); setOptions([]);
  };

  const submit = () => { if (canSubmit && city) onSubmit({ dob, time, city }); };

  return (
    <div data-testid={`${p}-form`} className="bg-card/60 border border-border rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1" htmlFor={`${p}-dob`}>Date of birth</label>
          <input id={`${p}-dob`} data-testid={`${p}-dob`} type="date" value={dob}
                 onChange={e => setDob(e.target.value)}
                 className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1" htmlFor={`${p}-time`}>Birth time</label>
          <input id={`${p}-time`} data-testid={`${p}-time`} type="time" value={time}
                 onChange={e => setTime(e.target.value)}
                 className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
        </div>
        <div className="relative">
          <label className="block text-xs text-muted-foreground mb-1" htmlFor={`${p}-city`}>Birth city</label>
          <input id={`${p}-city`} data-testid={`${p}-city`} type="text" value={cityQuery}
                 onChange={e => onCity(e.target.value)} placeholder="e.g. Delhi"
                 className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
          {options.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow max-h-48 overflow-y-auto">
              {options.map((o, i) => (
                <li key={`${o.name}-${i}`}>
                  <button type="button" onClick={() => pickCity(o)} className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 text-gray-900">
                    {o.name}{o.state ? `, ${o.state}` : ''}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showSaveOption && (
        <label data-testid={`${p}-save-optin`} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={saveChecked} onChange={e => onSaveCheckedChange?.(e.target.checked)}
                 className="h-4 w-4 rounded border-border" />
          Save my birth details on this device so I don’t have to re-enter them
        </label>
      )}

      <button data-testid={`${p}-generate-btn`} onClick={submit} disabled={!canSubmit}
              className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50">
        {loading ? loadingLabel : submitLabel}
      </button>
      {!canSubmit && !loading && (
        <p data-testid={`${p}-validation-hint`} className="text-xs text-muted-foreground text-center">
          Please enter your date of birth, birth time, and birth city.
        </p>
      )}
    </div>
  );
}

export default BirthDetailsForm;
