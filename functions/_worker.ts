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
import { GET  as dailyCronGet,
         POST as dailyCronPost }       from '../api/daily-email-cron.js';
import { POST as opsMonitor }          from '../api/ops-monitor.js';
import { POST as opsDigest }           from '../api/ops-digest.js';
import { POST as invoiceSweep }        from '../api/invoice-sweep.js';
import { GET  as invoicePdf }          from '../api/invoice-pdf.js';
import { POST as subscribe }           from '../api/subscribe.js';
import { POST as weeklyDigest }        from '../api/weekly-digest.js';
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
  '/api/ops-monitor':        opsMonitor,
  '/api/ops-digest':         opsDigest,
  '/api/invoice-sweep':      invoiceSweep,
  '/api/invoice-pdf':        invoicePdf,
  '/api/subscribe':          subscribe,
  '/api/weekly-digest':      weeklyDigest,
  '/api/unsubscribe':        unsubscribe,
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
      return env.ASSETS.fetch(request as Parameters<typeof env.ASSETS.fetch>[0]);
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
