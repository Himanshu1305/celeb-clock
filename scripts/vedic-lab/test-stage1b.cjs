const { generateFullChart } = require('./vedicEngineStage1b.cjs');
const birthUTC = new Date('1988-11-05T07:00:00.000Z');
const refUTC = new Date();
const chart = generateFullChart(birthUTC, refUTC, 28.6139, 77.2090);
console.log('Lagna:', JSON.stringify(chart.lagna, null, 2));
console.log('Mars house:', chart.planets.Mars.house, '(expect 3, from earlier ProKerala test)');
console.log('Mangal Dosha:', JSON.stringify(chart.doshas.mangalDosha, null, 2));
console.log('(ProKerala says has_dosha: false for this chart)');
