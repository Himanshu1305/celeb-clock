// api/unsubscribe.ts — one-click unsubscribe from the weekly digest via a
// tokened link (no login). Flips weekly_digest=false / stamps unsubscribed_at on
// the matching email_subscribers row. Web APIs only (Workers compatible).
import { createClient } from '@supabase/supabase-js';

function html(msg: string, status = 200): Response {
  return new Response(
    `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#FBF6EA;padding:48px;text-align:center;color:#0C1A2B">
      <div style="max-width:440px;margin:0 auto;background:#fff;border:1px solid #E6D8B8;border-radius:12px;padding:32px">
        <div style="font-weight:800;color:#103A5C;font-size:20px;margin-bottom:12px">BornClock</div>
        <p style="font-size:15px;color:#4b5563">${msg}</p>
        <a href="https://bornclock.com/" style="display:inline-block;margin-top:16px;color:#103A5C;font-weight:700">Back to BornClock</a>
      </div></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

async function handler(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get('token');
  if (!token) return html('Invalid unsubscribe link — no token provided.', 400);

  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return html('Unsubscribe is temporarily unavailable. Please email hello@bornclock.com.', 503);

  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { error, count } = await sb
    .from('email_subscribers')
    .update({ weekly_digest: false, unsubscribed_at: new Date().toISOString() }, { count: 'exact' })
    .eq('unsubscribe_token', token);

  if (error) {
    console.error('[unsubscribe] error:', error.message);
    return html('Something went wrong. Please email hello@bornclock.com to unsubscribe.', 500);
  }
  if (!count) return html("This link is no longer valid, or you're already unsubscribed.");
  return html("You've been unsubscribed from the weekly reading. You can re-subscribe anytime from any results page.");
}

export const GET = handler;
export const POST = handler;
