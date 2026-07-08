import { POST as handler } from '../../api/save-report.js';

export const onRequest = (ctx: any) => handler(ctx.request);
