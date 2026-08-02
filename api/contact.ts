/**
 * /api/contact (BATCH-9 P9) — contact form → Resend → founder inbox.
 * Anti-spam: honeypot field (`website`) silently dropped + a minimal per-IP rate limit.
 * No captcha. The submitter's address becomes reply_to so replies go straight back to them.
 *
 * DELIVERY (batch-9 fix): TO must be ADMIN_EMAIL — hello@bornclock.com is a verified Resend
 * SENDER but its INBOUND routing is unverified, so mail addressed there was accepted (2xx)
 * yet never landed in a real inbox. ADMIN_EMAIL is the founder's real, deliverable address.
 * hello@ stays as the FROM (verified sender); the submitter stays as reply_to.
 */
const FROM_EMAIL = 'BornClock <hello@bornclock.com>';
const TOPICS = new Set(['general', 'support', 'feedback', 'partnership', 'privacy', 'correction']);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Minimal best-effort rate limit (per isolate): 3 messages / 10 min / IP.
const HITS = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now(), windowMs = 10 * 60 * 1000, max = 3;
  const arr = (HITS.get(ip) ?? []).filter(t => now - t < windowMs);
  if (arr.length >= max) { HITS.set(ip, arr); return true; }
  arr.push(now); HITS.set(ip, arr);
  return false;
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body: { name?: string; email?: string; message?: string; topic?: string; website?: string };
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }

  // Honeypot: real users never fill `website`. Bots do → accept silently, send nothing.
  if (body.website && body.website.trim() !== '') return json({ ok: true });

  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim();
  const message = (body.message ?? '').trim();
  const topic = TOPICS.has(body.topic ?? '') ? body.topic! : 'general';

  if (!name || !email || !message) return json({ error: 'Please fill in your name, email and message.', field: !name ? 'name' : !email ? 'email' : 'message' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Please enter a valid email address.', field: 'email' }, 400);
  if (message.length > 5000) return json({ error: 'Message is too long.', field: 'message' }, 400);

  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || 'unknown';
  if (rateLimited(ip)) return json({ error: 'Too many messages — please try again in a few minutes.' }, 429);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return json({ error: 'Email service not configured' }, 500);

  // Deliver to the founder's real inbox (see header note). Read per-request, not at
  // module load, because the Worker env shim isn't populated until a request is handled.
  const toEmail = process.env.ADMIN_EMAIL || 'hello@bornclock.com';

  const subject = `[Contact · ${topic}] ${name}`;
  const html =
    `<p><strong>Topic:</strong> ${esc(topic)}</p>` +
    `<p><strong>From:</strong> ${esc(name)} &lt;${esc(email)}&gt;</p>` +
    `<hr/><p style="white-space:pre-wrap">${esc(message)}</p>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to: toEmail, reply_to: email, subject, html }),
    });
    if (!res.ok) {
      console.error('[contact] Resend failed', res.status, await res.text().catch(() => ''));
      return json({ error: 'Could not send your message. Please email hello@bornclock.com directly.' }, 502);
    }
    // Log the Resend message id (id ONLY — never the message content) to confirm delivery.
    const id = await res.json().then((r: { id?: string }) => r?.id).catch(() => undefined);
    console.log('[contact] sent', id ?? '(no id)');
    return json({ ok: true });
  } catch (e) {
    console.error('[contact] send threw', e);
    return json({ error: 'Could not send your message. Please email hello@bornclock.com directly.' }, 502);
  }
}

export const POST = handler;
