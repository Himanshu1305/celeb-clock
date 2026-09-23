import { describe, it, expect, afterEach } from 'vitest';
import { verifyAdminToken, verifyAdminRequest, adminAllowlist } from '../_adminAuth';
import { limitForTier, checkRateLimit, isOverLimit } from '../../src/lib/vedic/rateLimit';

// Injected verifiers standing in for Supabase's JWT check.
const asEmail = (email: string | null) => async (_t: string) => email;
const throwing = async (_t: string) => { throw new Error('supabase down'); };

const ADMIN = 'himanshu1305@gmail.com';       // in the shared allowlist
const NORMAL = 'someone.else@gmail.com';      // a normal user

describe('adminAllowlist', () => {
  const orig = process.env.ADMIN_EMAILS;
  afterEach(() => { if (orig === undefined) delete process.env.ADMIN_EMAILS; else process.env.ADMIN_EMAILS = orig; });

  it('always includes the shared admin emails', () => {
    expect(adminAllowlist()).toContain('himanshu1305@gmail.com');
    expect(adminAllowlist()).toContain('hello@bornclock.com');
    expect(adminAllowlist()).toContain('dixisurabhi@gmail.com'); // unlimited/Pro access grant
  });
  it('merges the ADMIN_EMAILS env var (comma-separated, revocable without a rebuild)', () => {
    process.env.ADMIN_EMAILS = 'Temp-Admin@Test.com, another@test.com';
    const list = adminAllowlist();
    expect(list).toContain('temp-admin@test.com'); // normalised lower-case
    expect(list).toContain('another@test.com');
    expect(list).toContain('himanshu1305@gmail.com'); // shared still present
  });
});

describe('verifyAdminToken — server-side identity check', () => {
  it('POSITIVE: a valid JWT for an allowlisted email → admin', async () => {
    expect(await verifyAdminToken('valid-jwt', asEmail(ADMIN))).toEqual({ isAdmin: true, email: ADMIN });
  });
  it('NEGATIVE: a valid JWT for a NON-allowlisted email → not admin', async () => {
    expect(await verifyAdminToken('valid-jwt', asEmail(NORMAL))).toEqual({ isAdmin: false, email: NORMAL });
  });
  it('ADVERSARIAL: no token → not admin (verifier never consulted)', async () => {
    let called = false;
    const spy = async (_t: string) => { called = true; return ADMIN; };
    expect(await verifyAdminToken(null, spy)).toEqual({ isAdmin: false, email: null });
    expect(called).toBe(false);
  });
  it('ADVERSARIAL: an invalid/forged token (verifier returns null) → not admin', async () => {
    expect(await verifyAdminToken('forged-garbage', asEmail(null))).toEqual({ isAdmin: false, email: null });
  });
  it('ADVERSARIAL: verifier throws (Supabase error / misconfig) → fails CLOSED', async () => {
    expect(await verifyAdminToken('whatever', throwing)).toEqual({ isAdmin: false, email: null });
  });
  it('normalises case/whitespace before matching', async () => {
    expect(await verifyAdminToken('t', asEmail('  HIMANSHU1305@GMAIL.COM '))).toEqual({ isAdmin: true, email: ADMIN });
  });
});

describe('verifyAdminRequest — bearer extraction', () => {
  const req = (headers: Record<string, string>) => new Request('http://x/api/vedic-chat', { method: 'POST', headers });
  it('POSITIVE: Authorization: Bearer <admin jwt> → admin', async () => {
    expect((await verifyAdminRequest(req({ Authorization: 'Bearer good' }), asEmail(ADMIN))).isAdmin).toBe(true);
  });
  it('ADVERSARIAL: no Authorization header → not admin', async () => {
    expect((await verifyAdminRequest(req({}), asEmail(ADMIN))).isAdmin).toBe(false);
  });
  it('ADVERSARIAL: malformed header (no Bearer scheme) → not admin', async () => {
    expect((await verifyAdminRequest(req({ Authorization: 'good' }), asEmail(ADMIN))).isAdmin).toBe(false);
  });
});

describe('rateLimit — admin tier is unlimited', () => {
  it('limitForTier(admin) is Infinity', () => {
    expect(limitForTier('admin')).toBe(Number.POSITIVE_INFINITY);
  });
  it('admin is never over the limit, even at a huge count', () => {
    expect(isOverLimit(9999, 'admin')).toBe(false);
    expect(checkRateLimit({ day: '2026-01-01', count: 9999 }, 'admin', new Date('2026-01-01')).allowed).toBe(true);
  });
  it('free/paid enforcement is unchanged (regression guard)', () => {
    expect(isOverLimit(3, 'free')).toBe(true);
    expect(isOverLimit(2, 'free')).toBe(false);
    expect(isOverLimit(15, 'paid')).toBe(true);
  });
});
