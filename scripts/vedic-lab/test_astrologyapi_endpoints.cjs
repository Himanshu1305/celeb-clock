require('dotenv').config({path:'.env.local'});

async function callEndpoint(endpoint, body) {
  const userId = process.env.ASTROLOGYAPI_USER_ID;
  const apiKey = process.env.ASTROLOGYAPI_API_KEY;
  const authHeader = 'Basic ' + Buffer.from(userId + ':' + apiKey).toString('base64');

  const res = await fetch('https://json.astrologyapi.com/v1/' + endpoint, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Accept-Language': 'en',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function main() {
  const body = { day: 5, month: 11, year: 1988, hour: 12, min: 30, lat: 28.6139, lon: 77.2090, tzone: 5.5 };

  console.log('=== current_vdasha ===');
  const dasha = await callEndpoint('current_vdasha', body);
  console.log(dasha.status, JSON.stringify(dasha.data, null, 2));

  console.log('');
  console.log('=== manglik ===');
  const manglik = await callEndpoint('manglik', body);
  console.log(manglik.status, JSON.stringify(manglik.data, null, 2));

  console.log('');
  console.log('=== kalsarpa_details ===');
  const kalsarpa = await callEndpoint('kalsarpa_details', body);
  console.log(kalsarpa.status, JSON.stringify(kalsarpa.data, null, 2));

  console.log('');
  console.log('=== kp_house_cusps ===');
  const kpCusps = await callEndpoint('kp_house_cusps', body);
  console.log(kpCusps.status, JSON.stringify(kpCusps.data, null, 2));
}
main();
