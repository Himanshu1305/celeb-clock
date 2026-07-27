// Throwaway visual-verify: screenshot a route at a given viewport against vite preview.
// Usage: node scripts/shot.mjs /celebrity-birthday 390 celeb
import { chromium } from 'playwright';
import { spawn } from 'child_process';
const [route = '/', width = '390', tag = 'shot'] = process.argv.slice(2);
const PORT = 4321;
const srv = spawn('npx', ['vite', 'preview', '--port', String(PORT)], { stdio: 'pipe' });
const base = `http://localhost:${PORT}`;
async function wait() { for (let i=0;i<40;i++){ try{ const r=await fetch(base+'/'); if(r.status<500) return; }catch{} await new Promise(r=>setTimeout(r,300)); } throw new Error('no server'); }
try {
  await wait();
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: +width, height: 844 }, deviceScaleFactor: 2, isMobile: +width < 700 });
  const p = await ctx.newPage();
  await p.goto(base + route, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  for (const label of ['Accept All', 'Accept', 'Reject All']) {
    const btn = p.getByRole('button', { name: label });
    if (await btn.count()) { try { await btn.first().click({ timeout: 1000 }); break; } catch {} }
  }
  await p.waitForTimeout(600);
  await p.screenshot({ path: `/tmp/${tag}-full.png`, fullPage: true });
  await p.screenshot({ path: `/tmp/${tag}-fold.png` }); // first screenful
  console.log('shot ok');
  await b.close();
} catch (e) { console.error(e.message); } finally { srv.kill(); }
