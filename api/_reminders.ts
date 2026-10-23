// api/_reminders.ts — birthday reminders saved on /reminders (audit round 2, T5).
//
// What was broken: a reminder was saved WITHOUT an email address, the daily job skipped
// every row with no address, it only matched the exact day (so one missed cron run lost
// the reminder for a year), sends were additionally gated behind NOTIFY_LIVE, and a
// 29 February birthday never matched in a non-leap year.
//
// Now:
//   • the address is stored when the reminder is saved (api/reminders.ts);
//   • the daily job (api/cron-dispatch.ts → runDailyNotifications → runBirthdayReminders)
//     sends each reminder ONCE per birthday year: it is due on any run from
//     `remind_days_before` days ahead up to the birthday itself, and
//     `last_notified_year` (claimed with a compare-and-set before sending) stops a repeat;
//   • 29 Feb birthdays are observed on 28 Feb in non-leap years;
//   • unsubscribed rows are skipped; every email carries a one-click unsubscribe link;
//   • sends go through sendRawEmail, which honours SUPPRESS_OUTBOUND_EMAIL /
//     EMAIL_ALLOWLIST. A suppressed (staging) send does NOT claim the row, because staging
//     shares the production database and must never use up a real user's reminder.
//   • kill switch: REMINDERS_LIVE=false turns real sends off (default: on — the user asked
//     for these emails).
import { sendRawEmail, isOutboundEmailSuppressed } from './_email.js';
import { escapeHtml } from './_userAuth.js';

const BASE_URL = 'https://bornclock.com';
const LOGO_URL = 'https://bornclock.com/bornclock-logo.png';
const DAY_MS = 86400000;
const IST_MS = 5.5 * 3600 * 1000;

/** Calendar date (YYYY-MM-DD) in India for an instant. The job runs at 06:30 UTC (12:00 IST). */
export function istDate(at: Date): string {
  return new Date(at.getTime() + IST_MS).toISOString().slice(0, 10);
}

export const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/** The date a birthday is observed in `year`: 29 Feb → 28 Feb in non-leap years. */
export function birthdayInYear(dob: string, year: number): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob || '');
  if (!m) return null;
  const mm = Number(m[2]);
  let dd = Number(m[3]);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  if (mm === 2 && dd === 29 && !isLeapYear(year)) dd = 28;
  return `${year}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}

const dayDiff = (a: string, b: string) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / DAY_MS);

/**
 * Is a reminder due today? Returns the birthday's observed date, its year and how many
 * days away it is, or null. Due window: [birthday − remindDaysBefore, birthday].
 * The next birthday is this year's, or next year's once this year's has passed (so a
 * 2 Jan birthday with a 7-day lead is due from 26 Dec).
 */
export function dueBirthday(dob: string, remindDaysBefore: number, todayIst: string): { date: string; year: number; daysAway: number } | null {
  const lead = Math.max(0, Math.min(60, Math.floor(Number(remindDaysBefore) || 0)));
  const y = Number(todayIst.slice(0, 4));
  for (const year of [y, y + 1]) {
    const date = birthdayInYear(dob, year);
    if (!date) return null;
    const daysAway = dayDiff(todayIst, date);
    if (daysAway < 0) continue;            // already passed this year → try next year
    return daysAway <= lead ? { date, year, daysAway } : null;
  }
  return null;
}

export function reminderUnsubscribeUrl(token: string): string {
  return `${BASE_URL}/api/unsubscribe?list=reminders&token=${encodeURIComponent(token)}`;
}

export function birthdayReminderEmail(friendName: string, relationship: string | null, daysAway: number, unsubUrl?: string): { subject: string; html: string } {
  const when = daysAway === 0 ? 'today' : daysAway === 1 ? 'tomorrow' : `in ${daysAway} days`;
  const name = escapeHtml(friendName);
  const rel = relationship ? ` (${escapeHtml(relationship)})` : '';
  const inner = `
    <p style="font-size:18px;color:#0C1A2B;margin:0 0 10px">🎂 <strong>${name}</strong>'s birthday is ${when}${rel}.</p>
    <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 14px">A little nudge so it doesn't slip by. Want to make something for them?</p>
    <div style="text-align:center;margin-top:12px"><a href="${BASE_URL}/wish" style="display:inline-block;background:#103A5C;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:10px 18px;border-radius:8px">Make a birthday card →</a></div>`;
  const html = `<!doctype html><html><body style="margin:0;background:#FBF6EA;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto">
    <div style="text-align:center;padding-bottom:20px"><img src="${LOGO_URL}" alt="BornClock" height="44" width="165" style="height:44px;width:165px;display:inline-block;border:0" border="0" /></div>
    <div style="background:#fff;border-radius:12px;padding:28px;border:1px solid #E6D8B8">
      ${inner}
      ${unsubUrl ? `<p style="font-size:11px;color:#9DB0BF;margin-top:22px;text-align:center">You asked BornClock to remind you about this birthday. <a href="${unsubUrl}" style="color:#9DB0BF">Stop birthday reminders to this address</a>.</p>` : ''}
    </div>
    <p style="text-align:center;font-size:12px;color:#9ca3af;font-style:italic;margin:18px 0 0">Know your time. Live it well.</p>
  </div></body></html>`;
  // Subject is plain text (not HTML) — the raw name is fine there.
  return { subject: `${friendName}'s birthday is ${when} 🎂`, html };
}

export interface ReminderRunSummary { due: number; sent: number; skippedSent: number; suppressed: number; failed: number; live: boolean }

/** Find and send today's due birthday reminders. Idempotent per reminder per birthday year. */
export async function runBirthdayReminders(db: any, now: Date = new Date()): Promise<ReminderRunSummary> {
  const live = process.env.REMINDERS_LIVE !== 'false';
  const today = istDate(now);
  const out: ReminderRunSummary = { due: 0, sent: 0, skippedSent: 0, suppressed: 0, failed: 0, live };

  const { data, error } = await db
    .from('birthday_reminders')
    .select('id, friend_name, friend_dob, relationship, remind_days_before, notify_email, unsubscribe_token, unsubscribed_at, last_notified_year')
    .is('unsubscribed_at', null);
  if (error) throw error;

  for (const r of data ?? []) {
    const to = String(r.notify_email || '').trim();
    if (!to || r.unsubscribed_at) continue;
    const due = dueBirthday(String(r.friend_dob || '').slice(0, 10), r.remind_days_before ?? 3, today);
    if (!due) continue;
    out.due++;
    const prev: number | null = r.last_notified_year ?? null;
    if (prev !== null && prev >= due.year) { out.skippedSent++; continue; }
    if (!live) continue;
    // Staging (shared DB): never claim a real user's reminder for a send that is suppressed.
    if (isOutboundEmailSuppressed(to)) { out.suppressed++; continue; }

    // Compare-and-set claim BEFORE sending, so two overlapping runs cannot both send.
    let claim = db.from('birthday_reminders').update({ last_notified_year: due.year }).eq('id', r.id);
    claim = prev === null ? claim.is('last_notified_year', null) : claim.eq('last_notified_year', prev);
    const { data: claimed, error: claimErr } = await claim.select('id');
    if (claimErr || !claimed || claimed.length === 0) { out.skippedSent++; continue; }

    const mail = birthdayReminderEmail(r.friend_name, r.relationship ?? null, due.daysAway,
      r.unsubscribe_token ? reminderUnsubscribeUrl(r.unsubscribe_token) : undefined);
    if (await sendRawEmail({ to, ...mail })) {
      out.sent++;
    } else {
      out.failed++;
      // Release the claim so tomorrow's run retries (still inside the due window).
      await db.from('birthday_reminders').update({ last_notified_year: prev }).eq('id', r.id).eq('last_notified_year', due.year);
    }
  }
  return out;
}
