const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_ANON = 5;
// Per-isolate in-memory store — best-effort for soft launch; replace with Redis for hardening.
const ipWindows = new Map<string, number[]>();

export const config = {
  matcher: ['/api/save-report'],
};

export default function middleware(request: Request): Response | undefined {
  if (request.method !== 'POST') return undefined;

  // Authenticated requests bypass rate limit (token sent by saveReport())
  if (request.headers.get('Authorization')) return undefined;

  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

  // Localhost bypass — keeps E2E gauntlet working (creates 7+ reports per run)
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'unknown') return undefined;

  const now = Date.now();
  const timestamps = (ipWindows.get(ip) ?? []).filter(t => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_ANON) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  timestamps.push(now);
  ipWindows.set(ip, timestamps);
  return undefined;
}
