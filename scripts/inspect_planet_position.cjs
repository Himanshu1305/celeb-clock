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
  const url = 'https://api.prokerala.com/v2/astrology/planet-position?datetime=' + encodeURIComponent(datetime) + '&coordinates=' + coords + '&ayanamsa=1';
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
