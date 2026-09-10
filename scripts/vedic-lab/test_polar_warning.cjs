const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) {
  return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000);
}

// Tromso, Norway - should trigger the warning
const tromsoBirth = tzOffsetToUTC(1978, 1, 15, 9, 0, 1);
const tromsoChart = generateFullChart(tromsoBirth, new Date(), 69.6492, 18.9553);
console.log('Tromso warnings:', JSON.stringify(tromsoChart.warnings, null, 2));

// Reference chart (Delhi, normal latitude) - should NOT trigger
const refBirth = new Date('1988-11-05T07:00:00.000Z');
const refChart = generateFullChart(refBirth, new Date(), 28.6139, 77.2090);
console.log('Reference chart warnings:', JSON.stringify(refChart.warnings, null, 2));

// Edge case just under threshold (66 deg) - should NOT trigger
const edgeChart = generateFullChart(tromsoBirth, new Date(), 66.0, 18.9553);
console.log('66.0 deg latitude warnings:', JSON.stringify(edgeChart.warnings, null, 2));

// Edge case just over threshold (67 deg) - should trigger
const edgeChart2 = generateFullChart(tromsoBirth, new Date(), 67.0, 18.9553);
console.log('67.0 deg latitude warnings:', JSON.stringify(edgeChart2.warnings, null, 2));
