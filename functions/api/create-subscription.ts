import { POST as handler } from '../../api/create-subscription.js';

export const onRequest = (ctx: any) => handler(ctx.request);
