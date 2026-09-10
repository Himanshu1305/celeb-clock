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
  return await res.json();
}

async function main() {
  // Chart 2: Leap day 2000, Delhi
  const body = { day: 29, month: 2, year: 2000, hour: 6, min: 0, lat: 28.6139, lon: 77.2090, tzone: 5.5 };
  const kalsarpa = await callEndpoint('kalsarpa_details', body);
  console.log(JSON.stringify(kalsarpa, null, 2));
}
main();
