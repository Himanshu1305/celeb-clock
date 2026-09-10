const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function normalize360(deg) { return ((deg % 360) + 360) % 360; }
function tzOffsetToUTC(y, m, d, h, min, tz) { return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000); }

const birthUTC = tzOffsetToUTC(1977, 6, 15, 12, 0, 5.5);
const chart = generateFullChart(birthUTC, new Date(), 28.6139, 77.2090);

const rahuSign = chart.planets.Rahu.rashiIndex;
const ketuSign = chart.planets.Ketu.rashiIndex;
const classical = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];

function signInArc(sign, startSign, endSign) {
  const arcLen = normalize360(endSign*30 - startSign*30) / 30;
  const pos = normalize360(sign*30 - startSign*30) / 30;
  return pos <= arcLen;
}

const inRahuArc = classical.map(n => signInArc(chart.planets[n].rashiIndex, rahuSign, ketuSign));
const inKetuArc = classical.map(n => signInArc(chart.planets[n].rashiIndex, ketuSign, rahuSign));
const rahuArcCount = inRahuArc.filter(Boolean).length;
const ketuArcCount = inKetuArc.filter(Boolean).length;

console.log('Rahu arc count:', rahuArcCount, '(all 7 = planets are in Rahu-to-Ketu arc)');
console.log('Ketu arc count:', ketuArcCount, '(all 7 = planets are in Ketu-to-Rahu arc)');
console.log('AstrologyAPI says: Full Ascending, type=Kulik');
console.log('If rahuArcCount=7: our "Ascending" label should apply, per our code (isFullRahu -> Ascending)');
