// api/_userAuth.ts — shared caller identity + server-side entitlement checks.
//
// Every endpoint that touches money or paid features identifies the caller from
// their Supabase access token (Authorization: Bearer <jwt>), validated with
// auth.getUser() on the service-role client. A user id / tier / "isPremium" sent
// in the request body is NEVER trusted for an access decision.
import { createClient } from '@supabase/supabase-js';

export interface AuthedUser {
  id: string;
  email: string | null;
  /** true when Supabase has confirmed the address (email_confirmed_at set). */
  emailConfirmed: boolean;
}

export function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export function bearerToken(request: Request): string | null {
  const h = request.headers.get('authorization') ?? '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

/** Resolve the signed-in caller, or null (no/invalid token). Never throws. */
export async function getAuthedUser(request: Request, db?: any): Promise<AuthedUser | null> {
  const token = bearerToken(request);
  if (!token) return null;
  try {
    const client = db ?? serviceClient();
    const { data, error } = await client.auth.getUser(token);
    const u = data?.user;
    if (error || !u?.id) return null;
    return {
      id: u.id,
      email: u.email ?? null,
      emailConfirmed: !!(u.email_confirmed_at || u.confirmed_at),
    };
  } catch {
    return null;
  }
}

// Paid (and trial-unlocked) reports never expire — founder decision, Oct 2026.
// Postgres timestamptz accepts 'infinity'; /api/report treats is_paid as permanent
// regardless of this value.
export const PERMANENT_EXPIRY = 'infinity';

const TRIAL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Server-side mirror of useAuth.ts's isPremium: an active (or cancelled-but-paid-
 * through) subscription, an active promo grant, or the 7-day new-account trial.
 */
export function profileIsPremium(p: any, now: Date = new Date()): boolean {
  if (!p) return false;
  const cancelledAndExpired = p.subscription_status === 'cancelled'
    && !!p.premium_until && new Date(p.premium_until) <= now;
  const promo = !!p.promo_premium_until && new Date(p.promo_premium_until) > now;
  const trial = !!p.created_at && (now.getTime() - new Date(p.created_at).getTime()) < TRIAL_MS;
  return !cancelledAndExpired && (!!p.premium_status || trial || promo);
}

/** Load the caller's profile and decide premium on the server. */
export async function userIsPremium(db: any, userId: string): Promise<boolean> {
  try {
    const { data } = await db
      .from('profiles')
      .select('premium_status, premium_until, subscription_status, promo_premium_until, created_at')
      .eq('user_id', userId)
      .maybeSingle();
    return profileIsPremium(data);
  } catch {
    return false;
  }
}

/**
 * Normalise an email for "one free report per person": lower-case, drop a
 * +tag, and for Gmail drop dots in the local part (Gmail ignores both).
 */
export function normalizeEmail(email: string): string {
  const e = String(email || '').trim().toLowerCase();
  const at = e.lastIndexOf('@');
  if (at < 1) return e;
  let local = e.slice(0, at);
  let domain = e.slice(at + 1);
  if (domain === 'googlemail.com') domain = 'gmail.com';
  local = local.split('+')[0];
  if (domain === 'gmail.com') local = local.replace(/\./g, '');
  return `${local}@${domain}`;
}

/** HTML-escape a string for safe interpolation into email HTML. */
export function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
