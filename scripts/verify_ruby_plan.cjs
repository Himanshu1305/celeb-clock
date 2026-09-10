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

  // Fire 6 rapid requests - would have failed on free tier (5/min limit),
  // should succeed now on Ruby (60/min)
  const promises = [];
  for (let i = 0; i < 6; i++) {
    promises.push(
      fetch('https://api.prokerala.com/v2/astrology/planet-position?datetime=' + encodeURIComponent('2020-01-0' + (i+1) + 'T12:00:00+05:30') + '&coordinates=28.6139,77.2090&ayanamsa=1', { headers: { Authorization: 'Bearer ' + token } })
        .then(r => r.json())
    );
  }
  const results = await Promise.all(promises);
  results.forEach((r, i) => console.log('Request', i+1, '- status:', r.status, r.status === 'error' ? JSON.stringify(r.errors) : 'OK'));
}

test();
