import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { toKundaliLegacy } from '../legacyAdapters';

// K13: /api/kundali now returns drawable D9 (Navamsa) and D10 (Dasamsa) charts.
// Reference: Swiss Ephemeris (pyswisseph, SIDM_LAHIRI, scratchpad engine-audit venv)
// for P7 — 2002-05-14 16:45 EDT (20:45 UTC), Edison NJ 40.5187, -74.4121 — with the
// standard Navamsa (floor(lon·9/30) mod 12) and Dasamsa (odd sign from itself, even
// sign from the 9th) rules:
//   D9 : Lagna Karka; Sun Dhanu, Moon Kanya, Mars Kanya, Mercury Vrishabha, Jupiter Meena,
//        Venus Kanya, Saturn Karka, Rahu Simha, Ketu Kumbha
//   D10: Lagna Dhanu; Sun Makara, Moon Tula, Mars Tula, Mercury Mithuna, Jupiter Dhanu,
//        Venus Tula, Saturn Simha, Rahu Kanya, Ketu Meena
const R = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
const si = (n: string) => R.indexOf(n) + 1;

describe('toKundaliLegacy divisional charts (K13)', () => {
  it('P7 D9 and D10 match the Swiss Ephemeris reference, with houses counted from each chart’s own Lagna', async () => {
    const k = toKundaliLegacy(await calculateBirthChart({ year: 2002, month: 5, day: 14, hour: 16, minute: 45, latitude: 40.5187, longitude: -74.4121, timezoneOffset: -4 }));
    const d9 = k.divisionalCharts.d9!, d10 = k.divisionalCharts.d10!;
    expect(d9.lagnaSignIndex).toBe(si('Karka'));
    expect(d10.lagnaSignIndex).toBe(si('Dhanu'));
    const ref9: Record<string, string> = { Sun: 'Dhanu', Moon: 'Kanya', Mars: 'Kanya', Mercury: 'Vrishabha', Jupiter: 'Meena', Venus: 'Kanya', Saturn: 'Karka', Rahu: 'Simha', Ketu: 'Kumbha' };
    const ref10: Record<string, string> = { Sun: 'Makara', Moon: 'Tula', Mars: 'Tula', Mercury: 'Mithuna', Jupiter: 'Dhanu', Venus: 'Tula', Saturn: 'Simha', Rahu: 'Kanya', Ketu: 'Meena' };
    expect(d9.planets).toHaveLength(9);
    for (const p of d9.planets) {
      expect(p.signIndex, `D9 ${p.name}`).toBe(si(ref9[p.name]));
      expect(p.house).toBe(((p.signIndex - d9.lagnaSignIndex + 12) % 12) + 1);
    }
    for (const p of d10.planets) expect(p.signIndex, `D10 ${p.name}`).toBe(si(ref10[p.name]));
    // Moon in Kanya with a Karka Navamsa Lagna → 3rd house of the D9.
    expect(d9.planets.find(p => p.name === 'Moon')!.house).toBe(3);
  });
});
