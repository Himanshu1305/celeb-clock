import { POST as handler } from '../../api/create-order.js';

export const onRequest = (ctx: any) => handler(ctx.request);
