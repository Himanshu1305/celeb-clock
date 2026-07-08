import { POST as handler } from '../../api/send-email.js';

export const onRequest = (ctx: any) => handler(ctx.request);
