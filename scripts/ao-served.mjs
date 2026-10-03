import { chromium } from '@playwright/test';
const B='https://f537587c-bornclock.usdvisionai.workers.dev';
const routes=['/','/kundali/','/numerology/','/life-expectancy/','/zodiac/aries/','/born-on/march-14/','/celebrity/bollywood/','/compatibility/aries/leo/','/age-calculator/','/vedic-astrology/'];
const b=await chromium.launch();
for(const r of routes){
  const p=await b.newPage(); const errs=[];
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,70))});
  p.on('response',res=>{if(res.status()>=500)errs.push('HTTP'+res.status()+' '+res.url().slice(-40))});
  let st=0; try{const resp=await p.goto(B+r,{waitUntil:'networkidle',timeout:40000});st=resp.status();}catch(e){st='ERR'}
  await p.waitForTimeout(600);
  const d=await p.evaluate(()=>({h1:document.querySelectorAll('h1').length, title:document.title.slice(0,50), ld:document.querySelectorAll('script[type="application/ld+json"]').length}));
  console.log(`${r} | ${st} | h1=${d.h1} ld=${d.ld} | err=${errs.length} ${errs[0]||''} | ${d.title}`);
  await p.close();
}
await b.close();
