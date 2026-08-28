// Tests for the buyer-state capture endpoint + the GST state-code validators it
// shares with the client. Supabase is mocked so the handler runs offline.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isValidIndiaStateCode, stateNameForCode } from '@/data/indiaStates';

// Hoisted store the mocked client writes into, so assertions can inspect the call.
const h = vi.hoisted(() => ({ userId: null as string | null, update: null as any, eq: null as any }));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: async (_token: string) => ({ data: { user: h.userId ? { id: h.userId } : null } }),
    },
    from: () => ({
      update: (vals: any) => {
        h.update = vals;
        return { eq: (col: string, val: any) => { h.eq = { col, val }; return Promise.resolve({ error: null }); } };
      },
    }),
  }),
}));

const { POST } = await import('../update-buyer-state.ts');

const req = (opts: { method?: string; auth?: boolean; body?: any }) =>
  new Request('http://localhost/api/update-buyer-state', {
    method: opts.method ?? 'POST',
    headers: {
      'content-type': 'application/json',
      ...(opts.auth ? { authorization: 'Bearer test-token' } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

beforeEach(() => { h.userId = 'user-1'; h.update = null; h.eq = null; });

describe('GST state-code validators', () => {
  it('accepts real GST codes', () => {
    expect(isValidIndiaStateCode('36')).toBe(true);  // Telangana
    expect(isValidIndiaStateCode('01')).toBe(true);  // J&K
    expect(isValidIndiaStateCode('37')).toBe(true);  // Andhra Pradesh
  });
  it('rejects invalid / missing codes', () => {
    expect(isValidIndiaStateCode('99')).toBe(false);
    expect(isValidIndiaStateCode('25')).toBe(false); // 25 is not an assigned code
    expect(isValidIndiaStateCode('')).toBe(false);
    expect(isValidIndiaStateCode(null)).toBe(false);
    expect(isValidIndiaStateCode(undefined)).toBe(false);
  });
  it('resolves the canonical state name', () => {
    expect(stateNameForCode('36')).toBe('Telangana');
    expect(stateNameForCode('99')).toBeNull();
  });
});

describe('POST /api/update-buyer-state', () => {
  it('accepts a valid state code and writes it keyed on user_id', async () => {
    const res = await POST(req({ auth: true, body: { state_code: '36' } }));
    expect(res.status).toBe(200);
    expect(h.update).toMatchObject({ buyer_state_code: '36', buyer_state: 'Telangana', buyer_country: 'India' });
    expect(h.eq).toEqual({ col: 'user_id', val: 'user-1' });  // never keyed on id
  });

  it('rejects an invalid state code with 400 and writes nothing', async () => {
    const res = await POST(req({ auth: true, body: { state_code: '99' } }));
    expect(res.status).toBe(400);
    expect(h.update).toBeNull();
  });

  it('rejects a missing state code with 400', async () => {
    const res = await POST(req({ auth: true, body: {} }));
    expect(res.status).toBe(400);
  });

  it('requires authentication (no Bearer → 401)', async () => {
    const res = await POST(req({ body: { state_code: '36' } }));
    expect(res.status).toBe(401);
    expect(h.update).toBeNull();
  });

  it('rejects a token that resolves to no user (401)', async () => {
    h.userId = null;
    const res = await POST(req({ auth: true, body: { state_code: '36' } }));
    expect(res.status).toBe(401);
  });

  it('rejects non-POST methods (405)', async () => {
    const res = await POST(req({ method: 'GET' }));
    expect(res.status).toBe(405);
  });
});
