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
  const chartTypes = ['Hora', 'Drekkana', 'Chaturthamsa', 'Saptamsa', 'Dwadasamsa'];

  for (const ct of chartTypes) {
    const url = 'https://api.prokerala.com/v2/astrology/chart?datetime=' + encodeURIComponent(datetime) + '&coordinates=' + coords + '&ayanamsa=1&chart_type=' + ct + '&chart_style=north-indian&format=json';
    const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    const contentType = res.headers.get('content-type');
    console.log(ct, '- status:', res.status, '- content-type:', contentType);
    if (contentType && contentType.includes('json')) {
      const data = await res.json();
      console.log(JSON.stringify(data).slice(0, 500));
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

main();
