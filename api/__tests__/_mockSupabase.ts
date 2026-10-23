// In-memory Supabase stand-in for handler-level tests (security & payments).
// Supports the query-builder subset the API handlers use: select (incl. head
// counts), eq, in, order, range, limit, single, maybeSingle, insert, update,
// upsert (ignoreDuplicates), delete, rpc, auth.getUser, auth.admin.getUserById.

export interface MockState {
  tables: Record<string, any[]>;
  users: Record<string, any>;            // token → auth user
  usersById: Record<string, any>;        // id → auth user
  rpc: Record<string, (args: any) => any>;
  rpcCalls: { name: string; args: any }[];
  missingTables: Set<string>;
  failOps: Record<string, Partial<Record<'select' | 'insert' | 'update' | 'upsert' | 'delete', any>>>;
  getUserByIdCalls: string[];
}

export function newState(): MockState {
  return {
    tables: {}, users: {}, usersById: {}, rpc: {}, rpcCalls: [],
    missingTables: new Set(), failOps: {}, getUserByIdCalls: [],
  };
}

const UNIQUE: Record<string, string[][]> = {
  payments: [['razorpay_payment_id']],
  trial_claims: [['normalized_email']],
  promo_code_redemptions: [['code', 'user_id']],
  birthday_reports: [['slug']],
  webhook_events: [['event_id']],
  profiles: [['user_id']],
};

class Query {
  private filters: ((r: any) => boolean)[] = [];
  private op: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private payload: any = null;
  private selectOpts: any = {};
  private returning = false;
  private rangeArgs: [number, number] | null = null;
  private limitN: number | null = null;
  private upsertOpts: any = {};

  constructor(private s: MockState, private table: string) {}

  select(_cols?: string, opts?: any) {
    if (this.op === 'select') this.selectOpts = opts ?? {};
    else this.returning = true;
    return this;
  }
  eq(c: string, v: any) { this.filters.push(r => r[c] === v); return this; }
  in(c: string, vs: any[]) { this.filters.push(r => vs.includes(r[c])); return this; }
  is(c: string, v: any) { this.filters.push(r => (r[c] ?? null) === v); return this; }
  not() { return this; }
  order() { return this; }
  range(a: number, b: number) { this.rangeArgs = [a, b]; return this; }
  limit(n: number) { this.limitN = n; return this; }
  insert(row: any) { this.op = 'insert'; this.payload = row; return this; }
  update(v: any) { this.op = 'update'; this.payload = v; return this; }
  upsert(row: any, opts?: any) { this.op = 'upsert'; this.payload = row; this.upsertOpts = opts ?? {}; return this; }
  delete() { this.op = 'delete'; return this; }

  async single() { const r = await this.exec(); const d = Array.isArray(r.data) ? r.data[0] : r.data; return d ? { data: d, error: r.error } : { data: null, error: r.error ?? { code: 'PGRST116', message: 'no rows' } }; }
  async maybeSingle() { const r = await this.exec(); const d = Array.isArray(r.data) ? r.data[0] ?? null : r.data; return { data: d, error: r.error }; }
  then(res: any, rej?: any) { return this.exec().then(res, rej); }

  private rows() { return (this.s.tables[this.table] ??= []); }
  private matches() { return this.rows().filter(r => this.filters.every(f => f(r))); }
  private conflict(row: any) {
    return (UNIQUE[this.table] ?? []).some(keys =>
      this.rows().some(r => keys.every(k => r[k] !== undefined && r[k] === row[k])));
  }

  private async exec(): Promise<any> {
    if (this.s.missingTables.has(this.table)) {
      return { data: null, error: { code: '42P01', message: `relation "${this.table}" does not exist` }, count: null };
    }
    const fail = this.s.failOps[this.table]?.[this.op];
    if (fail) return { data: null, error: fail, count: null };

    switch (this.op) {
      case 'select': {
        let rows = this.matches();
        if (this.selectOpts.head) return { data: null, error: null, count: rows.length };
        if (this.rangeArgs) rows = rows.slice(this.rangeArgs[0], this.rangeArgs[1] + 1);
        if (this.limitN != null) rows = rows.slice(0, this.limitN);
        return { data: rows.map(r => ({ ...r })), error: null, count: rows.length };
      }
      case 'insert': {
        const list = Array.isArray(this.payload) ? this.payload : [this.payload];
        for (const row of list) {
          if (this.conflict(row)) return { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint' } };
        }
        for (const row of list) this.rows().push({ ...row });
        return { data: this.returning ? list : null, error: null };
      }
      case 'upsert': {
        const list = Array.isArray(this.payload) ? this.payload : [this.payload];
        for (const row of list) {
          if (this.conflict(row)) { if (this.upsertOpts.ignoreDuplicates) continue; }
          this.rows().push({ ...row });
        }
        return { data: null, error: null };
      }
      case 'update': {
        const rows = this.matches();
        rows.forEach(r => Object.assign(r, this.payload));
        return { data: this.returning ? rows.map(r => ({ ...r })) : null, error: null };
      }
      case 'delete': {
        const keep = this.rows().filter(r => !this.filters.every(f => f(r)));
        this.s.tables[this.table] = keep;
        return { data: null, error: null };
      }
    }
  }
}

export function mockClient(s: MockState) {
  return {
    from: (t: string) => new Query(s, t),
    rpc: async (name: string, args: any) => {
      s.rpcCalls.push({ name, args });
      const fn = s.rpc[name];
      return fn ? fn(args) : { data: null, error: null };
    },
    auth: {
      getUser: async (token: string) => ({ data: { user: s.users[token] ?? null }, error: s.users[token] ? null : { message: 'bad jwt' } }),
      admin: {
        getUserById: async (id: string) => { s.getUserByIdCalls.push(id); return { data: { user: s.usersById[id] ?? null }, error: null }; },
        listUsers: async () => ({ data: { users: Object.values(s.usersById) } }),
      },
    },
  };
}

/** Register a signed-in user: token → user, id → user. */
export function addUser(s: MockState, token: string, user: { id: string; email: string; confirmed?: boolean }) {
  const u = { id: user.id, email: user.email, email_confirmed_at: user.confirmed === false ? null : '2026-10-01T00:00:00Z', user_metadata: {} };
  s.users[token] = u;
  s.usersById[user.id] = u;
  return u;
}
