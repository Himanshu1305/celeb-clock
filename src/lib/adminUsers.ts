/**
 * Admin user-management data helpers — extracted from Admin.tsx so the phantom-column
 * fallback and write-error surfacing are unit-testable without mounting the page.
 *
 * Background: profiles.promo_premium_until does not exist on the live table pre
 * NOTES-promo-column.sql. PostgREST 400s the WHOLE query when a selected column is
 * missing, so the old fetchUsers (which selected it and swallowed the error) returned
 * an empty list for every admin. These helpers tolerate the column being absent and
 * always report failures instead of silently emptying the list.
 */

export interface AdminUserRow {
  id: string;
  email?: string;
  name?: string;
  country?: string;
  created_at: string;
  premium_status?: boolean;
  promo_premium_until?: string | null;
}

// Full select includes promo_premium_until; fallback drops it for pre-migration tables.
export const ADMIN_USER_COLS_FULL =
  'id, email, name, country, created_at, premium_status, promo_premium_until';
export const ADMIN_USER_COLS_FALLBACK =
  'id, email, name, country, created_at, premium_status';

export interface LoadUsersResult {
  users: AdminUserRow[];
  usedFallback: boolean;   // full select failed, we retried without promo_premium_until
  error: string | null;    // FATAL — both selects failed, list is empty
  warning: string | null;  // full failed but fallback rendered rows (promo column missing)
}

/**
 * Minimal shape of the Supabase client this module needs. Kept structural so tests can
 * pass a lightweight mock instead of a real client.
 */
export interface AdminDbClient {
  auth: { getSession: () => Promise<unknown> };
  from: (table: string) => {
    select: (cols: string) => {
      order: (col: string, opts: { ascending: boolean }) => {
        limit: (n: number) => Promise<{ data: unknown; error: { message: string } | null }>;
      };
    };
    update: (patch: Record<string, unknown>) => {
      eq: (col: string, val: unknown) => Promise<{ error: { message: string } | null }>;
    };
  };
}

const selectProfiles = (client: AdminDbClient, cols: string) =>
  client.from('profiles').select(cols).order('created_at', { ascending: false }).limit(50);

/**
 * Load the 50 most recent profiles for the admin Users table. Awaits the session first
 * so RLS evaluates as the admin (not anon), then selects with a promo-column fallback.
 */
export async function loadAdminUsers(client: AdminDbClient): Promise<LoadUsersResult> {
  // Hydrate the persisted session BEFORE querying, so the JWT is attached and RLS
  // returns the admin's rows rather than anon's zero rows.
  await client.auth.getSession();

  const full = await selectProfiles(client, ADMIN_USER_COLS_FULL);
  if (!full.error) {
    return { users: (full.data as AdminUserRow[]) ?? [], usedFallback: false, error: null, warning: null };
  }

  // Retry WITHOUT promo_premium_until (pre NOTES-promo-column.sql) so details still render.
  const fb = await selectProfiles(client, ADMIN_USER_COLS_FALLBACK);
  if (fb.error) {
    return { users: [], usedFallback: true, error: fb.error.message, warning: null };
  }
  return { users: (fb.data as AdminUserRow[]) ?? [], usedFallback: true, error: null, warning: full.error.message };
}

/** Result of a profile write — { error } is the DB error message, or null on success. */
export interface WriteResult { error: string | null; }

export async function grantPromoDays(client: AdminDbClient, id: string, days: number): Promise<WriteResult> {
  const until = new Date();
  until.setDate(until.getDate() + days);
  const { error } = await client
    .from('profiles')
    .update({ promo_premium_until: until.toISOString() })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function grantFullPremium(client: AdminDbClient, id: string): Promise<WriteResult> {
  const { error } = await client.from('profiles').update({ premium_status: true }).eq('id', id);
  return { error: error?.message ?? null };
}

export async function revokePremium(client: AdminDbClient, id: string): Promise<WriteResult> {
  const { error } = await client
    .from('profiles')
    .update({ premium_status: false, promo_premium_until: null })
    .eq('id', id);
  return { error: error?.message ?? null };
}
