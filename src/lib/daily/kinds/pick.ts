/** Deterministic phrasing choice: same (date, slug, key) → same variant, every build. */
export function pick<T>(options: readonly T[], ...seed: (string | number)[]): T {
  let h = 2166136261;
  const s = seed.join('|');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return options[(h >>> 0) % options.length];
}

export const ORD_EN = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
/** Hindi oblique ordinals for "Nth house" (पहले भाव …), as in src/lib/vedic/rashifal.ts. */
export const ORD_HI = ['', 'पहले', 'दूसरे', 'तीसरे', 'चौथे', 'पाँचवें', 'छठे', 'सातवें', 'आठवें', 'नौवें', 'दसवें', 'ग्यारहवें', 'बारहवें'];
