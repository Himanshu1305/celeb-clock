require('dotenv').config({path:'.env.local'});
const fs = require('fs');

const charts = [
  {"id":17,"label":"US DST spring-forward day 2020","y":2020,"m":3,"d":8,"h":2,"min":30,"lat":40.7128,"lon":-74.0060,"tz":-5},
  {"id":14,"label":"Near Arctic Circle (Reykjavik)","y":1990,"m":6,"d":21,"h":12,"min":0,"lat":64.1466,"lon":-21.9426,"tz":0},
  {"id":20,"label":"Fiji near date line","y":2010,"m":5,"d":5,"h":10,"min":0,"lat":-18.1416,"lon":178.4419,"tz":12},
  {"id":22,"label":"Sydney Australia","y":1992,"m":9,"d":9,"h":7,"min":20,"lat":-33.8688,"lon":151.2093,"tz":10},
  {"id":31,"label":"Random #1 (Singapore, 2016)","y":2016,"m":10,"d":27,"h":18,"min":33,"lat":1.3521,"lon":103.8198,"tz":8},
  {"id":32,"label":"Random #2 (Bangalore, 1991)","y":1991,"m":1,"d":20,"h":18,"min":42,"lat":12.9716,"lon":77.5946,"tz":5.5},
  {"id":33,"label":"Random #3 (Chennai, 2003)","y":2003,"m":12,"d":28,"h":21,"min":10,"lat":13.0827,"lon":80.2707,"tz":5.5},
  {"id":36,"label":"Random #6 (Chennai, 1950)","y":1950,"m":11,"d":14,"h":4,"min":52,"lat":13.0827,"lon":80.2707,"tz":5.5},
  {"id":37,"label":"Random #7 (Chennai, 1969)","y":1969,"m":10,"d":8,"h":0,"min":58,"lat":13.0827,"lon":80.2707,"tz":5.5},
  {"id":39,"label":"Random #9 (Chennai, 1975)","y":1975,"m":10,"d":25,"h":9,"min":29,"lat":13.0827,"lon":80.2707,"tz":5.5},
  {"id":2,"label":"Leap day 2000 (century leap year)","y":2000,"m":2,"d":29,"h":6,"min":0,"lat":28.6139,"lon":77.2090,"tz":5.5}
];

async function fetchOne(c) {
  const url = `https://staging.bornclock.com/api/kundali?y=${c.y}&m=${c.m}&d=${c.d}&h=${c.h}&min=${c.min}&lat=${c.lat}&lon=${c.lon}&tz=${c.tz}&_=refetch2`;
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
    if (r.prokerala?.error) {
      console.log('  -> STILL FAILED:', r.prokerala.error);
    } else if (r.prokerala?.nakshatra?.nakshatra === 'Unknown') {
      console.log('  -> STILL BAD (Unknown nakshatra)');
    } else {
      console.log('  -> OK:', r.prokerala?.nakshatra?.nakshatra, r.prokerala?.rashi);
    }
    results.push(r);
    // 15 second spacing: well under rate limit even with 3 parallel calls/chart
    await new Promise(res => setTimeout(res, 15000));
  }
  fs.writeFileSync('/tmp/prokerala-results-round2.json', JSON.stringify(results, null, 2));
  console.log('Done. Written to /tmp/prokerala-results-round2.json');
}

main();
