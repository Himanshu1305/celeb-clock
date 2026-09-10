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
  console.log('Token OK:', !!token);

  const testCases = [
    { label: 'Toronto tz=-5 (FAILED in our test)', datetime: '2021-08-10T12:33:00-05:00', coords: '43.6532,-79.3832' },
    { label: 'Reykjavik tz=0 (FAILED in our test)', datetime: '1990-06-21T12:00:00+00:00', coords: '64.1466,-21.9426' },
    { label: 'Delhi tz=5.5 (WORKED in our test)', datetime: '2005-06-15T00:00:00+05:30', coords: '28.6139,77.2090' },
  ];

  for (const tc of testCases) {
    const url = 'https://api.prokerala.com/v2/astrology/planet-position?datetime=' + encodeURIComponent(tc.datetime) + '&coordinates=' + tc.coords + '&ayanamsa=1';
    const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    const data = await res.json();
    console.log('---', tc.label, '---');
    console.log('HTTP status:', res.status);
    console.log('Response status field:', data.status);
    if (data.status === 'error') {
      console.log('ERROR:', JSON.stringify(data.errors));
    } else {
      console.log('Planet count:', data.data?.planet_position?.length);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}

test();
