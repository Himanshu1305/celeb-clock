import { POST as createOrder }        from '../api/create-order.js';
import { POST as createSubscription }  from '../api/create-subscription.js';
import { GET  as getCredits }          from '../api/get-credits.js';
import { GET  as reportEntitlement }   from '../api/report-entitlement.js';
import { POST as longevityCoach }      from '../api/longevity-coach.js';
import { POST as razorpayWebhook }     from '../api/razorpay-webhook.js';
import { POST as redeemCredit }        from '../api/redeem-credit.js';
import { POST as saveReport }          from '../api/save-report.js';
import { POST as sendEmail }           from '../api/send-email.js';
import { POST as contact }             from '../api/contact.js';
import { POST as verifyPayment }       from '../api/verify-payment.js';
import { POST as updateBuyerState }     from '../api/update-buyer-state.js';
import { GET  as dailyCronGet,
         POST as dailyCronPost }       from '../api/daily-email-cron.js';
import { POST as opsMonitor }          from '../api/ops-monitor.js';
import { POST as opsDigest }           from '../api/ops-digest.js';
import { POST as invoiceSweep }        from '../api/invoice-sweep.js';
import { GET  as invoicePdf }          from '../api/invoice-pdf.js';
import { POST as subscribe }           from '../api/subscribe.js';
import { POST as weeklyDigest }        from '../api/weekly-digest.js';
import { GET  as kundali }              from '../api/kundali.js';
import { GET  as vedicProfile }         from '../api/vedic-profile.js';
import { GET  as vedicReading }         from '../api/vedic-reading.js';
import { POST as vedicChat }            from '../api/vedic-chat.js';
import { GET  as kundaliMatch }         from '../api/kundali-match.js';
import { GET  as chartEvents }          from '../api/chart-events.js';
import { GET  as sadeSati }             from '../api/sade-sati.js';
import { GET  as muhurat }             from '../api/muhurat.js';
import { GET  as careerReport }        from '../api/career-report.js';
import { GET  as gemstones }           from '../api/gemstones.js';
import { GET  as unsubscribe }         from '../api/unsubscribe.js';
import cronHandler                     from './_cron/daily-email.js';
import { handleReportOg, injectReportOgTags } from './og-report.js';

type Env = {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  [key: string]: unknown;
};

// CF Worker env is a Proxy — Object.entries(env) returns [] even when secrets exist.
// Must access known keys by name explicitly.
const BRIDGE_KEYS = [
  'VITE_RAZORPAY_KEY_ID', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET',
  'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  'CRON_SECRET', 'VITE_CRON_SECRET',
  'RESEND_API_KEY', 'ANTHROPIC_API_KEY', 'ADMIN_SECRET_KEY',
  'GEMINI_API_KEY', 'COACH_PROVIDER',
  'VITE_RAZORPAY_PLAN_INDIA_MONTHLY', 'VITE_RAZORPAY_PLAN_INDIA_ANNUAL',
  'VITE_RAZORPAY_PLAN_GLOBAL_MONTHLY', 'VITE_RAZORPAY_PLAN_GLOBAL_ANNUAL',
  'ADMIN_EMAIL', 'OPS_BASE_URL',
  'BROWSER_RENDERING_TOKEN', 'CF_ACCOUNT_ID',
  'DIGEST_LIVE',
];

function bridgeEnv(env: Env): void {
  if (typeof process === 'undefined' || !process.env) return;
  const e = env as Record<string, unknown>;
  for (const key of BRIDGE_KEYS) {
    const value = e[key];
    if (typeof value === 'string' && value !== '' && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

const apiRoutes: Record<string, (r: Request) => Promise<Response>> = {
  '/api/create-order':       createOrder,
  '/api/create-subscription': createSubscription,
  '/api/get-credits':        getCredits,
  '/api/report-entitlement': reportEntitlement,
  '/api/longevity-coach':    longevityCoach,
  '/api/razorpay-webhook':   razorpayWebhook,
  '/api/redeem-credit':      redeemCredit,
  '/api/save-report':        saveReport,
  '/api/send-email':         sendEmail,
  '/api/contact':            contact,
  '/api/verify-payment':     verifyPayment,
  '/api/update-buyer-state': updateBuyerState,
  '/api/ops-monitor':        opsMonitor,
  '/api/ops-digest':         opsDigest,
  '/api/invoice-sweep':      invoiceSweep,
  '/api/invoice-pdf':        invoicePdf,
  '/api/subscribe':          subscribe,
  '/api/weekly-digest':      weeklyDigest,
  '/api/unsubscribe':        unsubscribe,
  '/api/kundali':            kundali,
  '/api/vedic-profile':      vedicProfile,
  '/api/vedic-reading':      vedicReading,
  '/api/vedic-chat':         vedicChat,
  '/api/kundali-match':      kundaliMatch,
  '/api/chart-events':       chartEvents,
  '/api/sade-sati':          sadeSati,
  '/api/muhurat':            muhurat,
  '/api/career-report':      careerReport,
  '/api/gemstones':          gemstones,
};

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    bridgeEnv(env);

    const { pathname } = new URL(request.url);

    // Permanent redirects for renamed routes (301). Keep old SEO equity, never 404.
    const REDIRECTS: Record<string, string> = {
      '/methodology': '/how-it-works',
      '/methodology/': '/how-it-works',
      // /rising-sign-calculator retired (a 2-hour-block ascendant is confidently wrong
      // without birth latitude/longitude). The URL was submitted to Google + IndexNow,
      // so 301 to the closest genuinely-useful page rather than waste the crawl on a 404.
      '/rising-sign-calculator': '/moon-sign',
      '/rising-sign-calculator/': '/moon-sign',
    };
    if (REDIRECTS[pathname]) {
      return Response.redirect(new URL(REDIRECTS[pathname], request.url).toString(), 301);
    }

    // Compatibility pairs are prerendered once per unordered pair in ALPHABETICAL
    // order (the canonical form). 301 the reverse order to the canonical so both
    // orderings consolidate their SEO equity onto a single indexed URL rather than
    // serving duplicate 200s. Only fires for two valid signs in non-canonical order.
    {
      const m = pathname.match(/^\/compatibility\/([a-z]+)\/([a-z]+)\/?$/);
      if (m) {
        const SIGNS = new Set(['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces']);
        const [, a, b] = m;
        if (SIGNS.has(a) && SIGNS.has(b) && a > b) {
          return Response.redirect(new URL(`/compatibility/${b}/${a}/`, request.url).toString(), 301);
        }
      }
    }

    // Part AD (SEO, Part 4): the "aries+date" Search-Console anomaly is the real query
    // "aries date(s)" — the "+" is the export-encoded space, NOT a literal string emitted
    // anywhere in the code (verified: no source/sitemap/URL contains "aries+date"). The
    // page that correctly targets it, /zodiac/aries/, exists and is healthy. BUT plausible
    // variants — /aries, /aries-dates, /zodiac/aries-dates — were SOFT-404s: the SPA
    // fallback serves HTTP 200 + homepage content that is still indexable, a genuine
    // crawl-budget/soft-404 hazard that can accrue impressions for such a query at a poor
    // position. 301 all bare-sign and [sign]-date(s) variants onto the canonical
    // /zodiac/[sign]/ so any such traffic consolidates onto the correct, real page.
    {
      const ZSIGNS = new Set(['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces']);
      const zm = pathname.match(/^\/(?:zodiac\/)?([a-z]+?)(?:-dates?)?\/?$/);
      if (zm && ZSIGNS.has(zm[1]) && pathname.replace(/\/$/, '') !== `/zodiac/${zm[1]}`) {
        return Response.redirect(new URL(`/zodiac/${zm[1]}/`, request.url).toString(), 301);
      }
    }

    // Part AD (SEO): collapse homepage query-parameter duplicate URLs onto their real
    // canonical date page. `/?day=D&month=M` and `/?birthDate=M/D` are generated by
    // "your birthday" CTAs but the homepage IGNORES those params (renders the bare
    // homepage, canonical `/`), so Google was crawling them as near-duplicates and wasting
    // crawl budget. The genuinely-matching canonical content is /birthday/[month]/[day]/
    // (the "September 4 Birthday" page). 301 there so equity + crawl budget consolidate.
    // (Source CTAs were also fixed to link straight to /birthday/ — this catches already-
    // crawled/legacy URLs.)
    if (pathname === '/') {
      const sp = new URL(request.url).searchParams;
      let mm: number | null = null, dd: number | null = null;
      if (sp.has('day') && sp.has('month')) {
        dd = parseInt(sp.get('day') || '', 10); mm = parseInt(sp.get('month') || '', 10);
      } else if (sp.has('birthDate')) {
        const parts = (sp.get('birthDate') || '').split('/');   // format is month/day
        if (parts.length === 2) { mm = parseInt(parts[0], 10); dd = parseInt(parts[1], 10); }
      }
      if (Number.isInteger(mm) && Number.isInteger(dd) && (mm as number) >= 1 && (mm as number) <= 12 && (dd as number) >= 1 && (dd as number) <= 31) {
        return Response.redirect(new URL(`/birthday/${mm}/${dd}/`, request.url).toString(), 301);
      }
    }

    // Personalised report OG card (SEO-MAGNET-3 Phase 5). Both branches are
    // cache-first and fall back to the static default card / untouched SPA shell on
    // any failure, so they can never break a report view or a share preview.
    if (pathname.startsWith('/og/report/')) {
      return handleReportOg(request, env, ctx);
    }
    if (pathname.startsWith('/report/')) {
      const injected = await injectReportOgTags(request, env);
      if (injected) return injected;
    }

    if (!pathname.startsWith('/api/')) {
      const assetRes = await env.ASSETS.fetch(request as Parameters<typeof env.ASSETS.fetch>[0]);
      // Part AD (SEO): the static-asset layer normalises a missing trailing slash with a
      // 307 (TEMPORARY) redirect. A 307 does not consolidate SEO equity, which is why
      // Search Console listed /born-on/august-6/india and /born-on/august-6/india/ as TWO
      // separate rows (split clicks/impressions). Upgrade ONLY that trailing-slash
      // normalisation to a 301 (PERMANENT) so Google consolidates onto the canonical
      // (trailing-slash) form. The set of URLs that redirect is unchanged — only the code.
      if (assetRes.status === 307 || assetRes.status === 308) {
        const loc = assetRes.headers.get('Location');
        if (loc) {
          const to = new URL(loc, request.url);
          const from = new URL(request.url);
          if (to.pathname === from.pathname + '/') {
            const headers = new Headers(assetRes.headers);
            return new Response(null, { status: 301, headers });
          }
        }
      }
      // Prevent STALE HTML at the Cloudflare edge. Prerendered page shells (index.html and
      // per-route index.html) carry hashed JS/CSS references; when a deploy changes them, a
      // long-cached HTML shell would keep pinning the OLD bundle — which is exactly how the
      // homepage science-card row went missing on production (the edge served a pre-prerender
      // shell that referenced a stale bundle, so even a hard refresh never showed the row).
      // Force revalidation on HTML documents so every deploy takes effect immediately; hashed
      // assets keep their own immutable caching untouched.
      const ct = assetRes.headers.get('content-type') || '';
      if (ct.includes('text/html')) {
        const headers = new Headers(assetRes.headers);
        headers.set('Cache-Control', 'no-cache, must-revalidate');
        // Part AD (SEO): thin blog TAG-ARCHIVE views (/blog?tag=X) are near-duplicate
        // listing pages that waste crawl budget. Mark them `noindex, follow` (NOT nofollow,
        // and NOT a robots.txt disallow) so they leave the index while link equity still
        // flows to the real articles. Sent as an HTTP header so it's crawl-reliable even
        // before client JS runs (these query-param URLs are served by the /blog/ shell);
        // the React <SEO noindexFollow> adds the matching <meta> in the rendered HTML too.
        if ((pathname === '/blog' || pathname === '/blog/') && new URL(request.url).searchParams.has('tag')) {
          headers.set('X-Robots-Tag', 'noindex, follow');
        }
        return new Response(assetRes.body, { status: assetRes.status, statusText: assetRes.statusText, headers });
      }
      return assetRes;
    }

    if (pathname === '/api/daily-email-cron') {
      return request.method === 'GET' ? dailyCronGet(request) : dailyCronPost(request);
    }


    const handler = apiRoutes[pathname];
    if (!handler) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return handler(request);
  },

  async scheduled(event: any, env: Env, ctx: any): Promise<void> {
    bridgeEnv(env);
    const base = process.env.OPS_BASE_URL || 'https://bornclock.usdvisionai.workers.dev';
    switch (event.cron) {
      case '0 6 * * *':                 // existing daily email
        return cronHandler.scheduled(event, env, ctx);
      case '10 6 * * *':                // daily ops — 06:10 UTC (health checks + renewal invoice sweep)
        ctx.waitUntil(fetch(`${base}/api/ops-monitor`, { method: 'POST' }));
        ctx.waitUntil(fetch(`${base}/api/invoice-sweep`, { method: 'POST' }));
        return;
      case '0 7 * * 1':                 // integrity emphasis — Monday 07:00 UTC
        ctx.waitUntil(fetch(`${base}/api/ops-monitor`, { method: 'POST' }));
        return;
      case '0 9 * * 0':                 // digest — Sunday 09:00 UTC
        ctx.waitUntil(fetch(`${base}/api/ops-digest`, { method: 'POST' }));
        // Weekly "Your Week Ahead" subscriber digest — GATED. No-op with a log
        // until the founder reviews a test render and sets DIGEST_LIVE=true. The
        // subscriber broadcast itself is a deliberate follow-up (not sent here).
        if (process.env.DIGEST_LIVE === 'true') {
          console.log('[weekly-digest] DIGEST_LIVE enabled — subscriber broadcast wiring pending founder review');
        } else {
          console.log('[weekly-digest] Sunday cron no-op (DIGEST_LIVE not set)');
        }
        return;
      default:
        return cronHandler.scheduled(event, env, ctx);
    }
  },
};
