/**
 * Shadbala — Drik Bala (Aspectual Strength).
 *
 * Audit K11 rework (Oct 2026):
 *   Drik Bala = ¼ × (sum of benefic aspects received − sum of malefic aspects received)
 * (BPHS 27.19: "reduced by one quarter"), using the Sputa Drishti curve of BPHS 26 and
 * B.V. Raman's special-aspect additions ("Graha and Bhava Balas"): Saturn +45 on the
 * 3rd/10th (60–90°, 270–300°), Mars +15 on the 4th/8th (90–120°, 210–240°), Jupiter
 * +30 on the 5th/9th (120–150°, 240–270°). Benefic/malefic split as in kalaBala.ts
 * (waxing Moon benefic, Mercury by association). This reproduces Raman's worked
 * example to within 0.05 virupa (see the regression test). The old port weighted
 * benefics ×1.25 / malefics ×0.75, ignored Mercury and the Moon, and capped at ±60.
 */
import { beneficMap } from './kalaBala';

function normalize360(deg: number): number { return ((deg % 360) + 360) % 360; }

/** Base Sputa Drishti (0–60) for an aspect angle measured from aspecting → aspected. */
export function getSputaDrishti(angleDiff: number): number {
  const a = normalize360(angleDiff);
  if (a < 30 || a >= 300) return 0;
  if (a < 60) return (a - 30) / 2;
  if (a < 90) return (a - 60) + 15;
  if (a < 120) return (120 - a) / 2 + 30;
  if (a < 150) return 150 - a;
  if (a < 180) return (a - 150) * 2;
  return (300 - a) / 2;
}

/** Sputa Drishti including Raman's special-aspect additions for Mars, Jupiter, Saturn. */
export function getAspectValue(aspectingPlanet: string, angleDiff: number): number {
  const a = normalize360(angleDiff);
  let v = getSputaDrishti(a);
  if (aspectingPlanet === 'Saturn' && ((a >= 60 && a < 90) || (a >= 270 && a < 300))) v += 45;
  if (aspectingPlanet === 'Mars' && ((a >= 90 && a < 120) || (a >= 210 && a < 240))) v += 15;
  if (aspectingPlanet === 'Jupiter' && ((a >= 120 && a < 150) || (a >= 240 && a < 270))) v += 30;
  return v;
}

const SEVEN = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export function getDrikBala(targetPlanet: string, targetLongitude: number, allPlanetLongitudes: Record<string, number>): number {
  const benefic = beneficMap(allPlanetLongitudes);
  let ben = 0, mal = 0;
  for (const p of SEVEN) {
    if (p === targetPlanet || allPlanetLongitudes[p] === undefined) continue;
    const v = getAspectValue(p, targetLongitude - allPlanetLongitudes[p]);
    if (benefic[p]) ben += v; else mal += v;
  }
  return (ben - mal) / 4;
}
