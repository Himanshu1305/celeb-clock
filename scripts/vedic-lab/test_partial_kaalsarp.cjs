const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function normalize360(deg) { return ((deg % 360) + 360) % 360; }
function tzOffsetToUTC(y, m, d, h, min, tz) { return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000); }

function getKaalSarpDetails(chart) {
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

  const isFullRahu = rahuArcCount === 7;
  const isFullKetu = ketuArcCount === 7;
  const isPartialRahu = rahuArcCount === 6;
  const isPartialKetu = ketuArcCount === 6;

  const KAAL_SARP_TYPES = { 1:'Anant',2:'Kulik',3:'Vasuki',4:'Shankhpal',5:'Padma',6:'Mahapadma',7:'Takshak',8:'Karkotak',9:'Shankhnaad',10:'Patak',11:'Vishdhar',12:'Sheshnag' };
  const lagnaSignIdx = chart.lagna.rashiIndex;
  const rahuHouse = ((rahuSign - lagnaSignIdx + 12) % 12) + 1;
  const type = KAAL_SARP_TYPES[rahuHouse];

  if (isFullRahu || isFullKetu) {
    return { present: true, isPartial: false, type, direction: isFullRahu ? 'Ascending' : 'Descending' };
  }
  if (isPartialRahu || isPartialKetu) {
    return { present: true, isPartial: true, type, direction: isPartialRahu ? 'Ascending' : 'Descending' };
  }
  return { present: false, isPartial: false, type: null, direction: null };
}

const birthUTC = tzOffsetToUTC(2000, 2, 29, 6, 0, 5.5);
const chart = generateFullChart(birthUTC, new Date(), 28.6139, 77.2090);
console.log(JSON.stringify(getKaalSarpDetails(chart), null, 2));
console.log('Expected: present=true, isPartial=true, type=Takshak, direction=Ascending (matches AstrologyAPI real result)');
