const { generateFullChart } = require('./vedicEngineStage1.cjs');
const birthUTC = new Date('1988-11-05T07:00:00.000Z');
const refUTC = new Date();
const chart = generateFullChart(birthUTC, refUTC);
console.log(JSON.stringify(chart, null, 2));
