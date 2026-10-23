// api/report.ts — GET /api/report?slug=<slug>
//
// The ONLY way the browser reads a Birthday Blueprint. Until Oct 2026 the page
// read birthday_reports directly with the public anon key under an RLS policy
// that checked only expires_at — so anyone could list EVERY live report (gift
// recipients' names, birth dates, personal messages, user ids). That policy is
// dropped (supabase/migrations/20261023120000_security_payments_hardening.sql)
// and reports are served here, with the service role, ONE report for ONE slug,
// and only the fields the report page needs. The owner's user id is never
// returned — the page gets a computed `is_owner` flag instead.
//
// Paid reports never expire (founder decision, Oct 2026). Unpaid previews stay
// viewable until their expires_at.
import { serviceClient, getAuthedUser } from './_userAuth.js';

const SLUG_RE = /^[a-z0-9]{4,40}$/;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

/** Visible = paid (permanent) or an unpaid preview that has not yet expired. */
export function isReportVisible(row: { is_paid?: boolean | null; expires_at?: string | null }, now: Date = new Date()): boolean {
  if (row.is_paid) return true;
  if (!row.expires_at) return false;
  const t = new Date(row.expires_at).getTime();
  return Number.isNaN(t) ? String(row.expires_at).toLowerCase() === 'infinity' : t > now.getTime();
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const slug = new URL(request.url, 'http://localhost').searchParams.get('slug') ?? '';
  if (!SLUG_RE.test(slug)) return json({ error: 'Not found' }, 404);

  const db = serviceClient();
  const { data: row, error } = await db
    .from('birthday_reports')
    .select('id, slug, user_id, report_data, is_paid, is_premium_report, expires_at, created_at')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !row || !isReportVisible(row as any)) return json({ error: 'Not found' }, 404);

  const viewer = await getAuthedUser(request, db);
  const r = row as any;

  // View tracking (previously two client-side RPCs). Best-effort, never fails the read.
  try { await db.rpc('increment_report_view_count', { report_id: r.id }); } catch { /* ignore */ }
  try { await db.from('birthday_reports').update({ last_viewed_at: new Date().toISOString() }).eq('slug', slug); } catch { /* ignore */ }

  return json({
    slug: r.slug,
    report_data: r.report_data,
    is_paid: !!r.is_paid,
    is_premium_report: !!r.is_premium_report,
    is_owner: !!viewer && !!r.user_id && viewer.id === r.user_id,
    created_at: r.created_at,
  });
}

export const GET = handler;
