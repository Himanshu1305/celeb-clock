require('dotenv').config({path:'.env.local'});
const fs = require('fs');

const charts = JSON.parse(fs.readFileSync('/tmp/selected-for-prokerala.json', 'utf8'));

async function fetchOne(c) {
  const url = `https://staging.bornclock.com/api/kundali?y=${c.y}&m=${c.m}&d=${c.d}&h=${c.h}&min=${c.min}&lat=${c.lat}&lon=${c.lon}&tz=${c.tz}&_=labtest`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return { id: c.id, label: c.label, prokerala: data };
  } catch (e) {
    return { id: c.id, label: c.label, error: String(e.message || e) };
  }
}

async function main() {
  const results = [];
  for (const c of charts) {
    console.log('Fetching:', c.label);
    const r = await fetchOne(c);
    results.push(r);
    // small delay to respect ProKerala's 5 req/min rate limit on cache misses
    await new Promise(res => setTimeout(res, 3000));
  }
  fs.writeFileSync('/tmp/prokerala-results.json', JSON.stringify(results, null, 2));
  console.log('Done. Written to /tmp/prokerala-results.json');
}

main();
