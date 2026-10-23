/**
 * K17: degree-within-sign display. Rounding 29.98° to one decimal printed "30.0°",
 * which reads as the NEXT sign. Degrees and arc-minutes are TRUNCATED (never rounded
 * up), the way almanacs print them: 29.98° → "29°58′", 0.5° → "0°30′".
 */
export function formatDegreeInSign(longitude: number): string {
  const inSign = ((((longitude % 360) + 360) % 360) % 30);
  const totalMin = Math.floor(inSign * 60 + 1e-9);
  const d = Math.floor(totalMin / 60), m = totalMin % 60;
  return `${d}°${String(m).padStart(2, '0')}′`;
}
