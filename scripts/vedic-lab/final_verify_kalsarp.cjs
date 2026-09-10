const { generateFullChart } = require('./vedicEngineStage1b.cjs');
const { getKaalSarpDetails } = require('./kaalSarpComplete.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) { return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000); }

const chart2 = generateFullChart(tzOffsetToUTC(2000, 2, 29, 6, 0, 5.5), new Date(), 28.6139, 77.2090);
console.log('Chart 2 (expect present=true, isPartial=true, type=Takshak, direction=Ascending):');
console.log(JSON.stringify(getKaalSarpDetails(chart2), null, 2));

const chart1977 = generateFullChart(tzOffsetToUTC(1977, 6, 15, 12, 0, 5.5), new Date(), 28.6139, 77.2090);
console.log('');
console.log('1977 chart (expect present=true, isPartial=false, type=Kulik, direction=Ascending):');
console.log(JSON.stringify(getKaalSarpDetails(chart1977), null, 2));
