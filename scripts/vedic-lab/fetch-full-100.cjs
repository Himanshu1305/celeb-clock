require('dotenv').config({path:'.env.local'});
const fs = require('fs');

const charts = JSON.parse(fs.readFileSync('/tmp/all-100-charts.json', 'utf8'));

async function fetchOne(c) {
  const url = `https://staging.bornclock.com/api/kundali?y=${c.y}&m=${c.m}&d=${c.d}&h=${c.h}&min=${c.min}&lat=${c.lat}&lon=${c.lon}&tz=${c.tz}&_=full100`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return { id: c.id, label: c.label, category: c.category, input: c, prokerala: data };
  } catch (e) {
    return { id: c.id, label: c.label, category: c.category, input: c, error: String(e.message || e) };
  }
}

async function main() {
  const results = [];
  let okCount = 0, failCount = 0;
  for (const c of charts) {
    const r = await fetchOne(c);
    const isBad = r.prokerala?.error || r.prokerala?.nakshatra?.nakshatra === 'Unknown';
    if (isBad) { failCount++; console.log(`[${c.id}/100] FAIL: ${c.label} - ${r.prokerala?.error || 'Unknown nakshatra'}`); }
    else { okCount++; console.log(`[${c.id}/100] OK: ${c.label}`); }
    results.push(r);
    await new Promise(res => setTimeout(res, 2000));
  }
  console.log(`\nDone. ${okCount} OK, ${failCount} failed.`);
  fs.writeFileSync('/tmp/prokerala-full-100-results.json', JSON.stringify(results, null, 2));
  console.log('Written to /tmp/prokerala-full-100-results.json');
}

main();
