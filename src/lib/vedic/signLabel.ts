/** English names for the 1-based sign index used by /api/kundali (1 = Aries … 12 = Pisces). */
export const SIGN_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

/** "Kanya (Virgo)" from the engine's Rashi name + 1-based sign index (falls back to the name). */
export function signLabel(name: string | null | undefined, signIndex?: number): string {
  const en = signIndex && signIndex >= 1 && signIndex <= 12 ? SIGN_EN[signIndex - 1] : '';
  if (!name) return en || '—';
  return en && en !== name ? `${name} (${en})` : name;
}
