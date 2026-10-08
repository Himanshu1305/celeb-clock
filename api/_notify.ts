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
//   birthday_reminders: (existing) + optional last_notified_year int
import { createClient } from '@supabase/supabase-js';
import { sendRawEmail } from './_email.js';
import { digestHtml, celebsThisWeek } from './weekly-digest.js';
import { computeRashifal, findIngress, readPlanetTransit, RASHIS, type PlanetName } from '../src/lib/vedic/rashifal.js';

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

const MMDD = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

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
export function transitAlertEmail(rashiIndex: number, name: string, unsubUrl: string, horizonDays = 3): { subject: string; html: string } | null {
  if (rashiIndex < 0 || rashiIndex > 11) return null;
  const now = new Date();
  const end = new Date(now.getTime() + horizonDays * 86400000);
  const hits: string[] = [];
  let planetLabel = '';
  for (const planet of SLOW_PLANETS) {
    const ingress = findIngress(planet, now, end);
    if (!ingress) continue;
    const reading = readPlanetTransit(planet, rashiIndex, new Date(ingress.dateISO + 'T12:00:00'));
    planetLabel = planet;
    const dateLabel = new Date(ingress.dateISO + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
    hits.push(`<p style="font-size:15px;color:#0C1A2B;margin:14px 0 4px">${gradeChip(reading.grade)} &nbsp;<strong>${planet}</strong> changes sign on ${dateLabel}</p><p style="font-size:14px;color:#374151;line-height:1.7;margin:0">${reading.text}</p>`);
  }
  if (hits.length === 0) return null; // nothing real to report — never send an empty alert
  const inner = `
    <div style="font-size:13px;color:#8A9BA8;margin-bottom:8px">Hi ${name || 'there'}, a slow-planet transit is shifting relative to your Moon sign (${RASHIS[rashiIndex].sanskrit}).</div>
    ${hits.join('')}
    <div style="text-align:center;margin-top:18px"><a href="${BASE_URL}/transit" style="display:inline-block;background:#103A5C;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:10px 18px;border-radius:8px">See the full transit picture →</a></div>`;
  return { subject: `Transit alert: ${planetLabel} is changing sign`, html: emailShell(inner, unsubUrl) };
}

// ── Family birthday reminder ─────────────────────────────────────────────────────
export function birthdayReminderEmail(friendName: string, relationship: string | null, daysAway: number, unsubUrl?: string): { subject: string; html: string } {
  const when = daysAway === 0 ? 'today' : daysAway === 1 ? 'tomorrow' : `in ${daysAway} days`;
  const rel = relationship ? ` (${relationship})` : '';
  const inner = `
    <p style="font-size:18px;color:#0C1A2B;margin:0 0 10px">🎂 <strong>${friendName}</strong>'s birthday is ${when}${rel}.</p>
    <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 14px">A little nudge so it doesn't slip by. Want to make something for them?</p>
    <div style="text-align:center;margin-top:12px"><a href="${BASE_URL}/wish" style="display:inline-block;background:#103A5C;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:10px 18px;border-radius:8px">Make a birthday card →</a></div>`;
  return { subject: `${friendName}'s birthday is ${when} 🎂`, html: emailShell(inner, unsubUrl) };
}

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

  // 1) Family birthday reminders — fire when a saved birthday is exactly
  //    remind_days_before away (so each reminder fires once per year).
  try {
    const { data: reminders } = await sb
      .from('birthday_reminders')
      .select('friend_name, friend_dob, relationship, remind_days_before, notify_email');
    const fam = summary.family as { due: number; sent: number };
    for (const rem of reminders ?? []) {
      const days = Math.max(0, Number((rem as any).remind_days_before ?? 3));
      const target = new Date(today.getTime() + days * 86400000);
      const dob = (rem as any).friend_dob ? new Date((rem as any).friend_dob + 'T12:00:00') : null;
      if (!dob) continue;
      if (MMDD(dob) !== MMDD(target)) continue;
      fam.due++;
      const to = (rem as any).notify_email;
      if (!to) continue;
      const mail = birthdayReminderEmail((rem as any).friend_name, (rem as any).relationship ?? null, days);
      if (live) { if (await sendRawEmail({ to, ...mail })) fam.sent++; }
    }
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
