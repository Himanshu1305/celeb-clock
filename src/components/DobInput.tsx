import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * DobInput — the ONE shared date-of-birth entry component (P3, batch 8).
 *
 * Three labelled DD / MM / YYYY text fields with a numeric mobile keyboard, hard digit
 * caps, auto- and smart-advance, backspace-return, blur zero-padding, digit paste, and
 * inline trio validation (impossible / future / >120y). Never uses type="number" or a
 * native date picker. Emits both the raw fields and a parsed Date.
 */

export interface DobValue { day: string; month: string; year: string; }
export interface DobInputProps {
  value?: DobValue;
  onChange?: (v: DobValue) => void;
  /** Called with a Date when the trio is a valid, in-range DOB; null otherwise. */
  onValidChange?: (date: Date | null) => void;
  label?: string;
  autoFocus?: boolean;
  className?: string;
  idPrefix?: string;
}

/** Format a Date as YYYY-MM-DD (local) — for surfaces that keep an ISO-string DOB. */
export const toISODate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const digitsOnly = (s: string) => s.replace(/\D+/g, '');
const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const daysInMonth = (m: number, y: number) =>
  [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1] ?? 31;

/** Validate a DD/MM/YYYY trio. Returns a parsed Date + an error message (null if valid). */
export function parseDob(day: string, month: string, year: string): { date: Date | null; error: string | null; complete: boolean } {
  const complete = day.length >= 1 && month.length >= 1 && year.length === 4;
  if (!complete) return { date: null, error: null, complete: false };
  const d = parseInt(day, 10), m = parseInt(month, 10), y = parseInt(year, 10);
  if (m < 1 || m > 12) return { date: null, error: 'That month doesn’t exist — use 1–12.', complete };
  if (d < 1 || d > daysInMonth(m, y)) return { date: null, error: `${['January','February','March','April','May','June','July','August','September','October','November','December'][m - 1]} ${y} doesn’t have a day ${d}.`, complete };
  const date = new Date(y, m - 1, d);
  const now = new Date();
  if (date.getTime() > now.getTime()) return { date: null, error: 'That date is in the future — enter a birth date.', complete };
  const earliest = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
  if (date.getTime() < earliest.getTime()) return { date: null, error: 'That’s more than 120 years ago — please check the year.', complete };
  return { date, error: null, complete };
}

export function DobInput({ value, onChange, onValidChange, label = 'Date of birth', autoFocus, className, idPrefix = 'dob' }: DobInputProps) {
  const [day, setDay] = useState(value?.day ?? '');
  const [month, setMonth] = useState(value?.month ?? '');
  const [year, setYear] = useState(value?.year ?? '');
  const [touched, setTouched] = useState(false);

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  // Controlled sync (if a parent drives value).
  useEffect(() => {
    if (value) { setDay(value.day); setMonth(value.month); setYear(value.year); }
  }, [value?.day, value?.month, value?.year]); // eslint-disable-line react-hooks/exhaustive-deps

  const { date, error } = parseDob(day, month, year);

  // Emit up whenever the fields change.
  const emit = useCallback((d: string, m: string, y: string) => {
    onChange?.({ day: d, month: m, year: y });
    onValidChange?.(parseDob(d, m, y).date);
  }, [onChange, onValidChange]);

  const focusEnd = (el: HTMLInputElement | null) => {
    if (!el) return;
    el.focus();
    // place cursor at end
    const v = el.value; requestAnimationFrame(() => { try { el.setSelectionRange(v.length, v.length); } catch { /* noop */ } });
  };

  const handleDay = (raw: string) => {
    const v = digitsOnly(raw).slice(0, 2);
    setDay(v); emit(v, month, year);
    // auto-advance: 2 digits, OR first digit ≥4 (no valid 2-digit day starts 4-9)
    if (v.length === 2 || (v.length === 1 && parseInt(v, 10) >= 4)) focusEnd(monthRef.current);
  };
  const handleMonth = (raw: string) => {
    const v = digitsOnly(raw).slice(0, 2);
    setMonth(v); emit(day, v, year);
    // auto-advance: 2 digits, OR first digit ≥2 (no valid 2-digit month starts 2-9)
    if (v.length === 2 || (v.length === 1 && parseInt(v, 10) >= 2)) focusEnd(yearRef.current);
  };
  const handleYear = (raw: string) => {
    const v = digitsOnly(raw).slice(0, 4);
    setYear(v); emit(day, month, v);
  };

  // Backspace on an empty field returns focus to the previous field (value intact).
  const onKeyDown = (which: 'day' | 'month' | 'year') => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && e.currentTarget.value === '') {
      if (which === 'month') { e.preventDefault(); focusEnd(dayRef.current); }
      else if (which === 'year') { e.preventDefault(); focusEnd(monthRef.current); }
    }
  };

  // Zero-pad day/month on blur (5 → 05); mark touched so validation can show.
  const padOnBlur = (which: 'day' | 'month') => () => {
    setTouched(true);
    if (which === 'day' && day.length === 1) { const v = day.padStart(2, '0'); setDay(v); emit(v, month, year); }
    if (which === 'month' && month.length === 1) { const v = month.padStart(2, '0'); setMonth(v); emit(day, v, year); }
  };

  // Paste of a full date into any field distributes across the trio.
  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const nums = digitsOnly(text);
    if (nums.length === 8) {
      // DDMMYYYY
      e.preventDefault();
      const d = nums.slice(0, 2), m = nums.slice(2, 4), y = nums.slice(4, 8);
      setDay(d); setMonth(m); setYear(y); emit(d, m, y); focusEnd(yearRef.current);
    } else if (/[/.\-\s]/.test(text)) {
      // separated like 2/5/1985 or 02-05-1985
      const parts = text.split(/[/.\-\s]+/).filter(Boolean).map(digitsOnly);
      if (parts.length === 3) {
        e.preventDefault();
        const d = parts[0].slice(0, 2), m = parts[1].slice(0, 2), y = parts[2].slice(0, 4);
        setDay(d); setMonth(m); setYear(y); emit(d, m, y); focusEnd(yearRef.current);
      }
    }
  };

  const fieldCls = 'w-full text-center border border-gray-300 rounded-xl px-2 py-3 text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  const showError = touched && error;

  return (
    <div className={className}>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor={`${idPrefix}-day`}>{label}</label>}
      <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-2" role="group" aria-label={label}>
        <input
          ref={dayRef} id={`${idPrefix}-day`} type="text" inputMode="numeric" pattern="[0-9]*"
          autoComplete="bday-day" placeholder="DD" aria-label="Day" maxLength={2} autoFocus={autoFocus}
          value={day} onChange={e => handleDay(e.target.value)} onKeyDown={onKeyDown('day')} onBlur={padOnBlur('day')}
          onPaste={onPaste} onFocus={e => e.target.select()}
          className={fieldCls} aria-invalid={!!showError}
        />
        <input
          ref={monthRef} id={`${idPrefix}-month`} type="text" inputMode="numeric" pattern="[0-9]*"
          autoComplete="bday-month" placeholder="MM" aria-label="Month" maxLength={2}
          value={month} onChange={e => handleMonth(e.target.value)} onKeyDown={onKeyDown('month')} onBlur={padOnBlur('month')}
          onPaste={onPaste} onFocus={e => e.target.select()}
          className={fieldCls} aria-invalid={!!showError}
        />
        <input
          ref={yearRef} id={`${idPrefix}-year`} type="text" inputMode="numeric" pattern="[0-9]*"
          autoComplete="bday-year" placeholder="YYYY" aria-label="Year" maxLength={4}
          value={year} onChange={e => handleYear(e.target.value)} onKeyDown={onKeyDown('year')} onBlur={() => setTouched(true)}
          onPaste={onPaste} onFocus={e => e.target.select()}
          className={fieldCls} aria-invalid={!!showError}
        />
      </div>
      {showError
        ? <p className="mt-1.5 text-sm text-rose-600" role="alert">{error}</p>
        : <p className="mt-1.5 text-xs text-gray-400">DD · MM · YYYY — e.g. 02 · 05 · 1985</p>}
    </div>
  );
}

export default DobInput;
