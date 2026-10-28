/**
 * GET /api/geo — the visitor's approximate country, from Cloudflare's own edge data
 * (request.cf.country). Replaces the third-party ipapi.co lookup: no extra request to an
 * outside service, no shared-IP rate limits (ipapi returned HTTP 429), and the IP never
 * leaves our hosting provider. Used only to pick pricing currency / pre-fill the
 * signup country. Not stored.
 */
export function geoFromRequest(request: Request): { country_code: string | null; country_name: string | null } {
  const raw = (request as unknown as { cf?: { country?: string } }).cf?.country;
  const code = typeof raw === 'string' && /^[A-Z]{2}$/.test(raw) && raw !== 'XX' && raw !== 'T1' ? raw : null;
  let name: string | null = null;
  if (code) {
    try { name = new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? null; } catch { name = null; }
  }
  return { country_code: code, country_name: name };
}

export async function GET(request: Request): Promise<Response> {
  return new Response(JSON.stringify(geoFromRequest(request)), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
  });
}
