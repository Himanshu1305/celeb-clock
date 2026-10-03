import { chromium } from '@playwright/test';
const b = await chromium.launch(); 
for (const r of ['/numerology','/age-calculator','/age-in-days','/birthday-countdown','/celebrity','/celebrity/bollywood']) {
  const p = await b.newPage(); await p.goto('http://localhost:4173'+r,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(400);
  const n = await p.evaluate(()=>document.querySelectorAll('h1').length);
  const navy = await p.evaluate(()=>{for(const h of document.querySelectorAll('header')){const bg=getComputedStyle(h).backgroundColor;const m=bg.match(/\d+/g);if(m&&+m[0]<40&&+m[2]<75)return true}return false});
  console.log(r, 'h1='+n, 'navyHeader='+navy); await p.close();
}
await b.close();
