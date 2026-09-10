require('dotenv').config({path:'.env.local'});

async function getToken() {
  const id = process.env.VITE_PROKERALA_CLIENT_ID;
  const secret = process.env.VITE_PROKERALA_CLIENT_SECRET;
  const res = await fetch('https://api.prokerala.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret })
  });
  const data = await res.json();
  return data.access_token;
}

async function testChart(token, label, datetime, coords) {
  const lahiriUrl = 'https://api.prokerala.com/v2/astrology/planet-position?datetime=' + encodeURIComponent(datetime) + '&coordinates=' + coords + '&ayanamsa=1';
  const kpUrl = 'https://api.prokerala.com/v2/astrology/kp-planet-position?datetime=' + encodeURIComponent(datetime) + '&coordinates=' + coords + '&ayanamsa=1';
  const [lahiriRes, kpRes] = await Promise.all([
    fetch(lahiriUrl, { headers: { Authorization: 'Bearer ' + token } }),
    fetch(kpUrl, { headers: { Authorization: 'Bearer ' + token } }),
  ]);
  const lahiriData = await lahiriRes.json();
  const kpData = await kpRes.json();
  const lahiriSun = lahiriData.data.planet_position.find(p => p.name === 'Sun');
  const kpSun = kpData.data.planet_positions.find(p => p.planet.name === 'Sun');
  const diffArcsec = (lahiriSun.longitude - kpSun.longitude) * 3600;
  console.log(label, '- Lahiri:', lahiriSun.longitude, '| KP:', kpSun.longitude, '| Diff (arcsec):', diffArcsec);
}

async function main() {
  const token = await getToken();
  // Very different era from the first test (1901 vs 1988) to see if any
  // date-dependent drift appears, which would indicate a real but tiny
  // ayanamsa difference rather than a hardcoded identical value.
  await testChart(token, 'Chart A (1901, Kolkata)', '1901-04-12T08:30:00+05:30', '22.5726,88.3639');
  await new Promise(r => setTimeout(r, 1500));
  await testChart(token, 'Chart B (2024, Chennai)', '2024-02-29T23:45:00+05:30', '13.0827,80.2707');
  await new Promise(r => setTimeout(r, 1500));
  await testChart(token, 'Chart C (1960, Delhi)', '1960-06-15T06:00:00+05:30', '28.6139,77.2090');
}
main();
