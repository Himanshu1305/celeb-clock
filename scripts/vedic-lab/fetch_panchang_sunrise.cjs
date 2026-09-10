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
  const url = 'https://api.prokerala.com/v2/astrology/panchang?datetime=' + encodeURIComponent(datetime) + '&coordinates=' + coords + '&ayanamsa=1';
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  const data = await res.json();
  console.log('Sunrise:', data.data?.sunrise);
  console.log('Sunset:', data.data?.sunset);
  console.log('Moonrise:', data.data?.moonrise);
  console.log('Moonset:', data.data?.moonset);
}
main();
