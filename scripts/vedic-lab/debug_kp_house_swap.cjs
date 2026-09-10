const fs = require('fs');
const { calculatePlacidusCusps } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) { return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000); }

const results = JSON.parse(fs.readFileSync('/tmp/astrologyapi-batch-25.json', 'utf8'));
const chart2 = results.find(r => r.id === 2);

console.log('AstrologyAPI cusps for chart 2:');
chart2.kpCusps.forEach(c => console.log('House', c.house_id, ':', c.cusp_full_degree));

const birthUTC = tzOffsetToUTC(chart2.input.y, chart2.input.m, chart2.input.d, chart2.input.h, chart2.input.min, chart2.input.tz);
const ourCusps = calculatePlacidusCusps(birthUTC, chart2.input.lat, chart2.input.lon);
console.log('');
console.log('Our cusps for chart 2:');
for (let h = 1; h <= 12; h++) console.log('House', h, ':', ourCusps[h].toFixed(4));
