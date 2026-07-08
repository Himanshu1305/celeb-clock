import { POST as handler } from '../../api/redeem-credit.js';

export const onRequest = (ctx: any) => handler(ctx.request);
