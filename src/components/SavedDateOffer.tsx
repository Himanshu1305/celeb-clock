/**
 * Reusable progressive-profile bridge for DATE-ONLY tools (Part K, Item 6).
 *
 * Drop-in offer for any page that collects the user's own birth DATE and produces a
 * personal result (Moon Sign, and future date-only tools). Mirrors the Age Calculator
 * bridge: offers (never forces) to reuse a saved date, and offers (opt-in) to save an
 * entered date into the shared profile. Opt-in + device-only consent unchanged; a page
 * with no saved profile renders nothing extra.
 */
import { useState } from 'react';
import { useSavedProfile } from '@/hooks/useSavedProfile';

export function SavedDateOffer({ dobIso, onUseSaved, prefix = 'date' }: { dobIso: string; onUseSaved: (iso: string) => void; prefix?: string }) {
  const { profile, save } = useSavedProfile();
  const [dismissed, setDismissed] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedDob = profile?.dob || null;

  if (savedDob && !dobIso && !dismissed) {
    return (
      <div data-testid={`${prefix}-use-saved`} className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm">
        <span className="text-indigo-900">★ Use your saved birth date — <strong>{savedDob}</strong>?</span>
        <span className="flex gap-3">
          <button type="button" data-testid={`${prefix}-use-saved-btn`} onClick={() => onUseSaved(savedDob)} className="text-indigo-700 underline hover:text-indigo-900">Use it</button>
          <button type="button" onClick={() => setDismissed(true)} className="text-indigo-500 hover:text-indigo-700">No thanks</button>
        </span>
      </div>
    );
  }
  if (dobIso && !profile && !saved) {
    return (
      <div data-testid={`${prefix}-save-offer`} className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm">
        <span className="text-indigo-900">Save this birth date on this device so other BornClock tools can reuse it?</span>
        <button type="button" data-testid={`${prefix}-save-btn`} onClick={() => { if (save({ dob: dobIso })) setSaved(true); }} className="text-indigo-700 underline hover:text-indigo-900">Save my date</button>
      </div>
    );
  }
  if (saved) {
    return <div data-testid={`${prefix}-saved-confirm`} className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">✓ Saved. Your other tools can now offer to reuse this date.</div>;
  }
  return null;
}

export default SavedDateOffer;
