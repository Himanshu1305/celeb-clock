require('dotenv').config({path:'.env.local'});
const fs = require('fs');

const allCharts = JSON.parse(fs.readFileSync('/tmp/all-100-charts.json', 'utf8'));
const sample = allCharts.slice(0, 25);

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
  const results = [];
  let count = 0;
  for (const c of sample) {
    count++;
    const body = { day: c.d, month: c.m, year: c.y, hour: c.h, min: c.min, lat: c.lat, lon: c.lon, tzone: c.tz };
    try {
      const [planets, manglik, kalsarpa, kpCusps] = await Promise.all([
        callEndpoint('planets', body),
        callEndpoint('manglik', body),
        callEndpoint('kalsarpa_details', body),
        callEndpoint('kp_house_cusps', body),
      ]);
      console.log(`[${count}/${sample.length}] id=${c.id} OK`);
      results.push({ id: c.id, label: c.label, input: c, planets, manglik, kalsarpa, kpCusps });
    } catch (e) {
      console.log(`[${count}/${sample.length}] id=${c.id} ERROR: ${e.message}`);
      results.push({ id: c.id, label: c.label, input: c, error: String(e.message || e) });
    }
    await new Promise(r => setTimeout(r, 800));
  }
  fs.writeFileSync('/tmp/astrologyapi-batch-25.json', JSON.stringify(results, null, 2));
  console.log('Done. Written to /tmp/astrologyapi-batch-25.json');
}
main();
