// Shared HONESTY FRAMING for the fitness / rhythm SEO pages (Phase B).
// This is non-negotiable brand policy: the biorhythm three-cycle model is a
// rhythm-awareness practice, NOT a predictive or medical tool. Every fitness page
// imports and renders RHYTHM_SCIENCE_NOTE and RHYTHM_DISCLAIMER, and uses the
// check-in register ("may", "many people find", "a prompt to check in") — never a
// prescription. No claims of performance, injury prevention, hormonal/medical
// effects, or weight loss are permitted anywhere on these pages.
import { calculateBiorhythm } from './biorhythmData';

// Mirrors the report's Biorhythm section (09 · CYCLES) science note.
export const RHYTHM_SCIENCE_NOTE =
  'A note on the science: the three-cycle biorhythm model dates from the early 20th century, and controlled research has not found it predictive at statistically significant levels. Treat everything here as a rhythm-awareness practice — a daily prompt to check in with your physical, emotional, and mental state — rather than a prediction. The question “what does my body actually need today?” is worth asking regardless of what the chart says.';

// Standard disclaimer line used in the report footer.
export const RHYTHM_DISCLAIMER =
  'For reflection and self-awareness only. Biorhythm is a cultural framework, not a predictive science. Nothing here is medical, psychological, or fitness advice — check in with your own body, and with a qualified professional for health decisions.';

// A plain-English, honest check-in prompt for a given physical reading. Deliberately
// framed as an invitation to notice, never an instruction to train harder/rest.
export function checkInPrompt(physical: number, emotional: number): string {
  if (physical > 50 && emotional > 50)
    return 'Both your physical and emotional rhythms read high today. Many people take a day like this as a cue to check in and see whether they feel like doing something a little more active or social — only you can tell how you actually feel.';
  if (physical > 50)
    return 'Your physical rhythm reads high today. Some people use this as a prompt to notice their energy and, if it matches, lean into movement they enjoy. Listen to your body first.';
  if (physical < -50)
    return 'Your physical rhythm reads low today. That is simply a prompt to check in — many people find a gentler, restful day sits well when the chart is here. There is no rule; notice what you need.';
  if (emotional > 50)
    return 'Your emotional rhythm reads high while the physical sits mid-range. A good moment, some find, to check in on mood and connection rather than push physically.';
  return 'Your rhythms are mixed or mid-range today — a neutral reading. The useful move is the same as always: pause and ask what your body and mind actually need right now.';
}

// Validate a YYYY-MM-DD birthdate. Returns { date } for a real, non-future,
// post-1900 date, or { error } for an impossible (e.g. Feb 30) or future date.
// Never throws. Exported so both the widget and the tests use the same logic.
export function validateDob(s: string): { date: Date } | { error: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return { error: 'Please enter a valid date of birth.' };
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const date = new Date(y, mo - 1, d, 12, 0, 0, 0);
  // Round-trip check rejects impossible dates like Feb 30 (which JS rolls into March).
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) {
    return { error: "That date doesn't exist on the calendar — please check the day and month." };
  }
  const today = new Date(); today.setHours(12, 0, 0, 0);
  if (date.getTime() > today.getTime()) return { error: 'Your date of birth is in the future — please enter a past date.' };
  if (y < 1900) return { error: 'Please enter a date of birth after 1900.' };
  return { date };
}

// The reader's next date (within `horizon` days) when BOTH physical and emotional
// readings are positive — used by the habit-timing widget as a gentle "upswing" cue.
export function nextUpswing(birthDate: Date, horizon = 30): { date: Date; physical: number; emotional: number } | null {
  const today = new Date(); today.setHours(12, 0, 0, 0);
  for (let i = 0; i <= horizon; i++) {
    const d = new Date(today); d.setDate(d.getDate() + i);
    const r = calculateBiorhythm(birthDate, d);
    if (r.physical > 0 && r.emotional > 0) return { date: d, physical: r.physical, emotional: r.emotional };
  }
  return null;
}
