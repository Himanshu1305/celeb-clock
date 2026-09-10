const { generateFullChart } = require('./vedicEngineStage1b.cjs');
const birthUTC = new Date('1988-11-05T07:00:00.000Z');
const chart = generateFullChart(birthUTC, new Date(), 28.6139, 77.2090);
console.log('Reference chart Kaal Sarp:', chart.doshas.kaalSarpDosha, '- expect false (validated earlier tonight)');
