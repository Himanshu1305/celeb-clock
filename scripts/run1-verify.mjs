// Run 1 — live staging verification (Fifth Rule). Checks hydrated served output for
// the migrated Vedic pages + a couple of non-migrated regression pages, and shoots
// 1440 + 390 screenshots into docs/run1-screens/.
import { chromium, devices } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const base = process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev';
const outDir = 'docs/run1-screens';
mkdirSync(outDir, { recursive: true });

const MIGRATED = ['/vedic-astrology', '/kundali', '/muhurat', '/sade-sati', '/gemstones'];
const REGRESSION = ['/', '/zodiac', '/numerology', '/life-expectancy']; // not migrated this run
const routes = [...MIGRATED, ...REGRESSION];

const browser = await chromium.launch();
const results = [];
for (const route of routes) {
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 140)));
  const url = base + route;
  let status = 0, info = {};
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    status = resp ? resp.status() : 0;
    await page.waitForTimeout(800);
    info = await page.evaluate(() => {
      const h1s = Array.from(document.querySelectorAll('h1')).filter((h) => (h.textContent || '').trim().length > 0);
      const root = document.querySelector('.paj');
      // old-design markers
      let purple = 0; let cosmic = 0;
      const els = document.querySelectorAll('*');
      let n = 0;
      for (const el of els) { if (n++ > 4000) break; const s = getComputedStyle(el);
        const bg = s.backgroundImage + ' ' + s.backgroundColor;
        if (/gradient/.test(s.backgroundImage) && /cosmic/i.test(el.className)) cosmic++;
      }
      return {
        title: document.title,
        h1Count: h1s.length,
        h1First: (h1s[0]?.textContent || '').trim().slice(0, 60),
        dataTheme: root?.getAttribute('data-theme') || null,
        dataCategory: root?.getAttribute('data-category') || null,
        hasSiteHeader: !!document.querySelector('.site-header'),
        hasFooter: !!document.querySelector('.site-footer'),
        singleMain: document.querySelectorAll('main#main').length,
        jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
      };
    });
    const nm = (route === '/' ? 'home' : route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, ''));
    await page.screenshot({ path: `${outDir}/${nm}__1440.png`, fullPage: false });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${outDir}/${nm}__390.png`, fullPage: false });
  } catch (e) { status = 'ERR:' + String(e).slice(0, 60); }
  results.push({ route, status, ...info, consoleErrors: errors.slice(0, 4) });
  await page.close();
}
await browser.close();
writeFileSync(`${outDir}/verify.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
