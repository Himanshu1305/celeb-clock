// api/reminders.ts — save a birthday reminder WITH the address to email (audit T5).
//
// Signed in  → the reminder goes to the account's own email (any body email is ignored).
// Guest      → an email address is required, plus an explicit consent tick.
// Inserts use the service role (RLS insert is closed to clients by the 20261024 migration),
// so the address stored is always one the server chose by these rules.
import { serviceClient, getAuthedUser } from './_userAuth.js';
import { birthdayInYear } from './_reminders.js';

const MAX_PER_ADDRESS = 50;   // abuse cap: no one needs more than 50 reminders to one inbox
const EMAIL_RE = /^[^\s@<>"']{1,64}@[^\s@<>"']{1,255}\.[a-z]{2,}$/i;
const LEADS = new Set([0, 1, 3, 7, 14]);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export function validDob(dob: string, today = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;
  const y = Number(dob.slice(0, 4));
  // Real calendar date (29 Feb only in leap years), not in the future, not before 1900.
  if (birthdayInYear(dob, y) !== dob) return false;
  const d = new Date(dob + 'T00:00:00Z');
  if (Number.isNaN(d.getTime()) || d.getUTCDate() !== Number(dob.slice(8, 10))) return false;
  return y >= 1900 && d.getTime() <= today.getTime() + 86400000;
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }

  const friend_name = String(body?.friend_name ?? '').trim().slice(0, 80);
  const friend_dob = String(body?.friend_dob ?? '').trim();
  const relationship = body?.relationship ? String(body.relationship).trim().slice(0, 40) : null;
  const lead = Number(body?.remind_days_before ?? 3);
  if (!friend_name) return json({ error: "Please enter your friend's name." }, 400);
  if (!validDob(friend_dob)) return json({ error: 'Please enter a valid birthday.' }, 400);
  if (!LEADS.has(lead)) return json({ error: 'Invalid reminder lead time.' }, 400);

  const db = serviceClient();
  const caller = await getAuthedUser(request, db);
  let notify_email: string;
  if (caller) {
    if (!caller.email) return json({ error: 'Your account has no email address to send reminders to.' }, 400);
    notify_email = caller.email.trim().toLowerCase();
  } else {
    const email = String(body?.email ?? '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return json({ error: 'Please enter a valid email address for the reminder.' }, 400);
    if (body?.consent !== true) return json({ error: 'Please tick the box to agree to reminder emails.' }, 400);
    notify_email = email;
  }

  const { count, error: cntErr } = await db
    .from('birthday_reminders')
    .select('id', { count: 'exact', head: true })
    .eq('notify_email', notify_email);
  if (!cntErr && (count ?? 0) >= MAX_PER_ADDRESS) {
    return json({ error: `You already have ${MAX_PER_ADDRESS} reminders for this address.` }, 429);
  }

  const row = {
    user_id: caller?.id ?? null,
    friend_name,
    friend_dob,
    relationship,
    remind_days_before: lead,
    notify_email,
    unsubscribe_token: crypto.randomUUID(),
    consent_at: new Date().toISOString(),
  };
  const { data, error } = await db.from('birthday_reminders').insert(row).select('id');
  if (error) {
    console.error('[reminders] insert error', error.message ?? error);
    return json({ error: 'Could not save the reminder. Please try again.' }, 500);
  }
  const id = Array.isArray(data) ? data[0]?.id : (data as any)?.id;
  return json({ ok: true, id: id ?? null, notify_email });
}

export const POST = handler;
