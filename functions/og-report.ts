// functions/og-report.ts — personalised OG share card for shared /report/{slug}
// pages (SEO-MAGNET-3 Phase 5). Two pieces, both cache-first and defensively
// coded so they can NEVER break a report view or exhaust the Browser Rendering
// quota that invoice PDFs depend on:
//
//   handleReportOg(req, env, ctx)  →  GET /og/report/{slug}.png
//       Renders "{FirstName}'s Birthday Blueprint" on the brand card via Cloudflare
//       Browser Rendering. Cache-first (Cache API, immutable), only for slugs that
//       exist in the DB, behind a per-IP rate limit AND a hard daily render budget.
//       ANY miss/failure/over-budget serves the static default card (200) — never a
//       broken image, never a 5xx.
//
//   injectReportOgTags(req, env)   →  rewrites /report/{slug} HTML
//       Points og:image / twitter:image at the card route so social crawlers (which
//       don't run JS) see the personalised preview. On any error returns null and the
//       caller serves the untouched SPA shell (the default card) — reports keep working.
//
// A4 note: the daily budget + per-IP limit are in-memory (no KV binding is
// provisioned). Combined with immutable edge caching (each slug renders at most once,
// then is served from cache for a year) and the fact that report slugs are random and
// noindex (never crawled in bulk), real Browser Rendering calls stay minimal. A fully
// durable cross-isolate cap would use a KV namespace — noted as a future hardening.
import { createClient } from '@supabase/supabase-js';

type OgEnv = { ASSETS: { fetch: (r: Request) => Promise<Response> }; [k: string]: unknown };
type Ctx = { waitUntil: (p: Promise<unknown>) => void };

const INK = '#0C1A2B', NAVY = '#103A5C', GOLD = '#B8862F', LIGHT = '#F5EAD2', MUTE = '#9DB0BF';
const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SCREENSHOT_TIMEOUT_MS = 8000;

// ── In-memory guard rails (per-isolate) ───────────────────────────────────────
const DAILY_BUDGET = 200;      // hard cap on Browser Rendering calls per day
const IP_WINDOW_MS = 60_000;   // per-IP sliding window
const IP_MAX = 8;              // max render attempts per IP per window
let budgetDay = '';
let budgetCount = 0;
const ipHits = new Map<string, number[]>();

function allowRender(request: Request): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== budgetDay) { budgetDay = today; budgetCount = 0; ipHits.clear(); }
  if (budgetCount >= DAILY_BUDGET) return false;
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter(t => now - t < IP_WINDOW_MS);
  if (hits.length >= IP_MAX) { ipHits.set(ip, hits); return false; }
  hits.push(now);
  ipHits.set(ip, hits);
  budgetCount++;
  return true;
}

function esc(s: string): string {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

// Privacy: first name only, never the full name or anything else from the report.
function firstName(name: string | null | undefined): string {
  const first = String(name ?? '').trim().split(/\s+/)[0] || 'Your';
  const clean = first.replace(/[^\p{L}\p{N}'.-]/gu, '').slice(0, 24);
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : 'Your';
}

function fmtDob(dob: string | null | undefined): string {
  const m = String(dob ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '';
  const month = MONTHS[Number(m[2])] ?? '';
  return month ? `${month} ${Number(m[3])}, ${m[1]}` : '';
}

function cardHtml(name: string, dobLabel: string): string {
  const possessive = /s$/i.test(name) ? `${name}'` : `${name}'s`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:1200px;height:630px}
    .card{width:1200px;height:630px;background:${INK};position:relative;overflow:hidden;
      font-family:Georgia,'Times New Roman',serif;color:${LIGHT};padding:90px}
    .rule{position:absolute;top:0;left:0;width:100%;height:12px;background:${GOLD}}
    .ring{position:absolute;border-radius:50%;border:2px solid ${NAVY};opacity:.5}
    .r1{width:500px;height:500px;right:-120px;bottom:-120px}
    .r2{width:360px;height:360px;right:-40px;bottom:-40px;border-color:${GOLD};opacity:.32}
    .brand{font-size:26px;letter-spacing:6px;color:${GOLD};font-weight:700;text-transform:uppercase}
    .eyebrow{margin-top:150px;font-size:28px;letter-spacing:5px;color:${GOLD};text-transform:uppercase}
    .name{font-size:96px;font-weight:800;line-height:1.05;margin-top:14px}
    .sub{font-size:44px;font-weight:800;margin-top:4px}
    .date{margin-top:22px;font-size:32px;color:${MUTE};font-family:Helvetica,Arial,sans-serif}
    .tag{position:absolute;bottom:80px;left:90px;font-size:24px;color:${MUTE};font-style:italic;font-family:Helvetica,Arial,sans-serif}
  </style></head><body><div class="card">
    <div class="rule"></div><div class="ring r1"></div><div class="ring r2"></div>
    <div class="brand">BornClock</div>
    <div class="eyebrow">A Birthday Blueprint for</div>
    <div class="name">${esc(possessive)}</div>
    <div class="sub">Birthday Blueprint</div>
    ${dobLabel ? `<div class="date">Born ${esc(dobLabel)}</div>` : ''}
    <div class="tag">Celebrity twins · zodiac · numerology · longevity — bornclock.com</div>
  </div></body></html>`;
}

async function renderCardPng(html: string): Promise<Uint8Array | null> {
  const token = process.env.BROWSER_RENDERING_TOKEN;
  const accountId = process.env.CF_ACCOUNT_ID;
  if (!token || !accountId) return null;
  try {
    const resp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/screenshot`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html,
        viewport: { width: 1200, height: 630 },
        screenshotOptions: { type: 'png', fullPage: false },
      }),
      signal: AbortSignal.timeout(SCREENSHOT_TIMEOUT_MS),
    });
    if (!resp.ok) return null;
    const buf = new Uint8Array(await resp.arrayBuffer());
    // PNG magic: 89 50 4E 47
    if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return buf;
    return null;
  } catch {
    return null;
  }
}

export async function handleReportOg(request: Request, env: OgEnv, ctx: Ctx): Promise<Response> {
  const url = new URL(request.url);
  const slug = url.pathname.replace(/^\/og\/report\//, '').replace(/\.(png|webp|jpe?g)$/i, '');

  const serveDefault = async (): Promise<Response> => {
    try {
      const res = await env.ASSETS.fetch(new Request(new URL('/og/default.png', request.url).toString()));
      return new Response(res.body, { status: 200, headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' } });
    } catch {
      return new Response(null, { status: 302, headers: { Location: 'https://bornclock.com/og/default.png' } });
    }
  };

  if (!slug || !/^[a-z0-9-]{6,80}$/i.test(slug)) return serveDefault();

  // Cache-first — a successful card is immutable for a year, so real renders are rare.
  const cache = (globalThis as { caches?: { default: Cache } }).caches?.default;
  const cacheKey = new Request(`https://bornclock.com/og/report/${slug}.png`);
  if (cache) {
    const hit = await cache.match(cacheKey).catch(() => undefined);
    if (hit) return hit;
  }

  // Gate BOTH the DB lookup and the render behind the rate limit + daily budget so a
  // crawler storm over many distinct slugs can't hammer the DB or Browser Rendering.
  if (!allowRender(request)) return serveDefault();

  let name = '', dobLabel = '';
  try {
    const supaUrl = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supaUrl || !key) return serveDefault();
    const db = createClient(supaUrl, key, { auth: { persistSession: false } });
    const { data } = await db.from('birthday_reports')
      .select('recipient_name, recipient_dob, expires_at')
      .eq('slug', slug)
      .single();
    if (!data) return serveDefault();
    if (data.expires_at && new Date(data.expires_at as string) < new Date()) return serveDefault();
    name = firstName(data.recipient_name as string);
    dobLabel = fmtDob(data.recipient_dob as string);
  } catch {
    return serveDefault();
  }

  const png = await renderCardPng(cardHtml(name, dobLabel));
  if (!png) return serveDefault();

  const res = new Response(png, {
    status: 200,
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
  if (cache) ctx.waitUntil(cache.put(cacheKey, res.clone()).catch(() => {}));
  return res;
}

export async function injectReportOgTags(request: Request, env: OgEnv): Promise<Response | null> {
  try {
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/report\/([a-z0-9-]+)\/?$/i);
    if (!m) return null;
    const slug = m[1];
    const assetRes = await env.ASSETS.fetch(new Request(new URL('/index.html', request.url).toString()));
    let html = await assetRes.text();
    const card = `https://bornclock.com/og/report/${slug}.png`;
    html = html.replace(/<meta\b[^>]*\bproperty="og:image"[^>]*>/i, `<meta property="og:image" content="${card}" />`);
    html = html.replace(/<meta\b[^>]*\bname="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${card}" />`);
    // Reports are private, random-slug pages — keep them out of the index even for
    // crawlers that read the raw HTML (mirrors ReportView's client-side noindex).
    if (!/name="robots"/i.test(html)) html = html.replace('</head>', '<meta name="robots" content="noindex" /></head>');
    return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
  } catch {
    return null;
  }
}
