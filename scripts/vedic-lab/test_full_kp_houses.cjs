const { calculatePlacidusCusps, getKPSubLord } = require('./vedicEngineStage1b.cjs');
const birthUTC = new Date('1988-11-05T07:00:00.000Z');
const cusps = calculatePlacidusCusps(birthUTC, 28.6139, 77.2090);

console.log('All 12 house cusps with KP sub-lords:');
for (let h = 1; h <= 12; h++) {
  const kp = getKPSubLord(cusps[h]);
  console.log(`House ${h}: ${cusps[h].toFixed(4)} deg | Star: ${kp.starLord} | Sub: ${kp.subLord} | SubSub: ${kp.subSubLord}`);
}

console.log('');
console.log('Compare House 1 sub-lord against real ProKerala data:');
console.log('Expected: sub_lord=Venus, sub_sub_lord=Ketu (from earlier kp-planet-position fetch)');
console.log('Compare House 11 sub-lord against real ProKerala data:');
console.log('Expected: sub_lord=Venus, sub_sub_lord=Rahu');
console.log('Compare House 2 sub-lord against real ProKerala data:');
console.log('Expected: sub_lord=Mars, sub_sub_lord=Saturn');
