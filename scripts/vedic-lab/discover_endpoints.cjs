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

async function tryEndpoint(token, name, path) {
  const datetime = '1988-11-05T12:30:00+05:30';
  const coords = '28.6139,77.2090';
  const url = 'https://api.prokerala.com/v2/astrology/' + path + '?datetime=' + encodeURIComponent(datetime) + '&coordinates=' + coords + '&ayanamsa=1';
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  const data = await res.json();
  console.log(name, '(', path, '):', 'HTTP', res.status, '| API status:', data.status, data.status === 'error' ? JSON.stringify(data.errors?.[0]?.detail) : 'OK - keys: ' + Object.keys(data.data || {}));
}

async function main() {
  const token = await getToken();
  const candidates = [
    ['Kaal Sarp Dosha', 'kaal-sarp-dosh'],
    ['Sade Sati', 'sade-sati'],
    ['Chart (Navamsa)', 'chart'],
    ['Natal Chart', 'natal-chart'],
  ];
  for (const [name, path] of candidates) {
    await tryEndpoint(token, name, path);
    await new Promise(r => setTimeout(r, 1000));
  }
}

main();
