import { GET, POST } from '../../api/daily-email-cron.js';

// GET: admin manual trigger via browser/curl
export const onRequestGet = (ctx: any) => GET(ctx.request);
// POST: admin manual trigger via curl -X POST
export const onRequestPost = (ctx: any) => POST(ctx.request);
