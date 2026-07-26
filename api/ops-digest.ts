// api/ops-digest.ts — MONITOR-ONLY daily digest (Phase 7).
//
// BUILT BUT NOT REGISTERED (see docs/OPS-ACTIVATION.md). Emails ONE mobile-
// readable summary of open items (unreviewed AND not auto-resolved) to the admin.
// If there are zero open items, it sends NOTHING (no noise on healthy days).
// Reuses the Resend pattern from api/_email.ts / api/_ops.ts.

import { opsClient } from './_ops.js';

const FROM_EMAIL = 'BornClock <hello@bornclock.com>';
const ADMIN_EMAIL_FALLBACK = 'himanshu1305@gmail.com';
const SEV_ORDER: Record<string, number> = { urgent: 0, warning: 1, info: 2 };
const SEV_TAG: Record<string, string> = { urgent: '🔴', warning: '🟠', info: '🔵' };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST' && request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }
  const sb = opsClient();

  const { data: rows, error } = await sb
    .from('pending_reviews')
    .select('severity, category, title, body, action_steps, created_at')
    .is('reviewed_at', null)
    .eq('auto_resolved', false);

  if (error) return json({ error: error.message }, 500);
  if (!rows || rows.length === 0) return json({ sent: false, reason: 'no open items' });

  rows.sort((a, b) => (SEV_ORDER[a.severity] ?? 3) - (SEV_ORDER[b.severity] ?? 3));

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return json({ sent: false, reason: 'RESEND_API_KEY not configured', count: rows.length }, 500);
  const to = process.env.ADMIN_EMAIL || ADMIN_EMAIL_FALLBACK;

  const urgent = rows.filter(r => r.severity === 'urgent').length;
  const warning = rows.filter(r => r.severity === 'warning').length;

  const items = rows.map(r => `
    <div style="border-left:4px solid ${r.severity === 'urgent' ? '#C2453D' : r.severity === 'warning' ? '#d97706' : '#1E6FB8'};
                background:#f8fafc;border-radius:0 8px 8px 0;padding:12px 14px;margin:0 0 12px;">
      <p style="margin:0 0 4px;font-weight:700;color:#0C1A2B;font-size:15px;">${SEV_TAG[r.severity] || ''} ${esc(r.title)}</p>
      <p style="margin:0 0 6px;color:#6B7A89;font-size:12px;">${esc(r.category)} · ${new Date(r.created_at).toUTCString()}</p>
      ${r.body ? `<p style="margin:0 0 6px;color:#3A4A5A;font-size:13px;white-space:pre-wrap;">${esc(r.body)}</p>` : ''}
      ${r.action_steps ? `<pre style="margin:0;background:#0C1A2B;color:#e5e7eb;padding:8px 10px;border-radius:6px;font-size:12px;white-space:pre-wrap;overflow-x:auto;">${esc(r.action_steps)}</pre>` : ''}
    </div>`).join('');

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;padding:8px;">
      <h2 style="color:#0C1A2B;margin:0 0 4px;">BornClock Ops Digest</h2>
      <p style="color:#6B7A89;font-size:13px;margin:0 0 16px;">
        ${rows.length} open item${rows.length === 1 ? '' : 's'} — ${urgent} urgent, ${warning} warning.
      </p>
      ${items}
      <p style="margin:16px 0 0;">
        <a href="https://bornclock.com/admin" style="display:inline-block;background:#103A5C;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;">Open the Ops tab →</a>
      </p>
    </div>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL, to: [to],
        subject: `BornClock Ops: ${urgent} urgent, ${warning} warning (${rows.length} open)`,
        html,
      }),
    });
    if (!res.ok) return json({ sent: false, reason: await res.text() }, 500);
    return json({ sent: true, count: rows.length, urgent, warning });
  } catch (e: any) {
    return json({ sent: false, reason: e?.message }, 500);
  }
}

export const POST = handler;
export const GET = handler;
