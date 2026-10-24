/**
 * "What this number means for you" — one plain-language line under every numeric
 * astrology result (Batch 5, goal b). Pure functions so they can be unit-tested and
 * reused by any page. Calm, non-fear tone; thresholds come from the same rules the
 * engine itself uses (matchmaking.ts bands, strengthScale.ts minimums, the 30° sign).
 */
import { REQUIRED_SHADBALA, shadbalaRatio, STRONG_RATIO } from './strengthScale';

/** One Ashtakoota koota score, e.g. Bhakoot 0/7. */
export function kootaScoreNote(key: string, score: number, max: number): string {
  if (!(max > 0)) return '';
  if (score >= max) return `Full ${max} of ${max} — this part of the match is fully in tune.`;
  if (score <= 0) {
    if (key === 'nadi') return `0 of ${max} — the same Nadi for both (Nadi Dosha). Check the cancellation note above; many matches with this are still accepted.`;
    if (key === 'bhakoot') return `0 of ${max} — the Moon signs sit in a 2/12, 5/9 or 6/8 pattern (Bhakoot Dosha). Friendly sign lords can soften it; see the note above.`;
    return `0 of ${max} — this part does not match. It is one of eight parts; the others can balance it.`;
  }
  const share = score / max;
  if (share >= 0.5) return `${score} of ${max} — a reasonable fit on this part.`;
  return `${score} of ${max} — a partial fit on this part; worth being aware of, not a deal-breaker alone.`;
}

/** The Guna Milan total out of 36 — bands match matchmaking.ts (18 / 24 / 28). */
export function gunaTotalNote(total: number): string {
  if (total >= 28) return `${total} of 36 — an excellent score; well above the traditional pass mark of 18.`;
  if (total >= 24) return `${total} of 36 — a good score; comfortably above the traditional pass mark of 18.`;
  if (total >= 18) return `${total} of 36 — above the traditional pass mark of 18, so the match is acceptable by Guna Milan.`;
  return `${total} of 36 — below the traditional pass mark of 18. Families usually then look at doshas, cancellations and the full charts before deciding.`;
}

/** The South-Indian 10-Porutham count. */
export function poruthamCountNote(met: number, essentialsMet?: boolean): string {
  const base = `${met} of 10 checks met`;
  const ess = essentialsMet === undefined ? '' : essentialsMet
    ? ' — and the two essential ones (Rajju and Dina) are met.'
    : ' — but at least one essential check (Rajju or Dina) is not met, which this system weighs most.';
  if (ess) return base + ess;
  return met >= 6 ? `${base} — generally treated as a workable match.` : `${base} — fewer than half; read the essential ones (Rajju, Dina) first.`;
}

/**
 * A planet's or the Lagna's degree within its sign (0–30). Accepts either a degree
 * already within the sign or a full 0–360 longitude.
 */
export function degreeNote(degree: number, what = 'It'): string {
  if (!Number.isFinite(degree)) return '';
  const d = ((((degree % 360) + 360) % 360) % 30);
  const whole = Math.floor(d);
  const place = d < 10 ? 'early in' : d < 20 ? 'in the middle of' : 'late in';
  const edge = d < 1 || d >= 29
    ? ' It is within 1° of a sign boundary, so a birth time a few minutes off could change the sign.'
    : '';
  return `${what} is ${whole}° into a 30° sign — ${place} the sign.${edge}`;
}

/** Nakshatra pada (1–4). */
export function padaNote(pada: number): string {
  if (!(pada >= 1 && pada <= 4)) return '';
  const which = ['first', 'second', 'third', 'fourth'][pada - 1];
  return `Pada ${pada} = the ${which} of the star's four quarters; it also sets the traditional first sound for a name.`;
}

/** Shadbala total for a planet, in virupas (60 virupas = 1 rupa). */
export function shadbalaNote(planet: string, virupas: number): string {
  if (!Number.isFinite(virupas)) return '';
  const rupas = (virupas / 60).toFixed(2);
  const req = REQUIRED_SHADBALA[planet];
  const r = shadbalaRatio(planet, virupas);
  if (!req || r === null) return `${rupas} rupas (${Math.round(virupas)} virupas).`;
  const min = (req / 60).toFixed(1).replace(/\.0$/, '');
  const pct = Math.round(r * 100);
  const verdict = r >= STRONG_RATIO ? 'clearly strong' : r >= 1 ? 'meets its classical minimum' : 'below its classical minimum, so it may need support';
  return `${rupas} rupas = ${pct}% of the ${min} rupas ${planet} classically needs — ${verdict}.`;
}

/** A Dasha shown as "Maha/Antar". */
export function dashaPairNote(maha: string, antar: string): string {
  if (!maha) return '';
  return antar
    ? `${maha} sets the main theme of these years; ${antar} colours the current shorter stretch.`
    : `${maha} sets the main theme of these years.`;
}

/** One biorhythm reading (−100…+100 %). */
export function biorhythmNote(value: number): string {
  if (!Number.isFinite(value)) return '';
  if (Math.abs(value) <= 10) return 'Near 0% — a "switch-over" day in the model; just for fun.';
  if (value > 0) return `+${value}% — the upper half of the cycle in this model (for fun, not a prediction).`;
  return `${value}% — the lower half of the cycle in this model; a reminder to pace yourself, nothing more.`;
}

/** Choghadiya / Panchang limb "till" time. */
export function limbEndNote(): string {
  return 'Each limb changes at the time shown; the next one then applies. A Panchang day runs sunrise to sunrise.';
}
