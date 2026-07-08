import { POST as handler } from '../../api/verify-payment.js';

export const onRequest = (ctx: any) => handler(ctx.request);
