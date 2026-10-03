import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const googleReqs = [];
p.on('request', r => { const u = r.url(); if (/fonts\.(googleapis|gstatic)/.test(u)) googleReqs.push(u); });
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
const info = await p.evaluate(async () => {
  await document.fonts.ready;
  const h1 = document.querySelector('h1');
  const loaded = [...document.fonts].map(f => `${f.family} ${f.weight} ${f.status}`);
  return { h1Text: h1?.textContent?.slice(0,40), h1Font: h1 ? getComputedStyle(h1).fontFamily : null,
    faces: loaded.filter(x => /Fraunces|Public Sans/.test(x)) };
});
console.log('google font requests:', googleReqs.length);
console.log('h1:', info.h1Text);
console.log('h1 font-family:', info.h1Font);
console.log('loaded faces:', info.faces.slice(0,6));
await b.close();
