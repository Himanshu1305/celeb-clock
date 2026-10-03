import { chromium, devices } from '@playwright/test';

const targets = {
  'production (before)': 'https://bornclock.com/',
  'preview (after)': 'https://f537587c-bornclock.usdvisionai.workers.dev/',
};

async function measure(url) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['Pixel 5'] });
  const page = await ctx.newPage();
  const client = await ctx.newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', { offline: false, downloadThroughput: 1_500_000/8, uploadThroughput: 750_000/8, latency: 150 });
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const googleFont = [];
  page.on('request', r => { if (/fonts\.(googleapis|gstatic)/.test(r.url())) googleFont.push(r.url()); });
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3500);
  const metrics = await page.evaluate(() => new Promise(res => {
    let lcp = 0;
    try { new PerformanceObserver(list => { for (const e of list.getEntries()) lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch {}
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0;
    setTimeout(() => res({ lcp: Math.round(lcp), fcp: Math.round(fcp) }), 600);
  }));
  await browser.close();
  return { ...metrics, googleFont: googleFont.length };
}

for (const [label, url] of Object.entries(targets)) {
  try { const m = await measure(url); console.log(`${label}: FCP=${m.fcp}ms LCP=${m.lcp}ms googleFontReqs=${m.googleFont}`); }
  catch (e) { console.log(`${label}: ERROR ${e.message.slice(0,60)}`); }
}
