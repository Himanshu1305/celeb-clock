// api/_cronAuth.ts — shared bearer check for scheduled-job endpoints.
//
// The ops endpoints (ops-monitor, invoice-sweep, ops-digest) used to be callable by
// anyone on the internet. They are now driven only by the external scheduler
// (/api/cron-dispatch, called by GitHub Actions with CRON_SECRET), which calls them
// in-process with the same bearer header. Fails closed when CRON_SECRET is unset.

export function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return (request.headers.get('authorization') ?? '') === `Bearer ${secret}`;
}

export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
