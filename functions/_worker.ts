import { POST as createOrder }        from '../api/create-order.js';
import { POST as createSubscription }  from '../api/create-subscription.js';
import { GET  as getCredits }          from '../api/get-credits.js';
import { POST as longevityCoach }      from '../api/longevity-coach.js';
import { POST as razorpayWebhook }     from '../api/razorpay-webhook.js';
import { POST as redeemCredit }        from '../api/redeem-credit.js';
import { POST as saveReport }          from '../api/save-report.js';
import { POST as sendEmail }           from '../api/send-email.js';
import { POST as verifyPayment }       from '../api/verify-payment.js';
import { GET  as dailyCronGet,
         POST as dailyCronPost }       from '../api/daily-email-cron.js';
import cronHandler                     from './_cron/daily-email.js';

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
  'VITE_RAZORPAY_PLAN_INDIA_MONTHLY', 'VITE_RAZORPAY_PLAN_INDIA_ANNUAL',
  'VITE_RAZORPAY_PLAN_GLOBAL_MONTHLY', 'VITE_RAZORPAY_PLAN_GLOBAL_ANNUAL',
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
  '/api/longevity-coach':    longevityCoach,
  '/api/razorpay-webhook':   razorpayWebhook,
  '/api/redeem-credit':      redeemCredit,
  '/api/save-report':        saveReport,
  '/api/send-email':         sendEmail,
  '/api/verify-payment':     verifyPayment,
};

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    bridgeEnv(env);

    const { pathname } = new URL(request.url);

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
    return cronHandler.scheduled(event, env, ctx);
  },
};
