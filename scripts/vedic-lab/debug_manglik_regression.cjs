const { generateFullChart } = require('./vedicEngineStage1b.cjs');
const birthUTC = new Date('1988-11-05T07:00:00.000Z');
const chart = generateFullChart(birthUTC, new Date(), 28.6139, 77.2090);
console.log('Mars house:', chart.planets.Mars.house);
console.log('Mangal Dosha object:', JSON.stringify(chart.doshas.mangalDosha, null, 2));
console.log('');
console.log('Expected: Mars house=3, hasDosha=false (validated earlier tonight against ProKerala at 99/99=100%)');
