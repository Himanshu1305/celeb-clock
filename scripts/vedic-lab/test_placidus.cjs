const { calculatePlacidusCusps } = require('./vedicEngineStage1b.cjs');
const birthUTC = new Date('1988-11-05T07:00:00.000Z');
const cusps = calculatePlacidusCusps(birthUTC, 28.6139, 77.2090);
console.log('House 1 (Asc):', cusps[1].toFixed(4), '| Expected: 279.8770');
console.log('House 11:', cusps[11].toFixed(4), '| Expected: 230.2483');
console.log('House 12:', cusps[12].toFixed(4), '| Expected: 253.5574');
console.log('House 2:', cusps[2].toFixed(4), '| Expected: 319.5073');
console.log('House 3:', cusps[3].toFixed(4), '| Expected: 356.1886');
