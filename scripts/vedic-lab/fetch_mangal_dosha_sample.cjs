require('dotenv').config({path:'.env.local'});
const fs = require('fs');

const allCharts = JSON.parse(fs.readFileSync('/tmp/all-100-charts.json', 'utf8'));
// Sample: first 20 charts (covers reference, edge cases, and some randoms)
const sample = allCharts.slice(0, 20);

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

function prokeralaDatetime(y, m, d, h, min, tz) {
  const sign = tz >= 0 ? '+' : '-';
  const abstz = Math.abs(tz);
  const tzH = String(Math.floor(abstz)).padStart(2, '0');
  const tzM = tz % 1 === 0.5 ? '30' : '00';
  return y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0')+'T'+String(h).padStart(2,'0')+':'+String(min).padStart(2,'0')+':00'+sign+tzH+':'+tzM;
}

async function main() {
  const token = await getToken();
  const results = [];
  for (const c of sample) {
    const datetime = prokeralaDatetime(c.y, c.m, c.d, c.h, c.min, c.tz);
    const coords = c.lat + ',' + c.lon;
    const url = 'https://api.prokerala.com/v2/astrology/kundli/advanced?datetime=' + encodeURIComponent(datetime) + '&coordinates=' + coords + '&ayanamsa=1';
    const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    const data = await res.json();
    const mangalDosha = data.data?.mangal_dosha;
    console.log(`[${c.id}] ${c.label}: has_dosha=${mangalDosha?.has_dosha}`);
    results.push({ id: c.id, label: c.label, input: c, mangal_dosha: mangalDosha });
    await new Promise(r => setTimeout(r, 1500));
  }
  fs.writeFileSync('/tmp/mangal-dosha-sample.json', JSON.stringify(results, null, 2));
  console.log('\nWritten to /tmp/mangal-dosha-sample.json');
}

main();
