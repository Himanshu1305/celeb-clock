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
import { CityPicker } from '@/components/CityPicker';
import { type SavedCity, sanitizeName, NAME_MAX } from '@/services/savedProfile';
import { resolveForPlace } from '@/lib/timezone/clientBirth';

export interface BirthDetails { dob: string; time: string; city: SavedCity; name?: string }

export interface BirthDetailsFormProps {
  initial?: { dob?: string; time?: string; city?: SavedCity | null; name?: string };
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
  /** B18: label language (default English). Hindi pages pass 'hi'. */
  lang?: 'en' | 'hi';
}

const LABELS = {
  en: {
    name: 'Your name', nameNote: '(optional — used only to personalise headings, never in the calculation)', namePh: 'e.g. Priya',
    dob: 'Date of birth', time: 'Birth time', city: 'Birth city', cityPh: 'e.g. Delhi',
    save: 'Save my birth details on this device so I don’t have to re-enter them',
    pickCity: 'Please pick your birth city from the suggestions list.', fillAll: 'Please enter your date of birth, birth time, and birth city.',
  },
  hi: {
    name: 'आपका नाम', nameNote: '(वैकल्पिक — केवल शीर्षक में, गणना में कभी नहीं)', namePh: 'जैसे प्रिया',
    dob: 'जन्म तिथि', time: 'जन्म समय', city: 'जन्म स्थान (शहर)', cityPh: 'जैसे दिल्ली',
    save: 'मेरा जन्म विवरण इसी डिवाइस पर सहेजें, ताकि दोबारा न भरना पड़े',
    pickCity: 'कृपया सुझावों की सूची से अपना जन्म शहर चुनें।', fillAll: 'कृपया जन्म तिथि, जन्म समय और जन्म शहर भरें।',
  },
} as const;

export function BirthDetailsForm({
  initial, submitLabel, loadingLabel = 'Generating…', loading = false, onSubmit,
  showSaveOption = false, saveChecked = false, onSaveCheckedChange, testIdPrefix = 'birth', lang = 'en',
}: BirthDetailsFormProps) {
  const p = testIdPrefix;
  const L = LABELS[lang];
  const [name, setName] = useState(initial?.name ?? '');
  const [dob, setDob] = useState(initial?.dob ?? '');
  const [time, setTime] = useState(initial?.time ?? '');
  const [city, setCity] = useState<SavedCity | null>(initial?.city ?? null);

  // Re-sync when the initial (e.g. a saved profile that loads async) arrives.
  useEffect(() => {
    if (initial?.dob !== undefined) setDob(initial.dob);
    if (initial?.time !== undefined) setTime(initial.time);
    if (initial?.name !== undefined) setName(initial.name);
    if (initial?.city) setCity(initial.city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.dob, initial?.time, initial?.city?.name, initial?.city?.lat, initial?.name]);

  const validDob = /^\d{4}-\d{2}-\d{2}$/.test(dob);
  const validTime = /^\d{2}:\d{2}$/.test(time);
  const canSubmit = validDob && validTime && !!city && !loading;


  // f5-city-picker: the place sent on is exactly the one picked from the suggestions, with its
  // IANA zone and the offset re-resolved for the FINAL birth date/time (the date may have been
  // changed after the city was picked).
  const submit = () => {
    if (!canSubmit || !city) return;
    let picked: SavedCity = city;
    try {
      const r = resolveForPlace(dob, time, city);
      picked = { ...city, tz: r.utcOffsetHours, timezone: r.timezone };
    } catch { /* keep as picked */ }
    onSubmit({ dob, time, city: picked, name: sanitizeName(name) || undefined });
  };

  return (
    <div data-testid={`${p}-form`} className="bg-card/60 border border-border rounded-xl p-5 space-y-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1" htmlFor={`${p}-name`}>
          {L.name} <span className="text-muted-foreground">{L.nameNote}</span>
        </label>
        <input id={`${p}-name`} data-testid={`${p}-name`} type="text" value={name} maxLength={NAME_MAX}
               onChange={e => setName(e.target.value)} placeholder={L.namePh}
               className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1" htmlFor={`${p}-dob`}>{L.dob}</label>
          <input id={`${p}-dob`} data-testid={`${p}-dob`} type="date" value={dob}
                 onChange={e => setDob(e.target.value)}
                 className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1" htmlFor={`${p}-time`}>{L.time}</label>
          <input id={`${p}-time`} data-testid={`${p}-time`} type="time" value={time}
                 onChange={e => setTime(e.target.value)}
                 className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
        </div>
        <div className="relative">
          <label className="block text-xs text-muted-foreground mb-1" htmlFor={`${p}-city`}>{L.city}</label>
          <CityPicker id={`${p}-city`} testid={`${p}-city`} value={city} onPick={setCity} dob={dob} time={time} placeholder={L.cityPh} />
        </div>
      </div>

      {showSaveOption && (
        <label data-testid={`${p}-save-optin`} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={saveChecked} onChange={e => onSaveCheckedChange?.(e.target.checked)}
                 className="h-4 w-4 rounded border-border" />
          {L.save}
        </label>
      )}

      <button data-testid={`${p}-generate-btn`} onClick={submit} disabled={!canSubmit}
              className="w-full py-3 rounded-lg bg-brand-navy text-white font-semibold hover:bg-brand-navy disabled:opacity-50">
        {loading ? loadingLabel : submitLabel}
      </button>
      {!canSubmit && !loading && (
        <p data-testid={`${p}-validation-hint`} className="text-xs text-muted-foreground text-center">
          {!city && validDob && validTime
            ? L.pickCity
            : L.fillAll}
        </p>
      )}
    </div>
  );
}

export default BirthDetailsForm;
