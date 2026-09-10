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

async function main() {
  const token = await getToken();
  const datetime = '1988-11-05T12:30:00+05:30';
  const coords = '28.6139,77.2090';

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

  console.log('Lahiri Sun longitude (full precision):', lahiriSun.longitude);
  console.log('KP Sun longitude (full precision):', kpSun.longitude);
  console.log('Difference:', lahiriSun.longitude - kpSun.longitude, 'degrees');
  console.log('In arcseconds:', (lahiriSun.longitude - kpSun.longitude) * 3600);
  console.log('In arcminutes:', (lahiriSun.longitude - kpSun.longitude) * 60);
}
main();
