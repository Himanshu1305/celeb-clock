/**
 * Honest "probability of reaching 100" estimate — Growth P1 (NS-P100).
 *
 * This is a transparent statistical ESTIMATE, not an actuarial guarantee. We
 * take a personal life-expectancy forecast (the modelled age at death) and
 * approximate the spread of adult lifespans around it with a normal
 * distribution. National period life tables (US SSA, UK ONS, WHO GHO) show the
 * standard deviation of adult age-at-death is roughly 10 years; we use that.
 *
 *   P(reach 100) ≈ 1 − Φ((100 − forecastAge) / SD)
 *
 * The figure is always labelled as an estimate derived from the forecast, and
 * never presented as a promise. No fabricated data.
 */

const LIFESPAN_SD = 10; // years — approx SD of adult age-at-death from national life tables

/** Standard normal CDF via the Abramowitz–Stegun erf approximation. */
function normalCdf(z: number): number {
  // erf approximation (max error ~1.5e-7)
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
  const cdf = 0.5 * (1 + Math.sign(z) * y);
  return cdf;
}

/**
 * Estimated probability (0..1) of living to at least `target` years, given a
 * life-expectancy forecast (age at death). SD defaults to the ~10-year adult
 * lifespan spread seen in national life tables.
 */
export function probabilityOfReaching(forecastAge: number, target = 100, sd = LIFESPAN_SD): number {
  if (!isFinite(forecastAge) || forecastAge <= 0) return 0;
  const z = (target - forecastAge) / sd;
  const p = 1 - normalCdf(z);
  return Math.min(0.99, Math.max(0.001, p));
}

/** A rounded, display-friendly percentage for P(reach target). */
export function reachPercent(forecastAge: number, target = 100): number {
  const p = probabilityOfReaching(forecastAge, target) * 100;
  return p >= 10 ? Math.round(p) : Math.round(p * 10) / 10;
}
