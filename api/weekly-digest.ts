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
const LOGO_URL = 'https://bornclock.com/bornclock-logo.png';
const ADMIN_FALLBACK = 'himanshu1305@gmail.com';

// Honesty register (mirrors the fitness pages / report Biorhythm note): the digest
// carries ONE gentle prompt, never a prescription or performance/medical claim.
const DIGEST_PROMPT =
  'One gentle prompt for the week: rhythm charts are a reflection tool, not a plan — the thing that actually moves the needle is showing up consistently. Pick one small habit and just don\'t miss twice.';

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
    subject = dtb === 0 ? '🎂 Happy birthday from BornClock!' : `Your week ahead — ${dtb} days to your birthday`;
    bits.push(`<p style="font-size:16px;color:#0C1A2B;margin:0 0 6px"><strong>${dtb === 0 ? "It's your birthday today! 🎉" : `${dtb} day${dtb === 1 ? '' : 's'} until your next birthday.`}</strong></p>`);

    // 7-day rhythm outline (same engine as the fitness widgets) — an awareness cue.
    const outline: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      const b = biorhythm(dob, d);
      const label = i === 0 ? 'Today' : d.toLocaleDateString('en-GB', { weekday: 'short' });
      outline.push(`<tr><td style="padding:2px 8px 2px 0;color:#6b7280">${label}</td><td style="padding:2px 0;color:#4b5563">P ${b.physical > 0 ? '+' : ''}${b.physical} · E ${b.emotional > 0 ? '+' : ''}${b.emotional} · M ${b.intellectual > 0 ? '+' : ''}${b.intellectual}</td></tr>`);
    }
    bits.push(`<p style="font-size:14px;color:#0C1A2B;margin:14px 0 4px"><strong>Your 7-day rhythm outline</strong> <span style="color:#8A9BA8;font-weight:400">(a check-in, not a plan)</span></p><table style="font-size:12px;border-collapse:collapse">${outline.join('')}</table>`);
  }

  const celebRow = (c: any) => {
    const yr = c.birth_date ? new Date(c.birth_date + 'T12:00:00').getFullYear() : '';
    return `<li style="margin:0 0 4px"><strong>${c.name}</strong>${yr ? ` (b. ${yr})` : ''}${c.occupation ? ` — ${c.occupation}` : ''}</li>`;
  };
  if (global.length) bits.push(`<p style="font-size:14px;color:#0C1A2B;margin:16px 0 6px"><strong>Celebrities with birthdays this week</strong></p><ul style="font-size:14px;color:#4b5563;padding-left:18px;margin:0">${global.map(celebRow).join('')}</ul>`);
  if (india.length) bits.push(`<p style="font-size:14px;color:#0C1A2B;margin:16px 0 6px"><strong>From India 🇮🇳</strong></p><ul style="font-size:14px;color:#4b5563;padding-left:18px;margin:0">${india.map(celebRow).join('')}</ul>`);

  // One gentle fitness/habit prompt in the honesty register.
  bits.push(`<p style="font-size:13px;color:#4b5563;background:#FBF6EA;border-left:3px solid #B8862F;border-radius:0 8px 8px 0;padding:10px 12px;margin:16px 0 0">${DIGEST_PROMPT}</p>`);
  // One discovery link — this week's notable birthdays.
  bits.push(`<p style="font-size:13px;color:#0C1A2B;margin:14px 0 0"><a href="https://bornclock.com/born-on" style="color:#103A5C;font-weight:600">Discover who shares your birthday this week →</a></p>`);

  const html = `<!doctype html><html><body style="margin:0;background:#FBF6EA;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto">
      <div style="text-align:center;padding-bottom:20px">
        <img src="${LOGO_URL}" alt="BornClock" height="44" width="165" style="height:44px;width:165px;display:inline-block;border:0" border="0" />
      </div>
      <div style="background:#fff;border-radius:12px;padding:28px;border:1px solid #E6D8B8">
        <div style="font-size:13px;color:#8A9BA8;margin-bottom:18px">Hi ${name || 'there'}, here's your week ahead.</div>
        ${bits.join('\n')}
        <div style="margin-top:24px;text-align:center">
          <a href="https://bornclock.com/" style="display:inline-block;background:#103A5C;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:10px 18px;border-radius:8px">Open BornClock</a>
        </div>
        <p style="font-size:11px;color:#9DB0BF;margin-top:22px;text-align:center">
          You're getting this because you asked for weekly readings.
          <a href="${unsubUrl}" style="color:#9DB0BF">Unsubscribe</a>.
        </p>
      </div>
      <p style="text-align:center;font-size:12px;color:#9ca3af;font-style:italic;margin:18px 0 0">Know your time. Live it well.</p>
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

  // Real (non-test) sends are gated behind DIGEST_LIVE. Until the founder reviews a
  // test render and sets DIGEST_LIVE=true, live sends NO-OP with a log line. Test
  // renders to ADMIN_EMAIL always work so a sample can be reviewed.
  if (!isTest && process.env.DIGEST_LIVE !== 'true') {
    console.log('[weekly-digest] skipped: DIGEST_LIVE not enabled (set DIGEST_LIVE=true to go live)');
    return json({ sent: false, skipped: true, reason: 'DIGEST_LIVE not enabled' });
  }

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
