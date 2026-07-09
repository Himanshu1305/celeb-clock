#!/usr/bin/env node
/**
 * Generates branded OG images (1200x630 PNG) for BornClock public routes.
 * Uses the existing puppeteer-core + local Chrome setup already present for prerender.
 * Output: public/og/{variant}.png
 *
 * Run: node scripts/generate-og.mjs
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OG_DIR = join(ROOT, 'public', 'og');

const LOCAL_CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
];

const VARIANTS = [
  {
    name: 'default',
    subtitle: 'Know your time. Live it well.',
    icon: '⏱',
  },
  {
    name: 'zodiac',
    subtitle: 'Zodiac Profiles — Western · Chinese · Vedic',
    icon: '♈',
  },
  {
    name: 'born-on',
    subtitle: 'Celebrities Born On Every Date',
    icon: '🌟',
  },
  {
    name: 'report',
    subtitle: 'Birthday Blueprint — The Ultimate Birthday Gift',
    icon: '🎂',
  },
  {
    name: 'calculator',
    subtitle: 'Free Age & Life Expectancy Calculators',
    icon: '🔬',
  },
];

function buildHtml(subtitle, icon) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 630px;
    overflow: hidden;
    background: #0C1A2B;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .card {
    width: 100%;
    height: 100%;
    padding: 70px 90px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  /* Subtle radial glow */
  .glow {
    position: absolute;
    top: -200px;
    right: -100px;
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, rgba(184,134,47,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .glow2 {
    position: absolute;
    bottom: -300px;
    left: -150px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(30,111,184,0.10) 0%, transparent 70%);
    pointer-events: none;
  }
  /* Top rule */
  .rule-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #B8862F 0%, #F5EAD2 50%, #B8862F 100%);
  }
  .icon {
    font-size: 52px;
    margin-bottom: 20px;
    line-height: 1;
  }
  .eyebrow {
    font-size: 13px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #B8862F;
    font-weight: 700;
    margin-bottom: 14px;
  }
  .wordmark {
    font-size: 72px;
    font-weight: 800;
    color: #FFFFFF;
    letter-spacing: -0.02em;
    line-height: 1;
    margin-bottom: 20px;
  }
  .wordmark span {
    color: #B8862F;
  }
  .subtitle {
    font-size: 26px;
    color: #9DB0BF;
    font-weight: 400;
    line-height: 1.3;
    max-width: 780px;
  }
  /* Bottom domain */
  .domain {
    position: absolute;
    bottom: 44px;
    right: 90px;
    font-size: 16px;
    color: rgba(157,176,191,0.6);
    letter-spacing: 0.08em;
    font-weight: 500;
  }
  /* Decorative clock ring */
  .clock-ring {
    position: absolute;
    right: 80px;
    top: 50%;
    transform: translateY(-50%);
    width: 240px;
    height: 240px;
    border-radius: 50%;
    border: 2px solid rgba(184,134,47,0.2);
    box-shadow: 0 0 0 16px rgba(184,134,47,0.04), 0 0 0 32px rgba(184,134,47,0.02);
  }
  .clock-ring::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 160px;
    height: 160px;
    border-radius: 50%;
    border: 1px solid rgba(184,134,47,0.15);
  }
  .clock-ring::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 80px;
    background: rgba(184,134,47,0.4);
    transform-origin: bottom center;
    transform: translate(-50%, -100%) rotate(-30deg);
  }
</style>
</head>
<body>
<div class="card">
  <div class="rule-top"></div>
  <div class="glow"></div>
  <div class="glow2"></div>
  <div class="clock-ring"></div>
  <div class="icon">${icon}</div>
  <div class="eyebrow">bornclock.com</div>
  <div class="wordmark">Born<span>Clock</span></div>
  <div class="subtitle">${subtitle}</div>
  <div class="domain">bornclock.com</div>
</div>
</body>
</html>`;
}

async function main() {
  mkdirSync(OG_DIR, { recursive: true });

  const puppeteer = await import('puppeteer-core');
  const puppeteerCore = puppeteer.default || puppeteer;

  let browser;
  for (const executablePath of LOCAL_CHROME_PATHS) {
    if (!existsSync(executablePath)) continue;
    try {
      browser = await puppeteerCore.launch({
        executablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        headless: true,
      });
      console.log(`Using: ${executablePath}`);
      break;
    } catch (e) {
      console.warn(`Failed to launch ${executablePath}: ${e.message}`);
    }
  }

  if (!browser) {
    // Try sparticuz as fallback
    try {
      const chromiumMod = await import('@sparticuz/chromium');
      const chromium = chromiumMod.default || chromiumMod;
      const executablePath = await chromium.executablePath();
      browser = await puppeteerCore.launch({
        executablePath,
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        headless: true,
      });
    } catch (e) {
      console.error('No chromium available:', e.message);
      process.exit(1);
    }
  }

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  for (const v of VARIANTS) {
    const html = buildHtml(v.subtitle, v.icon);
    await page.setContent(html, { waitUntil: 'load' });
    const outPath = join(OG_DIR, `${v.name}.png`);
    await page.screenshot({ path: outPath, type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
    console.log(`✅ ${v.name}.png`);
  }

  await browser.close();
  console.log(`\nAll OG images written to public/og/`);
}

main().catch(err => {
  console.error('generate-og fatal:', err);
  process.exit(1);
});
