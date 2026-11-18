// B14: generates src/data/guideSamples.json — the worked SAMPLE outputs shown in the
// explanatory guides below the tools on /kundali, /kundali-match, /sade-sati, /manglik,
// /kaal-sarp-dosha, /dasha-calculator, /nakshatra, /moon-sign, /rashifal-by-date-of-birth,
// /child-kundli, /rashifal, /hi/rashifal, /hi/kundli-milan, /kundli-milan-by-name and
// /vedic-astrology.
//
// Every number on those sample cards comes from THIS script running the same engine the
// tools use (calculateBirthChart, calculateGunaMilan, computeSadeSati, readName/matchByName,
// buildChildKundli, calculateDateOnlyRashi, grahaPositions) — nothing is typed by hand.
// The births are illustrative sample births (not real people). Output is deterministic
// (fixed births + fixed reference date), and src/data/__tests__/guideSamples.test.ts
// re-runs this builder and fails if the committed JSON differs.
//
// Run: npx tsx scripts/gen-guide-samples.mts   (also runs at the start of every build)
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildGuideSamples } from '../src/lib/guides/buildGuideSamples';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../src/data/guideSamples.json');

const json = JSON.stringify(await buildGuideSamples(), null, 1) + '\n';
const prev = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
if (prev !== json) writeFileSync(OUT, json);
console.log(`[guide-samples] ${prev === json ? 'unchanged' : 'written'}: ${OUT}`);
