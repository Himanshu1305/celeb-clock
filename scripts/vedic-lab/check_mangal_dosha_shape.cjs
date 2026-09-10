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

  const datetime = '1988-11-05T12:30:00+05:30';
  const coords = '28.6139,77.2090';
  const url = 'https://api.prokerala.com/v2/astrology/kundli/advanced?datetime=' + encodeURIComponent(datetime) + '&coordinates=' + coords + '&ayanamsa=1';
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  const data = await res.json();
  console.log('mangal_dosha:', JSON.stringify(data.data?.mangal_dosha, null, 2));
}

test();
