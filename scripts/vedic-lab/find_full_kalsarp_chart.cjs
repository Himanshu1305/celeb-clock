require('dotenv').config({path:'.env.local'});
const { generateFullChart } = require('./vedicEngineStage1b.cjs');

function tzOffsetToUTC(y, m, d, h, min, tz) { return new Date(Date.UTC(y, m - 1, d, h, min) - tz * 3600 * 1000); }

async function callEndpoint(endpoint, body) {
  const userId = process.env.ASTROLOGYAPI_USER_ID;
  const apiKey = process.env.ASTROLOGYAPI_API_KEY;
  const authHeader = 'Basic ' + Buffer.from(userId + ':' + apiKey).toString('base64');
  const res = await fetch('https://json.astrologyapi.com/v1/' + endpoint, {
    method: 'POST',
    headers: { 'Authorization': authHeader, 'Content-Type': 'application/json', 'Accept-Language': 'en' },
    body: JSON.stringify(body),
  });
  return await res.json();
}

async function main() {
  // Search a wide date range for a chart our engine flags as FULL (not partial) Kaal Sarp
  for (let year = 1950; year < 2026; year += 3) {
    const birthUTC = tzOffsetToUTC(year, 6, 15, 12, 0, 5.5);
    const chart = generateFullChart(birthUTC, new Date(), 28.6139, 77.2090);
    if (chart.doshas.kaalSarpDosha) {
      console.log('Found FULL Kaal Sarp candidate at year', year);
      const body = { day: 15, month: 6, year, hour: 12, min: 0, lat: 28.6139, lon: 77.2090, tzone: 5.5 };
      const result = await callEndpoint('kalsarpa_details', body);
      console.log(JSON.stringify(result, null, 2));
      return;
    }
  }
  console.log('No full Kaal Sarp chart found in range, trying different day of month...');
}
main();
