// Server-side admin verification (Part N) — the REAL security boundary for the
// testing bypass. Given an HTTP request, it decides whether the caller is a
// verified admin, using ONLY a cryptographically-verified Supabase identity:
//
//   1. read the Bearer access-token from the Authorization header (nothing else),
//   2. validate it with Supabase (`auth.getUser`) → the true, signed-in email,
//   3. check that email against the admin allowlist.
//
// A client CANNOT self-promote: sending `tier:"admin"` in the body, or setting a
// localStorage/isAdmin flag, does nothing here — this only trusts a valid JWT that
// belongs to an allowlisted account (i.e. someone who actually logged in as the
// admin). Fails CLOSED: no token, bad token, mis-config, or any error → not admin.
//
// Revocable without touching this file: the allowlist is the shared
// `src/lib/adminEmails.ts` UNION an optional `ADMIN_EMAILS` env var (comma-sep),
// so an entry can be removed from either source (env change needs no client rebuild).
import { createClient } from '@supabase/supabase-js';
import { ADMIN_EMAILS } from '../src/lib/adminEmails.js';

export interface AdminVerification { isAdmin: boolean; email: string | null; }

/** Verifies a bearer token → the caller's real email, or null. Injectable for tests. */
export type TokenVerifier = (token: string) => Promise<string | null>;

/** The effective admin allowlist: shared constant ∪ ADMIN_EMAILS env var. */
export function adminAllowlist(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS || '')
    .split(',').map(s => s.toLowerCase().trim()).filter(Boolean);
  const shared = ADMIN_EMAILS.map(s => s.toLowerCase().trim());
  return Array.from(new Set([...shared, ...fromEnv]));
}

/** Production token verifier — validates the JWT with Supabase (fail-closed). */
export const supabaseVerifier: TokenVerifier = async (token) => {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null; // not configured → never grant admin
  try {
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data?.user?.email) return null;
    return data.user.email;
  } catch {
    return null;
  }
};

/** Core policy: token → admin decision. Pure except for the injected verifier. */
export async function verifyAdminToken(token: string | null, verify: TokenVerifier = supabaseVerifier): Promise<AdminVerification> {
  if (!token) return { isAdmin: false, email: null };
  let email: string | null = null;
  try { email = await verify(token); } catch { return { isAdmin: false, email: null }; }
  if (!email) return { isAdmin: false, email: null };
  const norm = email.toLowerCase().trim();
  return { isAdmin: adminAllowlist().includes(norm), email: norm };
}

/** Extract the Bearer token from a request and verify it. */
export async function verifyAdminRequest(request: Request, verify: TokenVerifier = supabaseVerifier): Promise<AdminVerification> {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return verifyAdminToken(m ? m[1].trim() : null, verify);
}
