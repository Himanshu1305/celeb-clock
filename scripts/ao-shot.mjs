import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const base = process.env.BASE || 'http://localhost:4173';
const outDir = process.env.OUT || 'docs/part-ao-screens';
mkdirSync(outDir, { recursive: true });

// routes passed as args, or a default sample
const routes = process.argv.slice(2);
const list = routes.length ? routes : ['/', '/kundali', '/numerology', '/life-expectancy', '/zodiac', '/pricing'];

const browser = await chromium.launch();
const results = [];
for (const route of list) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const url = base + route;
  let status = 0;
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    status = resp ? resp.status() : 0;
    await page.waitForTimeout(600);
  } catch (e) { status = 'ERR:' + e.message.slice(0, 40); }
  const name = (route === '/' ? 'home' : route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')) + '.png';
  await page.screenshot({ path: `${outDir}/${name}`, fullPage: false });
  // sample computed colors to flag old purple
  const flags = await page.evaluate(() => {
    const bad = [];
    const els = document.querySelectorAll('*');
    let count = 0;
    for (const el of els) {
      if (count > 4000) break; count++;
      const s = getComputedStyle(el);
      for (const prop of ['color', 'backgroundColor', 'borderTopColor']) {
        const v = s[prop];
        const m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!m) continue;
        const [r, g, b] = [ +m[1], +m[2], +m[3] ];
        // old bright purple/indigo range: blue>red>green sizeable, purple hue
        if (b > 150 && r > 90 && r < 190 && g < 110 && b - g > 70 && r - g > 20) {
          bad.push(`${prop}=${v}`);
        }
      }
    }
    return [...new Set(bad)].slice(0, 6);
  });
  results.push({ route, status, errors: errors.slice(0, 3), purpleFlags: flags });
  await page.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 2));
