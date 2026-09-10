const { calculateLagna, generateFullChart } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}

const birthUTC = tzOffsetToUTC(1978, 1, 15, 9, 0, 1);
const chart = generateFullChart(birthUTC, new Date(), 69.6492, 18.9553);
console.log('Lagna:', JSON.stringify(chart.lagna, null, 2));
console.log('Expected sign (from AstrologyAPI, inferred from Sun house 9 vs ours 3): opposite sign from ours');
