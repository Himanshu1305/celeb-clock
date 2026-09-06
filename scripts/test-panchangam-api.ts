/**
 * Verifies @fusionstrings/panchangam loads and prints its actual API surface.
 * Run: npx tsx scripts/test-panchangam-api.ts
 */
import * as panchangam from '@fusionstrings/panchangam';
import pkg from '@fusionstrings/panchangam/package.json';

console.log(`panchangam v${pkg.version} — license ${pkg.license}`);

const keys = Object.keys(panchangam);
const fns = keys.filter(k => typeof (panchangam as any)[k] === 'function' && !k.startsWith('__'));
console.log(`\nCallable exports (${fns.length}):`);
console.log('  ' + fns.join(', '));

// Smoke: Julian Day → Nakshatra (Lahiri) for Virat Kohli's DOB (UT-adjusted).
const { p_julday, calculate_nakshatra, AyanamshaMode, get_ayanamsha, calculate_planets } = panchangam as any;
const jd = p_julday(1988, 11, 5, 12 + 30 / 60 - 5.5, 1);
const nak = calculate_nakshatra(jd, AyanamshaMode.Lahiri);
const ayan = get_ayanamsha(AyanamshaMode.Lahiri, jd);
const planets = calculate_planets(jd, 1);
console.log(`\nSmoke test (1988-11-05 12:30 IST, Lahiri):`);
console.log(`  Julian Day: ${jd}`);
console.log(`  Ayanamsha:  ${ayan.toFixed(4)}°`);
console.log(`  Nakshatra:  ${nak.name} (index ${nak.index}, pada ${nak.pada})`);
console.log(`  Moon lon:   ${planets[1].longitude.toFixed(2)}° sidereal`);
console.log('\nOK — panchangam API is callable.');
