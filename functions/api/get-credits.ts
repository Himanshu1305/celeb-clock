import { GET as handler } from '../../api/get-credits.js';

export const onRequest = (ctx: any) => handler(ctx.request);
