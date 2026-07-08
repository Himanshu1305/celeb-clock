import { GET } from '../../api/daily-email-cron.js';

// CF Workers scheduled handler — called by the cron trigger in wrangler.toml.
// Builds a synthetic GET request authenticated with CRON_SECRET, then delegates
// to the same HTTP handler used by the admin trigger route so logic stays in one place.
export default {
  async scheduled(event: any, env: any, ctx: any) {
    // process.env is populated from CF bindings via nodejs_compat;
    // env.CRON_SECRET is the same value as a fallback for environments where
    // the nodejs_compat shim hasn't propagated yet.
    const secret = process.env.CRON_SECRET ?? env.CRON_SECRET ?? '';
    const req = new Request('http://localhost/api/daily-email-cron', {
      method: 'GET',
      headers: { Authorization: `Bearer ${secret}` },
    });
    ctx.waitUntil(GET(req));
  },
};
