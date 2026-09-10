require('dotenv').config({path:'.env.local'});

async function test() {
  const id = process.env.VITE_PROKERALA_CLIENT_ID;
  const secret = process.env.VITE_PROKERALA_CLIENT_SECRET;
  const tokenRes = await fetch('https://api.prokerala.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret })
  });
  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;

  const datetime = '2021-08-10T12:33:00-05:00';
  const coords = '43.6532,-79.3832';
  const hdrs = { Authorization: 'Bearer ' + token };

  const endpoints = [
    { name: 'planet-position', url: 'https://api.prokerala.com/v2/astrology/planet-position?datetime=' + encodeURIComponent(datetime) + '&coordinates=' + coords + '&ayanamsa=1' },
    { name: 'birth-details', url: 'https://api.prokerala.com/v2/astrology/birth-details?datetime=' + encodeURIComponent(datetime) + '&coordinates=' + coords + '&ayanamsa=1' },
    { name: 'kundli/advanced', url: 'https://api.prokerala.com/v2/astrology/kundli/advanced?datetime=' + encodeURIComponent(datetime) + '&coordinates=' + coords + '&ayanamsa=1' },
  ];

  for (const ep of endpoints) {
    const res = await fetch(ep.url, { headers: hdrs });
    const data = await res.json();
    console.log('---', ep.name, '(Toronto, tz=-5) ---');
    console.log('HTTP status:', res.status, '| API status:', data.status);
    if (data.status === 'error') {
      console.log('ERROR:', JSON.stringify(data.errors));
    } else {
      console.log('Has data:', !!data.data);
      console.log('Keys:', data.data ? Object.keys(data.data) : 'none');
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}

test();
