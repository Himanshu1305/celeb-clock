// Audit round 2, T5 — /reminders never sent emails. Mocked clock + in-memory Supabase.
// Calendar facts used (Gregorian leap-year rule, no external reference needed):
// 2026 and 2027 are not leap years; 2028 is. The daily job runs at 06:30 UTC = 12:00 IST.
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from 'vitest';
import { newState, mockClient, addUser, type MockState } from './_mockSupabase';

const h = vi.hoisted(() => ({ state: null as any }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => mockClient(h.state) }));

process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
process.env.RESEND_API_KEY = 're_test';

const emails: any[] = [];
let resendOk = true;
vi.stubGlobal('fetch', vi.fn(async (url: string, init?: any) => {
  if (String(url).includes('api.resend.com')) {
    emails.push(JSON.parse(init.body));
    return new Response(JSON.stringify(resendOk ? { id: 'e' } : { error: 'x' }), { status: resendOk ? 200 : 500 });
  }
  return new Response('{}', { status: 200 });
}));

let S: MockState;
let R: typeof import('../_reminders');
let api: typeof import('../reminders');
let unsub: typeof import('../unsubscribe');
beforeAll(async () => {
  R = await import('../_reminders');
  api = await import('../reminders');
  unsub = await import('../unsubscribe');
});
beforeEach(() => {
  S = newState(); h.state = S; emails.length = 0; resendOk = true;
  delete process.env.SUPPRESS_OUTBOUND_EMAIL; delete process.env.EMAIL_ALLOWLIST; delete process.env.REMINDERS_LIVE;
});
afterEach(() => { delete process.env.SUPPRESS_OUTBOUND_EMAIL; delete process.env.EMAIL_ALLOWLIST; });

const runAt = (isoDay: string) => new Date(`${isoDay}T06:30:00Z`);   // the scheduled run
const TOKEN = '11111111-2222-4333-8444-555555555555';
const rem = (over: any = {}) => ({
  id: 'r1', user_id: null, friend_name: 'Priya', friend_dob: '1990-05-10', relationship: 'Friend',
  remind_days_before: 3, notify_email: 'me@example.com', unsubscribe_token: TOKEN, unsubscribed_at: null, last_notified_year: null, ...over,
});

describe('due-date rules', () => {
  it('29 Feb is observed on 28 Feb in non-leap years and on 29 Feb in leap years', () => {
    expect(R.birthdayInYear('1988-02-29', 2027)).toBe('2027-02-28');
    expect(R.birthdayInYear('1988-02-29', 2028)).toBe('2028-02-29');
    expect(R.birthdayInYear('1990-05-10', 2027)).toBe('2027-05-10');
    expect(R.isLeapYear(2100)).toBe(false);
    expect(R.isLeapYear(2000)).toBe(true);
  });
  it('due from remind_days_before days ahead up to the day; next year once passed', () => {
    expect(R.dueBirthday('1990-05-10', 3, '2027-05-06')).toBeNull();
    expect(R.dueBirthday('1990-05-10', 3, '2027-05-07')).toEqual({ date: '2027-05-10', year: 2027, daysAway: 3 });
    expect(R.dueBirthday('1990-05-10', 3, '2027-05-10')).toEqual({ date: '2027-05-10', year: 2027, daysAway: 0 });
    expect(R.dueBirthday('1990-05-10', 3, '2027-05-11')).toBeNull();
    // across the new year: 2 Jan birthday, 7-day lead, run on 27 Dec 2026
    expect(R.dueBirthday('1990-01-02', 7, '2026-12-27')).toEqual({ date: '2027-01-02', year: 2027, daysAway: 6 });
  });
  it('uses the India calendar date: 20:00 UTC on 6 May is already 7 May in IST', () => {
    expect(R.istDate(new Date('2027-05-06T20:00:00Z'))).toBe('2027-05-07');
  });
});

describe('daily job sends each reminder once per year (mocked clock)', () => {
  it('runs every day for two years → exactly one email per birthday year, on the right day', async () => {
    S.tables.birthday_reminders = [rem()];
    const sentOn: string[] = [];
    for (let t = Date.parse('2027-01-01T06:30:00Z'); t <= Date.parse('2028-12-31T06:30:00Z'); t += 86400000) {
      const before = emails.length;
      await R.runBirthdayReminders(mockClient(S), new Date(t));
      if (emails.length > before) sentOn.push(new Date(t).toISOString().slice(0, 10));
    }
    expect(sentOn).toEqual(['2027-05-07', '2028-05-07']);
    expect(emails[0].to).toEqual(['me@example.com']);
    expect(emails[0].subject).toBe("Priya's birthday is in 3 days 🎂");
    expect(emails[0].html).toContain(`/api/unsubscribe?list=reminders&token=${TOKEN}`);
    expect(S.tables.birthday_reminders[0].last_notified_year).toBe(2028);
  });

  it('29 Feb birthday fires on 28 Feb 2027 (non-leap) and 29 Feb 2028 (leap) with a same-day lead', async () => {
    S.tables.birthday_reminders = [rem({ friend_dob: '1988-02-29', remind_days_before: 0 })];
    const sentOn: string[] = [];
    for (let t = Date.parse('2027-02-20T06:30:00Z'); t <= Date.parse('2028-03-05T06:30:00Z'); t += 86400000) {
      const before = emails.length;
      await R.runBirthdayReminders(mockClient(S), new Date(t));
      if (emails.length > before) sentOn.push(new Date(t).toISOString().slice(0, 10));
    }
    expect(sentOn).toEqual(['2027-02-28', '2028-02-29']);
    expect(emails[0].subject).toBe("Priya's birthday is today 🎂");
  });

  it('a missed run is caught up the next day (still before the birthday)', async () => {
    S.tables.birthday_reminders = [rem()];
    await R.runBirthdayReminders(mockClient(S), runAt('2027-05-08'));    // 7 May run was missed
    expect(emails).toHaveLength(1);
    expect(emails[0].subject).toBe("Priya's birthday is in 2 days 🎂");
  });

  it('two runs on the same day send once', async () => {
    S.tables.birthday_reminders = [rem()];
    await R.runBirthdayReminders(mockClient(S), runAt('2027-05-07'));
    const s = await R.runBirthdayReminders(mockClient(S), runAt('2027-05-07'));
    expect(emails).toHaveLength(1);
    expect(s.skippedSent).toBe(1);
  });

  it('skips unsubscribed rows and rows with no email', async () => {
    S.tables.birthday_reminders = [rem({ id: 'a', unsubscribed_at: '2027-01-01T00:00:00Z' }), rem({ id: 'b', notify_email: null })];
    await R.runBirthdayReminders(mockClient(S), runAt('2027-05-07'));
    expect(emails).toHaveLength(0);
  });

  it('a failed send is retried the next day', async () => {
    S.tables.birthday_reminders = [rem()];
    resendOk = false;
    await R.runBirthdayReminders(mockClient(S), runAt('2027-05-07'));
    expect(S.tables.birthday_reminders[0].last_notified_year).toBeNull();
    resendOk = true;
    await R.runBirthdayReminders(mockClient(S), runAt('2027-05-08'));
    expect(S.tables.birthday_reminders[0].last_notified_year).toBe(2027);
    expect(emails).toHaveLength(2);
  });

  it('staging suppression (SUPPRESS_OUTBOUND_EMAIL) sends nothing AND does not use up the reminder', async () => {
    process.env.SUPPRESS_OUTBOUND_EMAIL = 'true';
    process.env.EMAIL_ALLOWLIST = 'hello@bornclock.com';
    S.tables.birthday_reminders = [rem()];
    const s = await R.runBirthdayReminders(mockClient(S), runAt('2027-05-07'));
    expect(emails).toHaveLength(0);
    expect(s.suppressed).toBe(1);
    expect(S.tables.birthday_reminders[0].last_notified_year).toBeNull();
  });

  it('allow-listed address is sent on staging', async () => {
    process.env.SUPPRESS_OUTBOUND_EMAIL = 'true';
    process.env.EMAIL_ALLOWLIST = 'hello@bornclock.com';
    S.tables.birthday_reminders = [rem({ notify_email: 'hello@bornclock.com' })];
    await R.runBirthdayReminders(mockClient(S), runAt('2027-05-07'));
    expect(emails).toHaveLength(1);
  });

  it('REMINDERS_LIVE=false is a kill switch', async () => {
    process.env.REMINDERS_LIVE = 'false';
    S.tables.birthday_reminders = [rem()];
    const s = await R.runBirthdayReminders(mockClient(S), runAt('2027-05-07'));
    expect(s.due).toBe(1);
    expect(emails).toHaveLength(0);
  });

  it('friend name is HTML-escaped in the email body', () => {
    const m = R.birthdayReminderEmail('<b>x</b>', null, 2);
    expect(m.html).toContain('&lt;b&gt;x&lt;/b&gt;');
    expect(m.html).not.toContain('<b>x</b>');
  });
});

describe('POST /api/reminders saves the address to email', () => {
  const post = (body: any, token?: string) => new Request('https://x/api/reminders', {
    method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body),
  });
  const base = { friend_name: 'Priya', friend_dob: '1990-05-10', relationship: 'Friend', remind_days_before: 3 };

  it('signed in → account email is stored (a body email is ignored)', async () => {
    addUser(S, 'tok', { id: 'u1', email: 'Owner@Example.com' });
    const res = await api.POST(post({ ...base, email: 'someone-else@example.com' }, 'tok'));
    expect(res.status).toBe(200);
    expect(S.tables.birthday_reminders[0]).toMatchObject({ user_id: 'u1', notify_email: 'owner@example.com', remind_days_before: 3 });
    expect(S.tables.birthday_reminders[0].unsubscribe_token).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('guest needs an email AND the consent tick', async () => {
    expect((await api.POST(post({ ...base }))).status).toBe(400);
    expect((await api.POST(post({ ...base, email: 'guest@example.com' }))).status).toBe(400);
    expect((await api.POST(post({ ...base, email: 'not-an-email', consent: true }))).status).toBe(400);
    const ok = await api.POST(post({ ...base, email: 'Guest@Example.com', consent: true }));
    expect(ok.status).toBe(200);
    expect(S.tables.birthday_reminders).toHaveLength(1);
    expect(S.tables.birthday_reminders[0]).toMatchObject({ user_id: null, notify_email: 'guest@example.com' });
    expect(S.tables.birthday_reminders[0].consent_at).toBeTruthy();
  });

  it('accepts a real 29 Feb (1988) and rejects an impossible one (1990)', async () => {
    expect((await api.POST(post({ ...base, friend_dob: '1988-02-29', email: 'g@example.com', consent: true }))).status).toBe(200);
    expect((await api.POST(post({ ...base, friend_dob: '1990-02-29', email: 'g@example.com', consent: true }))).status).toBe(400);
  });

  it('a saved guest reminder is then sent by the daily job', async () => {
    await api.POST(post({ ...base, email: 'guest@example.com', consent: true }));
    await R.runBirthdayReminders(mockClient(S), runAt('2027-05-07'));
    expect(emails).toHaveLength(1);
    expect(emails[0].to).toEqual(['guest@example.com']);
  });
});

describe('unsubscribe link stops all reminders to that address', () => {
  it('?list=reminders&token=… stamps unsubscribed_at on every reminder to that email; job then skips', async () => {
    S.tables.birthday_reminders = [rem({ id: 'a' }), rem({ id: 'b', unsubscribe_token: '99999999-2222-4333-8444-555555555555', friend_name: 'Ravi' }), rem({ id: 'c', notify_email: 'other@example.com', unsubscribe_token: '88888888-2222-4333-8444-555555555555' })];
    const res = await unsub.GET(new Request(`https://x/api/unsubscribe?list=reminders&token=${TOKEN}`));
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('birthday reminders');
    const by = (id: string) => S.tables.birthday_reminders.find(r => r.id === id);
    expect(by('a').unsubscribed_at).toBeTruthy();
    expect(by('b').unsubscribed_at).toBeTruthy();
    expect(by('c').unsubscribed_at).toBeNull();
    await R.runBirthdayReminders(mockClient(S), runAt('2027-05-07'));
    expect(emails.map(e => e.to[0])).toEqual(['other@example.com']);
  });

  it('a malformed token is a friendly "no longer valid", not an error', async () => {
    const res = await unsub.GET(new Request('https://x/api/unsubscribe?list=reminders&token=abc'));
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('no longer valid');
  });
});
