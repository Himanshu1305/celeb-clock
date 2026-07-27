// api/weekly-digest.ts — build + send a personalised weekly digest email.
// Web APIs only (Cloudflare Workers compatible). Reuses the Resend pattern from
// api/_email.ts (direct fetch to api.resend.com). NOT wired to cron — activation
// is documented in docs/OPS-ACTIVATION.md. This session sends at most ONE test
// email to ADMIN_EMAIL.
//
// Modes:
//   POST { test: true }                 → send one digest to ADMIN_EMAIL (sample dob)
//   POST { to, name?, dob?, token? }     → send one digest to a specific address
// Real data: days-until-birthday, biorhythm summary, and celebrities born in the
// next 7 days (global + India), from celebrity_sitelinks.
import { createClient } from '@supabase/supabase-js';

const FROM_EMAIL = 'BornClock <hello@bornclock.com>';
const ADMIN_FALLBACK = 'himanshu1305@gmail.com';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

const MMDD = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function daysUntilBirthday(dob: Date, today: Date): number {
  const next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000);
}

function biorhythm(dob: Date, today: Date) {
  const days = Math.floor((today.getTime() - dob.getTime()) / 86400000);
  const pct = (period: number) => Math.round(Math.sin((2 * Math.PI * days) / period) * 100);
  return { physical: pct(23), emotional: pct(28), intellectual: pct(33) };
}

async function celebsThisWeek(sb: any, today: Date) {
  const week: string[] = [];
  for (let i = 0; i < 7; i++) { const d = new Date(today); d.setDate(today.getDate() + i); week.push(MMDD(d)); }
  const base = () => sb.from('celebrity_sitelinks')
    .select('name, birth_date, occupation, nationality_code, sitelinks')
    .in('birth_month_day', week)
    .not('birth_date', 'is', null)
    .order('sitelinks', { ascending: false });
  const [globalRes, inRes] = await Promise.all([
    base().limit(3),
    base().eq('nationality_code', 'IN').limit(3),
  ]);
  return { global: globalRes.data ?? [], india: inRes.data ?? [] };
}

function digestHtml(opts: {
  name: string; dob: Date | null; today: Date;
  global: any[]; india: any[]; unsubUrl: string;
}): { subject: string; html: string } {
  const { name, dob, today, global, india, unsubUrl } = opts;
  const bits: string[] = [];
  let subject = 'Your BornClock weekly reading';

  if (dob) {
    const dtb = daysUntilBirthday(dob, today);
    const bio = biorhythm(dob, today);
    subject = dtb === 0 ? '🎂 Happy birthday from BornClock!' : `Your weekly reading — ${dtb} days to your birthday`;
    bits.push(`<p style="font-size:16px;color:#0C1A2B;margin:0 0 6px"><strong>${dtb === 0 ? "It's your birthday today! 🎉" : `${dtb} day${dtb === 1 ? '' : 's'} until your next birthday.`}</strong></p>`);
    bits.push(`<p style="font-size:14px;color:#4b5563;margin:0 0 16px">This week's biorhythm — physical ${bio.physical}%, emotional ${bio.emotional}%, intellectual ${bio.intellectual}%.</p>`);
  }

  const celebRow = (c: any) => {
    const yr = c.birth_date ? new Date(c.birth_date + 'T12:00:00').getFullYear() : '';
    return `<li style="margin:0 0 4px"><strong>${c.name}</strong>${yr ? ` (b. ${yr})` : ''}${c.occupation ? ` — ${c.occupation}` : ''}</li>`;
  };
  if (global.length) bits.push(`<p style="font-size:14px;color:#0C1A2B;margin:16px 0 6px"><strong>Celebrities with birthdays this week</strong></p><ul style="font-size:14px;color:#4b5563;padding-left:18px;margin:0">${global.map(celebRow).join('')}</ul>`);
  if (india.length) bits.push(`<p style="font-size:14px;color:#0C1A2B;margin:16px 0 6px"><strong>From India 🇮🇳</strong></p><ul style="font-size:14px;color:#4b5563;padding-left:18px;margin:0">${india.map(celebRow).join('')}</ul>`);

  const html = `<!doctype html><html><body style="margin:0;background:#FBF6EA;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #E6D8B8">
      <div style="font-weight:800;color:#103A5C;font-size:18px;margin-bottom:2px">BornClock</div>
      <div style="font-size:12px;color:#8A9BA8;margin-bottom:18px">Hi ${name || 'there'}, here's your weekly reading.</div>
      ${bits.join('\n')}
      <div style="margin-top:24px;text-align:center">
        <a href="https://bornclock.com/" style="display:inline-block;background:#103A5C;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:10px 18px;border-radius:8px">Open BornClock</a>
      </div>
      <p style="font-size:11px;color:#9DB0BF;margin-top:22px;text-align:center">
        You're getting this because you asked for weekly readings.
        <a href="${unsubUrl}" style="color:#9DB0BF">Unsubscribe</a>.
      </p>
    </div></body></html>`;
  return { subject, html };
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST' && request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return json({ error: 'RESEND_API_KEY not configured' }, 500);

  let body: any = {};
  if (request.method === 'POST') { try { body = await request.json(); } catch { body = {}; } }

  const isTest = body?.test === true;
  const to = isTest ? (process.env.ADMIN_EMAIL || ADMIN_FALLBACK) : (body?.to ?? '');
  if (!to) return json({ error: 'Missing recipient (to) or test:true' }, 400);

  const name = body?.name ?? (isTest ? 'BornClock Admin' : '');
  // Sample dob for the test so days-until-birthday + biorhythm render.
  const dobStr = body?.dob ?? (isTest ? '1990-06-25' : null);
  const dob = dobStr && /^\d{4}-\d{2}-\d{2}$/.test(dobStr) ? new Date(dobStr + 'T12:00:00') : null;
  const today = new Date();

  let global: any[] = [], india: any[] = [];
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    try { const r = await celebsThisWeek(createClient(url, key, { auth: { persistSession: false } }), today); global = r.global; india = r.india; }
    catch (e) { console.error('[weekly-digest] celeb query failed:', (e as Error).message); }
  }

  const token = body?.token ?? 'sample-token';
  const unsubUrl = `https://bornclock.com/api/unsubscribe?token=${encodeURIComponent(token)}`;
  const { subject, html } = digestHtml({ name, dob, today, global, india, unsubUrl });

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
    });
    if (!resp.ok) { const err = await resp.json().catch(() => ({})); return json({ sent: false, error: err }, 502); }
    const data = await resp.json().catch(() => ({}));
    return json({ sent: true, to, subject, celebs: { global: global.length, india: india.length }, id: (data as any)?.id });
  } catch (e) {
    return json({ sent: false, error: (e as Error).message }, 502);
  }
}

export const POST = handler;
export const GET = handler;
