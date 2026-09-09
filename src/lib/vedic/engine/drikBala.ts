/**
 * Shadbala — Drik Bala (Aspectual Strength). Ported from
 * scripts/vedic-lab/drikBala.cjs.
 *
 * Sputa Drishti curve verified against 7 anchor points; special aspects
 * (Mars 4th/8th, Jupiter 5th/9th, Saturn 3rd/10th) per BPHS-cited source.
 * Final total capped at ±60 per documented range. Confidence: component-verified
 * (Kala/Drik Bala row) → exact-match on sub-components; combined value softened.
 */
function normalize360(deg: number): number { return ((deg % 360) + 360) % 360; }

export function getSputaDrishti(angleDiff: number): number {
  const a = normalize360(angleDiff);
  if (a < 30 || a > 300) return 0;
  if (a <= 60) return 15 * (a - 30) / 30;
  if (a <= 90) return 15 + 30 * (a - 60) / 30;
  if (a <= 120) return 45 - 15 * (a - 90) / 30;
  if (a <= 150) return 30 - 30 * (a - 120) / 30;
  if (a <= 180) return 60 * (a - 150) / 30;
  return 60 * (300 - a) / 120;
}

const SPECIAL_ASPECTS: Record<string, Array<{ housesAway: number; strength: number }>> = {
  Mars: [{ housesAway: 3, strength: 0.75 }, { housesAway: 7, strength: 0.75 }],
  Jupiter: [{ housesAway: 4, strength: 0.50 }, { housesAway: 8, strength: 0.50 }],
  Saturn: [{ housesAway: 2, strength: 0.25 }, { housesAway: 9, strength: 0.25 }],
};

function getAspectStrength(aspectingPlanet: string, aspectingLon: number, targetLon: number): number {
  const angleDiff = normalize360(targetLon - aspectingLon);
  const baseDrishti = getSputaDrishti(angleDiff);

  const aspectingSign = Math.floor(aspectingLon / 30);
  const targetSign = Math.floor(targetLon / 30);
  const signsAway = (targetSign - aspectingSign + 12) % 12;

  const rules = SPECIAL_ASPECTS[aspectingPlanet];
  if (rules) {
    for (const rule of rules) {
      if (rule.housesAway === signsAway) {
        return Math.max(baseDrishti, rule.strength * 60);
      }
    }
  }
  return baseDrishti;
}

const ALWAYS_BENEFIC = ['Jupiter', 'Venus'];
const ALWAYS_MALEFIC = ['Sun', 'Mars', 'Saturn'];

export function getDrikBala(targetPlanet: string, targetLongitude: number, allPlanetLongitudes: Record<string, number>): number {
  let total = 0;
  for (const [aspectingPlanet, aspectingLon] of Object.entries(allPlanetLongitudes)) {
    if (aspectingPlanet === targetPlanet) continue;
    if (!ALWAYS_BENEFIC.includes(aspectingPlanet) && !ALWAYS_MALEFIC.includes(aspectingPlanet)) continue;
    const raw = getAspectStrength(aspectingPlanet, aspectingLon, targetLongitude);
    if (raw === 0) continue;
    const isBenefic = ALWAYS_BENEFIC.includes(aspectingPlanet);
    total += isBenefic ? raw * 1.25 : -(raw * 0.75);
  }
  return Math.max(-60, Math.min(60, total));
}
