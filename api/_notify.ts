// api/_notify.ts — opt-in notification dispatch, driven by the external scheduler
// (see api/cron-dispatch.ts + .github/workflows/scheduled-tasks.yml).
//
// Three opt-in daily categories + the weekly digest batch. All content is computed
// from the real engine (no fabrication): daily horoscope via computeRashifal, transit
// alerts via findIngress, family birthday reminders from the user's own saved list.
//
// SAFETY (Rule 11 — emails only to opt-in users; DB writes test-only): real sends are
// gated behind NOTIFY_LIVE / DIGEST_LIVE. With the flags unset the jobs run in DRY-RUN
// and return exactly who WOULD be mailed, sending nothing. Staging additionally routes
// every send through isOutboundEmailSuppressed() (allowlist only). This lets the whole
// pipeline be tested end-to-end without mailing anyone.
//
// Schema this relies on (new columns are documented for the person in
// supabase/migrations/NOTES-notifications.sql — nothing is applied automatically):
//   email_subscribers: daily_horoscope bool, transit_alerts bool, rashi_index int
//   birthday_reminders: (existing) + last_notified_year, unsubscribe_token, unsubscribed_at
//   (supabase/migrations/20261024120000_reminders_and_credit_note_email.sql)
import { createClient } from '@supabase/supabase-js';
import { sendRawEmail } from './_email.js';
import { runBirthdayReminders } from './_reminders.js';
import { digestHtml, celebsThisWeek } from './weekly-digest.js';
import { computeRashifal, signSegments, istDateISO, transitSignIndex, readPlanetTransit, RASHIS, type PlanetName } from '../src/lib/vedic/rashifal.js';

const BASE_URL = 'https://bornclock.com';
const LOGO_URL = 'https://bornclock.com/bornclock-logo.png';
const SLOW_PLANETS: PlanetName[] = ['Jupiter', 'Saturn', 'Rahu', 'Ketu'];

const notifyLive = () => process.env.NOTIFY_LIVE === 'true';
const digestLive = () => process.env.DIGEST_LIVE === 'true';

function sbAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}


function gradeChip(grade: string): string {
  const color = grade === 'strong' ? '#B8862F' : grade === 'moderate' ? '#103A5C' : '#8A9BA8';
  return `<span style="display:inline-block;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:${color}">${grade}</span>`;
}

function emailShell(inner: string, unsubUrl?: string): string {
  return `<!doctype html><html><body style="margin:0;background:#FBF6EA;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto">
    <div style="text-align:center;padding-bottom:20px"><img src="${LOGO_URL}" alt="BornClock" height="44" width="165" style="height:44px;width:165px;display:inline-block;border:0" border="0" /></div>
    <div style="background:#fff;border-radius:12px;padding:28px;border:1px solid #E6D8B8">
      ${inner}
      ${unsubUrl ? `<p style="font-size:11px;color:#9DB0BF;margin-top:22px;text-align:center">You asked BornClock to send you this. <a href="${unsubUrl}" style="color:#9DB0BF">Unsubscribe</a>.</p>` : ''}
    </div>
    <p style="text-align:center;font-size:12px;color:#9ca3af;font-style:italic;margin:18px 0 0">Know your time. Live it well.</p>
  </div></body></html>`;
}

// ── Daily horoscope ────────────────────────────────────────────────────────────
export function dailyHoroscopeEmail(rashiIndex: number, name: string, unsubUrl: string): { subject: string; html: string } | null {
  if (rashiIndex < 0 || rashiIndex > 11) return null;
  const r = computeRashifal(rashiIndex, 'today', new Date());
  const overview = r.sections.find((s) => s.key === 'overview') || r.sections[0];
  const inner = `
    <div style="font-size:13px;color:#8A9BA8;margin-bottom:12px">Hi ${name || 'there'}, today's reading for <strong>${r.rashi.sanskrit}</strong> (${r.rashi.english})</div>
    <p style="font-size:15px;color:#0C1A2B;margin:0 0 6px">${gradeChip(r.overallGrade)} &nbsp;Overall: ${r.overallTone}</p>
    <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 14px">${overview?.text || ''}</p>
    <div style="text-align:center;margin-top:18px"><a href="${BASE_URL}/rashifal/${r.rashi.slug}/today" style="display:inline-block;background:#103A5C;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:10px 18px;border-radius:8px">Read the full daily reading →</a></div>`;
  return { subject: `${r.rashi.sanskrit} today — ${r.overallTone} (${r.overallGrade})`, html: emailShell(inner, unsubUrl) };
}

// ── Transit alert (real ingress detection) ──────────────────────────────────────
// K16 (audit round 2): the old version alerted on any ingress within the next 3 days,
// so the daily job mailed the SAME event 4 days running; it also read the sign at noon
// on the change day and printed a date-only label. Now:
//   • each ingress is alerted exactly once — only on the run whose IST calendar date is
//     `leadDays` before the ingress's IST date (stateless per-event dedupe; a manual
//     re-run on the same day is the only way to repeat it);
//   • the date and time come from the engine's exact ingress instant (signSegments,
//     refined to the second) and are labelled in IST, the convention of Indian almanacs;
//     since the Oct 2026 ayanamsa fix these match Drik Panchang within minutes
//     (Rahu → Makara 2026: 5 Dec 7:28 pm IST, as Drik lists).
//   • the reading is taken just after the ingress, i.e. for the NEW sign.
const DAY_MS = 86400000;
const IST_MS = 5.5 * 3600 * 1000;
const ISTD = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long' });
const ISTF = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

/** Refine an engine ingress (signSegments is ~1 hour) to the second, then label it with
 * the clock minute in which it happens (how Drik Panchang prints ingress times). */
function exactIngressMs(planet: PlanetName, approxMs: number): number {
  const before = transitSignIndex(planet, new Date(approxMs - 2 * 3600_000));
  let a = approxMs - 2 * 3600_000, b = approxMs + 3600_000;
  if (transitSignIndex(planet, new Date(b)) === before) return approxMs; // safety: no change bracketed
  while (b - a > 1_000) {
    const mid = (a + b) / 2;
    if (transitSignIndex(planet, new Date(mid)) === before) a = mid; else b = mid;
  }
  return Math.floor(b / 60_000) * 60_000;
}

export interface TransitAlertHit { planet: PlanetName; atISO: string; istDate: string; label: string; dateLabel: string }

/** Ingresses of slow planets whose IST date is exactly `leadDays` after today's IST date. */
export function dueTransitIngresses(now: Date = new Date(), leadDays = 2): TransitAlertHit[] {
  const targetIst = istDateISO(new Date(now.getTime() + leadDays * DAY_MS));
  // Search the whole IST target day (plus margin) for real sign changes.
  const dayStartUtc = Date.parse(targetIst + 'T00:00:00Z') - IST_MS;
  const from = new Date(Math.max(now.getTime(), dayStartUtc - DAY_MS));
  const to = new Date(dayStartUtc + 2 * DAY_MS);
  const hits: TransitAlertHit[] = [];
  for (const planet of SLOW_PLANETS) {
    for (const seg of signSegments(planet, from, to).slice(1)) {
      const at = new Date(exactIngressMs(planet, seg.startMs));
      if (istDateISO(at) !== targetIst) continue;
      hits.push({ planet, atISO: at.toISOString(), istDate: targetIst, label: `${ISTF.format(at)} IST`, dateLabel: ISTD.format(at) });
    }
  }
  return hits;
}

export function transitAlertEmail(rashiIndex: number, name: string, unsubUrl: string, leadDays = 2, now: Date = new Date()): { subject: string; html: string } | null {
  if (rashiIndex < 0 || rashiIndex > 11) return null;
  const due = dueTransitIngresses(now, leadDays);
  if (due.length === 0) return null; // nothing real to report — never send an empty alert
  const hits = due.map(h => {
    const reading = readPlanetTransit(h.planet, rashiIndex, new Date(Date.parse(h.atISO) + 3600_000));
    return `<p style="font-size:15px;color:#0C1A2B;margin:14px 0 4px">${gradeChip(reading.grade)} &nbsp;<strong>${h.planet}</strong> changes sign on ${h.label}</p><p style="font-size:14px;color:#374151;line-height:1.7;margin:0">${reading.text}</p>`;
  });
  const planets = due.map(h => h.planet);
  const names = planets.length > 1 ? `${planets.slice(0, -1).join(', ')} and ${planets[planets.length - 1]}` : planets[0];
  const inner = `
    <div style="font-size:13px;color:#8A9BA8;margin-bottom:8px">Hi ${name || 'there'}, a slow-planet transit is shifting relative to your Moon sign (${RASHIS[rashiIndex].sanskrit}).</div>
    ${hits.join('')}
    <p style="font-size:12px;color:#8A9BA8;margin:12px 0 0">Times are Indian Standard Time (IST) for the planet's sidereal (Lahiri) position, with Rahu and Ketu as the mean lunar node — the convention Drik Panchang uses. Almanacs can differ by a few minutes (for Saturn, by up to about an hour).</p>
    <div style="text-align:center;margin-top:18px"><a href="${BASE_URL}/transit" style="display:inline-block;background:#103A5C;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:10px 18px;border-radius:8px">See the full transit picture →</a></div>`;
  return { subject: `Transit alert: ${names} ${planets.length > 1 ? 'change' : 'changes'} sign on ${due[0].dateLabel}`, html: emailShell(inner, unsubUrl) };
}

// ── Family birthday reminder ─────────────────────────────────────────────────────
// Builder + sender live in ./_reminders.ts (T5 fix); re-exported for existing callers.
export { birthdayReminderEmail } from './_reminders.js';

function unsubFor(token: string | null | undefined): string {
  return `${BASE_URL}/api/unsubscribe?token=${encodeURIComponent(token || 'sample-token')}`;
}

/** Daily opt-in notifications: family reminders, daily horoscope, transit alerts. */
export async function runDailyNotifications(): Promise<Record<string, unknown>> {
  const sb = sbAdmin();
  if (!sb) return { skipped: true, reason: 'SUPABASE not configured' };
  const live = notifyLive();
  const today = new Date();
  const summary: Record<string, unknown> = { live, family: { due: 0, sent: 0 }, horoscope: { due: 0, sent: 0 }, transit: { due: 0, sent: 0 } };

  // 1) Family birthday reminders saved on /reminders. The user asked for these, so they
  //    are NOT gated by NOTIFY_LIVE (that gate is for the marketing-style channels below);
  //    see api/_reminders.ts for the once-per-year / 29 Feb / unsubscribe rules.
  try {
    summary.family = await runBirthdayReminders(sb, today);
  } catch (e) {
    (summary as any).familyError = String(e);
  }

  // 2) Daily horoscope + 3) transit alerts — opted-in subscribers with a known Moon sign.
  try {
    const { data: subs } = await sb
      .from('email_subscribers')
      .select('email, dob, rashi_index, daily_horoscope, transit_alerts, unsubscribe_token, unsubscribed_at');
    const horo = summary.horoscope as { due: number; sent: number };
    const tran = summary.transit as { due: number; sent: number };
    for (const s of subs ?? []) {
      if ((s as any).unsubscribed_at) continue;
      const idx = (s as any).rashi_index;
      const to = (s as any).email;
      const unsub = unsubFor((s as any).unsubscribe_token);
      if (typeof idx !== 'number' || idx < 0 || idx > 11 || !to) continue;
      if ((s as any).daily_horoscope) {
        const mail = dailyHoroscopeEmail(idx, '', unsub);
        if (mail) { horo.due++; if (live && (await sendRawEmail({ to, ...mail }))) horo.sent++; }
      }
      if ((s as any).transit_alerts) {
        const mail = transitAlertEmail(idx, '', unsub);
        if (mail) { tran.due++; if (live && (await sendRawEmail({ to, ...mail }))) tran.sent++; }
      }
    }
  } catch (e) {
    (summary as any).subscriberError = String(e);
  }

  return summary;
}

/** Weekly digest batch — pages opted-in subscribers and sends each a personalised digest. */
export async function runWeeklyDigestBatch(maxPerRun = 200): Promise<Record<string, unknown>> {
  const sb = sbAdmin();
  if (!sb) return { skipped: true, reason: 'SUPABASE not configured' };
  const live = digestLive();
  const today = new Date();
  let global: any[] = [], india: any[] = [];
  try { const r = await celebsThisWeek(sb, today); global = r.global; india = r.india; } catch { /* non-fatal */ }

  const { data: subs } = await sb
    .from('email_subscribers')
    .select('email, dob, unsubscribe_token, unsubscribed_at, weekly_digest')
    .eq('weekly_digest', true)
    .is('unsubscribed_at', null)
    .limit(maxPerRun);

  const summary = { live, due: (subs ?? []).length, sent: 0, failed: 0 } as Record<string, number | boolean>;
  for (const s of subs ?? []) {
    const to = (s as any).email;
    if (!to) continue;
    const dobStr = (s as any).dob;
    const dob = dobStr && /^\d{4}-\d{2}-\d{2}$/.test(dobStr) ? new Date(dobStr + 'T12:00:00') : null;
    const unsubUrl = unsubFor((s as any).unsubscribe_token);
    const { subject, html } = digestHtml({ name: '', dob, today, global, india, unsubUrl });
    if (!live) continue; // dry-run: count due only
    if (await sendRawEmail({ to, subject, html })) (summary.sent as number)++;
    else (summary.failed as number)++;
  }
  return summary;
}
