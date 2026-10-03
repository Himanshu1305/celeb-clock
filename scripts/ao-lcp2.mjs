import { chromium, devices } from '@playwright/test';
async function measure(url){
 const b=await chromium.launch(); const c=await b.newContext({...devices['Pixel 5']}); const p=await c.newPage();
 const cl=await c.newCDPSession(p); await cl.send('Network.enable');
 await cl.send('Network.emulateNetworkConditions',{offline:false,downloadThroughput:1500000/8,uploadThroughput:750000/8,latency:150});
 await cl.send('Emulation.setCPUThrottlingRate',{rate:4});
 await p.goto(url,{waitUntil:'load',timeout:60000}); await p.waitForTimeout(3500);
 const m=await p.evaluate(()=>new Promise(r=>{let lcp=0,el='';try{new PerformanceObserver(l=>{for(const e of l.getEntries()){lcp=e.startTime;el=e.element?e.element.tagName+'.'+(e.element.className||'').slice(0,20):''}}).observe({type:'largest-contentful-paint',buffered:true})}catch{}; const fcp=performance.getEntriesByName('first-contentful-paint')[0]?.startTime||0; setTimeout(()=>r({lcp:Math.round(lcp),fcp:Math.round(fcp),el}),600)}));
 await b.close(); return m;
}
const u='https://f537587c-bornclock.usdvisionai.workers.dev/';
for(let i=0;i<2;i++){const m=await measure(u); console.log(`preview run${i+1}: FCP=${m.fcp} LCP=${m.lcp} el=${m.el}`);}
