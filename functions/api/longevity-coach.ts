import { POST as handler } from '../../api/longevity-coach.js';

export const onRequest = (ctx: any) => handler(ctx.request);
