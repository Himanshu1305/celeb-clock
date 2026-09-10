require('dotenv').config({path:'.env.local'});
const fs = require('fs');

const allCharts = JSON.parse(fs.readFileSync('/tmp/all-100-charts.json', 'utf8'));
const sample = allCharts.slice(0, 15);

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
  for (const c of sample) {
    const body = { day: c.d, month: c.m, year: c.y, hour: c.h, min: c.min, lat: c.lat, lon: c.lon, tzone: c.tz };
    const manglik = await callEndpoint('manglik', body);
    console.log(c.id, c.label, '-> percentage:', manglik.percentage_manglik_present, 'is_present:', manglik.is_present, 'based_on_house:', JSON.stringify(manglik.manglik_present_rule?.based_on_house));
    results.push({ id: c.id, label: c.label, input: c, manglik });
    await new Promise(r => setTimeout(r, 800));
  }
  fs.writeFileSync('/tmp/manglik-percentages.json', JSON.stringify(results, null, 2));
}
main();
