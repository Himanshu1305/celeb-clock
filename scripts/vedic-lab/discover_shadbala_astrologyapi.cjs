require('dotenv').config({path:'.env.local'});

async function callEndpoint(endpoint, body) {
  const userId = process.env.ASTROLOGYAPI_USER_ID;
  const apiKey = process.env.ASTROLOGYAPI_API_KEY;
  const authHeader = 'Basic ' + Buffer.from(userId + ':' + apiKey).toString('base64');
  const res = await fetch('https://json.astrologyapi.com/v1/' + endpoint, {
    method: 'POST',
    headers: { 'Authorization': authHeader, 'Content-Type': 'application/json', 'Accept-Language': 'en' },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function main() {
  const body = { day: 5, month: 11, year: 1988, hour: 12, min: 30, lat: 28.6139, lon: 77.2090, tzone: 5.5 };
  const candidates = ['shadbala', 'planet_bala', 'graha_bala', 'shad_bala', 'bala', 'planet_strength'];
  for (const ep of candidates) {
    const result = await callEndpoint(ep, body);
    console.log(ep, ':', result.status, JSON.stringify(result.data).slice(0, 150));
    await new Promise(r => setTimeout(r, 800));
  }
}
main();
