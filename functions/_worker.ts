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
};

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
    // Bridge CF bindings to process.env so shared handler code works unchanged
    if (typeof process !== 'undefined' && process.env) {
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === 'string' && process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    }

    const { pathname } = new URL(request.url);

    // Non-API requests → static assets; ASSETS binding handles SPA fallback
    // via the /* /index.html 200 rule in public/_redirects copied into dist/.
    if (!pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    // daily-email-cron accepts both GET (cron/admin) and POST (admin trigger)
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
    // Bridge CF bindings to process.env so shared handler code works unchanged
    if (typeof process !== 'undefined' && process.env) {
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === 'string' && process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    }
    return cronHandler.scheduled(event, env, ctx);
  },
};
