import { POST as handler } from '../../api/razorpay-webhook.js';

export const onRequest = (ctx: any) => handler(ctx.request);
