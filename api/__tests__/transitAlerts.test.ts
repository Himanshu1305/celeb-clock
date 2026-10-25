// Batch 7 W4 — transit alert emails: Saturn/Jupiter/Rahu-Ketu sign change, Sade Sati
// start (and resumption), retrograde of the subscriber's key planet (Moon-sign lord).
//
// DRY-RUN ONLY. Nothing here reaches the network: `fetch` is stubbed, Supabase is the
// in-memory mock, and NOTIFY_LIVE is unset (the production default) except in the one
// gate test that proves the flag is what controls sending (that test also uses the stub).
//
// Reference values — Swiss Ephemeris (pyswisseph 2.10.03) via the audit venv,
// scratchpad/w4/swiss.py, run 25 Oct 2026. Sidereal = tropical − (SIDM_LAHIRI mean
// ayanamsa + 24.4″), the engine's Drik convention (see ayanamsaDrik.test.ts); stations
// from the sign of the geocentric speed (FLG_SPEED):
//   Saturn enters Mesha   2027-06-03 00:53 UTC (06:23 IST)
//   Saturn re-enters Mesha 2028-02-23 14:28 UTC (19:58 IST)
//   Saturn enters Karka   2034-07-13 00:09 UTC (05:39 IST)
//   Jupiter station R 2026-12-13 00:57 UTC · station D 2027-04-13 02:11 UTC
//   Mercury station R 2027-02-09 17:36 UTC (23:06 IST)
//   Mars    station R 2027-01-10 13:00 UTC
//   Saturn  station R 2027-08-09 18:06 UTC
// Rahu → Makara 5 Dec 2026 7:28 pm IST is the Drik Panchang value already pinned in
// ayanamsaDrik.test.ts / cron-dispatch.test.ts.
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { newState, mockClient, type MockState } from './_mockSupabase';

const h = vi.hoisted(() => ({ state: null as any }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => mockClient(h.state) }));

const fetchCalls: Array<{ url: string; body: any }> = [];
vi.stubGlobal('fetch', vi.fn(async (url: string, init?: any) => {
  fetchCalls.push({ url: String(url), body: init?.body ? JSON.parse(init.body) : null });
  return new Response(JSON.stringify({ id: 'stub' }), { status: 200 });
}));

let N: typeof import('../_notify');
let T: typeof import('../../src/lib/vedic/transits');
let E: typeof import('../../src/lib/vedic/engine/vedicEngine');
beforeAll(async () => {
  N = await import('../_notify');
  T = await import('../../src/lib/vedic/transits');
  E = await import('../../src/lib/vedic/engine/vedicEngine');
});

const runAt = (isoDay: string) => new Date(`${isoDay}T06:30:00Z`); // the scheduled 12:00 IST run
const UNSUB = 'https://bornclock.com/api/unsubscribe?token=11111111-2222-4333-8444-555555555555&list=transit';
const UNSUB_ALL = 'https://bornclock.com/api/unsubscribe?token=11111111-2222-4333-8444-555555555555';
const HOUR = 3600_000;

// Test charts from the round-2 panel (scratchpad/round2/CONTEXT.md). Moon sign from our engine.
// P1 Suchit: 1996-08-31 13:04 IST, Lucknow → 07:34 UTC.  P3: 1990-01-15 06:30 IST, New Delhi → 01:00 UTC.
const moonSign = (utc: string) => Math.floor(E.getSiderealLongitude('Moon', new Date(utc)) / 30);

/** Tone + completeness checks shared by every rendered email. */
function expectCalmAndComplete(mail: { subject: string; html: string } | null) {
  expect(mail).not.toBeNull();
  const text = (mail!.subject + ' ' + mail!.html).toLowerCase();
  for (const bad of ['undefined', 'nan', 'null', '[object']) expect(text).not.toContain(bad);
  // Tone rule 7: no fear words, no certainty, no death/disease/accident predictions.
  for (const bad of ['death', 'die ', 'disease', 'accident', 'danger', 'misfortune', 'curse', 'doom', 'beware', 'bad luck', 'guarantee ', 'guaranteed', 'will definitely']) {
    expect(text).not.toContain(bad);
  }
  expect(mail!.html).toContain(UNSUB);       // transit-only unsubscribe
  expect(mail!.html).toContain(UNSUB_ALL);   // unsubscribe from everything
  expect(mail!.html).toContain('What is Gochar (transit)?'); // plain-language explanation of the basis
}

describe('engine event dates vs Swiss Ephemeris', () => {
  it('Saturn → Mesha 2027 and → Karka 2034 ingress instants (within 1 h, same IST date)', () => {
    for (const [run, swissUtc, ist] of [
      ['2027-06-01', '2027-06-03T00:53:00Z', '2027-06-03'],
      ['2028-02-21', '2028-02-23T14:28:00Z', '2028-02-23'],
      ['2034-07-11', '2034-07-13T00:09:00Z', '2034-07-13'],
    ] as const) {
      const hit = N.dueTransitIngresses(runAt(run), 2).find(x => x.planet === 'Saturn')!;
      expect(hit, run).toBeTruthy();
      expect(hit.istDate).toBe(ist);
      expect(Math.abs(Date.parse(hit.atISO) - Date.parse(swissUtc))).toBeLessThanOrEqual(HOUR);
    }
  });

  it('retrograde/direct stations (within 1 h of Swiss Ephemeris)', () => {
    const cases: Array<['Jupiter' | 'Mercury' | 'Mars' | 'Saturn', 'retrograde' | 'direct', string]> = [
      ['Jupiter', 'retrograde', '2026-12-13T00:57:00Z'],
      ['Jupiter', 'direct', '2027-04-13T02:11:00Z'],
      ['Mercury', 'retrograde', '2027-02-09T17:36:00Z'],
      ['Mars', 'retrograde', '2027-01-10T13:00:00Z'],
      ['Saturn', 'retrograde', '2027-08-09T18:06:00Z'],
    ];
    for (const [planet, kind, swiss] of cases) {
      const ref = Date.parse(swiss);
      const st = T.planetStations(planet, new Date(ref - 5 * 86400_000), new Date(ref + 5 * 86400_000)).find(s => s.kind === kind)!;
      expect(st, `${planet} ${kind}`).toBeTruthy();
      expect(Math.abs(st.atMs - ref), `${planet} ${kind}`).toBeLessThanOrEqual(HOUR);
    }
  });
});

describe('key planet = Moon-sign lord', () => {
  it('maps signs to retrograde-capable lords; Karka (Moon) and Simha (Sun) have none', () => {
    expect(N.keyPlanetFor(0)).toBe('Mars');
    expect(N.keyPlanetFor(1)).toBe('Venus');
    expect(N.keyPlanetFor(2)).toBe('Mercury');
    expect(N.keyPlanetFor(3)).toBeNull();
    expect(N.keyPlanetFor(4)).toBeNull();
    expect(N.keyPlanetFor(9)).toBe('Saturn');
    expect(N.keyPlanetFor(11)).toBe('Jupiter');
    expect(N.keyPlanetFor(12)).toBeNull();
  });
});

describe('dry-run: one email of each kind for a test chart', () => {
  it('test-chart Moon signs from the engine: P1 = Meena, P3 = Simha', () => {
    expect(moonSign('1996-08-31T07:34:00Z')).toBe(11);
    expect(moonSign('1990-01-15T01:00:00Z')).toBe(4);
  });

  it('sign change — P1 (Meena): Rahu → Makara and Ketu → Karka, 5 Dec 2026', () => {
    const p1 = moonSign('1996-08-31T07:34:00Z');
    const now = runAt('2026-12-03');
    const ev = N.transitAlertEvents(p1, now, 2);
    expect(ev.map(e => `${e.kind}:${e.planet}`).sort()).toEqual(['sign-change:Ketu', 'sign-change:Rahu']);
    const mail = N.transitAlertEmail(p1, 'Suchit', UNSUB, 2, now, undefined, UNSUB_ALL);
    expectCalmAndComplete(mail);
    expect(mail!.subject).toBe('Transit alert: Rahu and Ketu change sign on 5 December');
    expect(mail!.html).toContain('Makara (Capricorn) on 5 December 2026');
    expect(mail!.html).toMatch(/7:2\d pm IST/); // Drik: 7:28 pm IST
    expect(mail!.html).toContain('What is Rahu?');
    expect(mail!.html).toContain('What is Ketu?');
    expect(mail!.html).toContain('Hi Suchit');
  });

  it('retrograde of the key planet — P1 (Meena → Jupiter) turns retrograde 13 Dec 2026, direct ~13 Apr 2027', () => {
    const p1 = moonSign('1996-08-31T07:34:00Z');
    const now = runAt('2026-12-11');
    const ev = N.transitAlertEvents(p1, now, 2);
    const r = ev.find(e => e.kind === 'retrograde')!;
    expect(r.planet).toBe('Jupiter');
    expect(r.istDate).toBe('2026-12-13');
    expect(r.retro!.directISO).toBe('2027-04-13');
    const mail = N.transitAlertEmail(p1, '', UNSUB, 2, now, undefined, UNSUB_ALL);
    expectCalmAndComplete(mail);
    expect(mail!.subject).toBe('Jupiter, your Moon-sign ruler, turns retrograde on 13 December');
    expect(mail!.html).toContain('until about 13 April 2027');
    expect(mail!.html).toContain('What is Retrograde (R)?');
    expect(mail!.html).toContain('not a bad omen');
    // a Simha-Moon subscriber (Sun-ruled) gets no retrograde alert on the same day
    expect(N.transitAlertEvents(4, now, 2).some(e => e.kind === 'retrograde')).toBe(false);
  });

  it('Sade Sati start — P3 (Simha): Saturn enters Karka on 13 Jul 2034', () => {
    const p3 = moonSign('1990-01-15T01:00:00Z');
    const now = runAt('2034-07-11');
    const ev = N.transitAlertEvents(p3, now, 2);
    const ss = ev.find(e => e.kind === 'sade-sati-start')!;
    expect(ss).toBeTruthy();
    expect(ss.sadeSati!.resumes).toBe(false);
    expect(ev.some(e => e.kind === 'sign-change' && e.planet === 'Saturn')).toBe(false); // not double-reported
    const mail = N.transitAlertEmail(p3, '', UNSUB, 2, now, undefined, UNSUB_ALL);
    expectCalmAndComplete(mail);
    expect(mail!.subject).toBe('Sade Sati begins for Simha on 13 July — a calm guide');
    expect(mail!.html).toContain('Your Sade Sati begins');
    expect(mail!.html).toContain('Karka (Cancer) on 13 July 2034');
    expect(mail!.html).toContain('What is Sade Sati?');
    expect(mail!.html).toContain('Hanuman Chalisa');          // free practice, with its source
    expect(mail!.html).toContain('Goswami Tulsidas');
    expect(mail!.html).toContain('not a verdict');
    expect(mail!.html).not.toMatch(/sapphire|neelam|puja booking|₹/i); // nothing sold
  });

  it('Sade Sati after a retrograde loop is a RESUMPTION, not a new start (Vrishabha Moon, 2027–28)', () => {
    const start = N.transitAlertEvents(1, runAt('2027-06-01'), 2).find(e => e.kind === 'sade-sati-start')!;
    expect(start.sadeSati!.resumes).toBe(false);
    const again = N.transitAlertEvents(1, runAt('2028-02-21'), 2).find(e => e.kind === 'sade-sati-start')!;
    expect(again.sadeSati!.resumes).toBe(true);
    const mail = N.renderTransitAlert(1, '', UNSUB, [again], UNSUB_ALL);
    expectCalmAndComplete(mail);
    expect(mail!.subject).toBe('Sade Sati continues for Vrishabha from 23 February — what it means');
    expect(mail!.html).toContain('this is not a new one');
  });

  it('each event fires on exactly one daily run (no repeats)', () => {
    const keys: string[] = [];
    for (let d = 1; d <= 20; d++) { // 1–20 Dec 2026, P1 (Meena)
      const run = new Date(Date.UTC(2026, 11, d, 6, 30));
      for (const e of N.transitAlertEvents(11, run, 2)) keys.push(e.key);
    }
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.filter(k => k.startsWith('retrograde:Jupiter')).length).toBe(1);
    expect(keys.filter(k => k.startsWith('sign-change:Rahu')).length).toBe(1);
  });

  it('a quiet day produces no email (never an empty alert)', () => {
    expect(N.transitAlertEvents(11, runAt('2026-11-20'), 2)).toEqual([]);
    expect(N.transitAlertEmail(11, '', UNSUB, 2, runAt('2026-11-20'))).toBeNull();
  });
});

describe('dispatch: NOTIFY_LIVE gate (flag OFF = nothing sent)', () => {
  let S: MockState;
  beforeEach(() => {
    S = newState(); h.state = S; fetchCalls.length = 0;
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
    process.env.RESEND_API_KEY = 're_test';
    delete process.env.NOTIFY_LIVE;
    S.tables.email_subscribers = [
      { email: 'p1@example.com', rashi_index: 11, transit_alerts: true, daily_horoscope: false, unsubscribe_token: '11111111-2222-4333-8444-555555555555', unsubscribed_at: null },
      { email: 'gone@example.com', rashi_index: 11, transit_alerts: true, daily_horoscope: false, unsubscribe_token: '22222222-2222-4333-8444-555555555555', unsubscribed_at: '2026-01-01T00:00:00Z' },
      { email: 'off@example.com', rashi_index: 11, transit_alerts: false, daily_horoscope: false, unsubscribe_token: '33333333-2222-4333-8444-555555555555', unsubscribed_at: null },
    ];
    S.tables.birthday_reminders = [];
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(runAt('2026-12-11'));
  });
  afterEach(() => { vi.useRealTimers(); delete process.env.NOTIFY_LIVE; });

  it('flag unset: counts the due alert, sends nothing, makes no fetch at all', async () => {
    const out = await N.runDailyNotifications() as any;
    expect(out.live).toBe(false);
    expect(out.transit.due).toBe(1);          // only the opted-in, still-subscribed row
    expect(out.transit.sent).toBe(0);
    expect(out.transit.kinds).toEqual({ retrograde: 1 });
    expect(fetchCalls).toHaveLength(0);
  });

  it('flag "true" (stubbed fetch, no network): the one due alert goes out with a List-Unsubscribe header', async () => {
    process.env.NOTIFY_LIVE = 'true';
    const out = await N.runDailyNotifications() as any;
    expect(out.transit.sent).toBe(1);
    const resend = fetchCalls.filter(c => c.url.includes('api.resend.com'));
    expect(resend).toHaveLength(1);
    expect(resend[0].body.to).toEqual(['p1@example.com']);
    expect(resend[0].body.headers['List-Unsubscribe']).toBe(`<${UNSUB}>`);
  });
});

describe('transit-only unsubscribe link', () => {
  let S: MockState;
  beforeEach(() => {
    S = newState(); h.state = S;
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
    S.tables.email_subscribers = [{ email: 'p1@example.com', weekly_digest: true, transit_alerts: true, unsubscribe_token: '11111111-2222-4333-8444-555555555555', unsubscribed_at: null }];
  });
  it('switches off transit alerts only, leaving the weekly reading on', async () => {
    const { GET } = await import('../unsubscribe');
    const res = await GET(new Request(UNSUB));
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('any more transit alerts');
    expect(S.tables.email_subscribers[0]).toMatchObject({ transit_alerts: false, weekly_digest: true, unsubscribed_at: null });
  });
});

