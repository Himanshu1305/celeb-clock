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
import { planetStations } from '../src/lib/vedic/transits.js';
import { computeSadeSati } from '../src/lib/vedic/sadeSati.js';
import { SIGN_LORDS } from '../src/lib/vedic/whatsAhead.js';
import { PLANETS as PLANET_INFO } from '../src/lib/vedic/planetPlacements.js';
import { getTermDef, glossaryHref } from '../src/lib/vedic/termDefinitions.js';
import { remedyByKey } from '../src/lib/vedic/remedies/catalog.js';

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

// ── Transit alert events (Batch 7 W4) ───────────────────────────────────────────
// Three kinds, all from our own engine (no hand-entered dates):
//   • 'sign-change'      — Saturn / Jupiter / Rahu / Ketu enters a new sign (dueTransitIngresses);
//   • 'sade-sati-start'  — Saturn enters the 12th sign from the subscriber's Moon sign
//                          from the 11th: the start of Sade Sati, or (after a retrograde
//                          loop took Saturn back out) its resumption — told apart with
//                          computeSadeSati so a re-entry is never called a "start";
//   • 'retrograde'       — the subscriber's KEY PLANET turns retrograde. We only store the
//                          Moon sign (email_subscribers.rashi_index), so the key planet is
//                          the lord of the Moon sign (Rashi lord). Karka (Moon) and Simha
//                          (Sun) have no retrograde alert: the Sun and Moon never turn
//                          retrograde.
// Each event fires once: only on the run whose IST date is `leadDays` before the event's
// IST date (same stateless dedupe as K16), and carries a stable `key`.
// Reference checks (Swiss Ephemeris 2.10.03 via the audit venv, Lahiri mean + 24.4″ as the
// engine; see api/__tests__/transitAlerts.test.ts): Saturn → Mesha 3 Jun 2027 06:23 IST;
// Jupiter stations retrograde 13 Dec 2026 and direct 13 Apr 2027 (IST).
export type TransitAlertKind = 'sign-change' | 'sade-sati-start' | 'retrograde';

export interface TransitAlertEvent {
  kind: TransitAlertKind;
  planet: PlanetName;
  /** Stable dedupe key for this exact event. */
  key: string;
  atISO: string;
  istDate: string;
  /** Full IST label (date + time) — used for sign changes, where the minute is meaningful. */
  label: string;
  /** "3 June" style IST date. */
  dateLabel: string;
  /** Sign entered (sign-change, sade-sati-start) or sign the planet stands in (retrograde). */
  signIndex: number;
  /** sade-sati-start only. */
  sadeSati?: { resumes: boolean; pausedSinceISO: string | null; cycleEndISO: string | null };
  /** retrograde only: when it turns direct again (IST date), if within ~7 months. */
  retro?: { directISO: string | null; directLabel: string | null };
}

const RETRO_PLANETS: PlanetName[] = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
const ISTDY = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric' });
const ISTMY = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', month: 'long', year: 'numeric' });
const saturnSignAt = (d: Date) => transitSignIndex('Saturn', d);

/** The subscriber's key planet = lord of their Moon sign; null when it can never be retrograde. */
export function keyPlanetFor(rashiIndex: number): PlanetName | null {
  if (rashiIndex < 0 || rashiIndex > 11) return null;
  const lord = SIGN_LORDS[rashiIndex] as PlanetName;
  return RETRO_PLANETS.includes(lord) ? lord : null;
}

/** Stations retrograde of `planet` whose IST date is exactly `leadDays` after today's IST date. */
export function dueRetrogradeStations(planet: PlanetName, now: Date = new Date(), leadDays = 2): Array<{ atMs: number; directMs: number | null }> {
  if (!RETRO_PLANETS.includes(planet)) return [];
  const targetIst = istDateISO(new Date(now.getTime() + leadDays * DAY_MS));
  const dayStartUtc = Date.parse(targetIst + 'T00:00:00Z') - IST_MS;
  const found = planetStations(planet, new Date(dayStartUtc - DAY_MS), new Date(dayStartUtc + 2 * DAY_MS))
    .filter(s => s.kind === 'retrograde' && istDateISO(new Date(s.atMs)) === targetIst);
  return found.map(s => {
    // Longest retrogrades: Saturn ~140 days, Jupiter ~120 — 210 days always brackets the direct station.
    const direct = planetStations(planet, new Date(s.atMs + DAY_MS), new Date(s.atMs + 210 * DAY_MS)).find(x => x.kind === 'direct');
    return { atMs: s.atMs, directMs: direct ? direct.atMs : null };
  });
}

/** Sky-wide events for one run (computed once per run, shared by every subscriber). */
export interface TransitSky { now: Date; leadDays: number; ingresses: TransitAlertHit[]; retro: Map<PlanetName, Array<{ atMs: number; directMs: number | null }>> }
export function transitSky(now: Date = new Date(), leadDays = 2): TransitSky {
  const retro = new Map<PlanetName, Array<{ atMs: number; directMs: number | null }>>();
  for (const p of RETRO_PLANETS) retro.set(p, dueRetrogradeStations(p, now, leadDays));
  return { now, leadDays, ingresses: dueTransitIngresses(now, leadDays), retro };
}

/** All transit alert events due for one Moon sign on this run. */
export function transitAlertEvents(rashiIndex: number, now: Date = new Date(), leadDays = 2, sky: TransitSky = transitSky(now, leadDays)): TransitAlertEvent[] {
  if (rashiIndex < 0 || rashiIndex > 11) return [];
  const out: TransitAlertEvent[] = [];
  const s12 = (rashiIndex + 11) % 12, s11 = (rashiIndex + 10) % 12;
  for (const h of sky.ingresses) {
    const atMs = Date.parse(h.atISO);
    const signIndex = transitSignIndex(h.planet, new Date(atMs + 3600_000));
    if (h.planet === 'Saturn' && signIndex === s12 && transitSignIndex('Saturn', new Date(atMs - 3600_000)) === s11) {
      // Saturn crosses into the 12th from the Moon: Sade Sati begins — or resumes after a
      // retrograde pause. The engine's cycle start tells the two apart.
      const ss = computeSadeSati(rashiIndex, new Date(atMs + DAY_MS), saturnSignAt);
      const cycle = ss.currentCycle;
      const resumes = !!cycle && Math.abs(Date.parse(cycle.start) - atMs) > 3 * DAY_MS;
      const pause = resumes ? cycle!.pauses.find(p => Math.abs(Date.parse(p.end) - atMs) <= 3 * DAY_MS) : undefined;
      out.push({
        kind: 'sade-sati-start', planet: 'Saturn', key: `sade-sati-start:${rashiIndex}:${h.atISO}`,
        atISO: h.atISO, istDate: h.istDate, label: h.label, dateLabel: h.dateLabel, signIndex,
        sadeSati: { resumes, pausedSinceISO: pause ? pause.start : null, cycleEndISO: cycle ? cycle.end : null },
      });
      continue;
    }
    out.push({ kind: 'sign-change', planet: h.planet, key: `sign-change:${h.planet}:${h.atISO}`, atISO: h.atISO, istDate: h.istDate, label: h.label, dateLabel: h.dateLabel, signIndex });
  }
  const kp = keyPlanetFor(rashiIndex);
  if (kp) {
    for (const st of sky.retro.get(kp) ?? []) {
      const at = new Date(st.atMs);
      out.push({
        kind: 'retrograde', planet: kp, key: `retrograde:${kp}:${istDateISO(at)}`,
        atISO: at.toISOString(), istDate: istDateISO(at), label: `${ISTDY.format(at)} (IST)`, dateLabel: ISTD.format(at),
        signIndex: transitSignIndex(kp, at),
        retro: { directISO: st.directMs ? istDateISO(new Date(st.directMs)) : null, directLabel: st.directMs ? ISTDY.format(new Date(st.directMs)) : null },
      });
    }
  }
  return out;
}

const P_STYLE = 'font-size:14px;color:#374151;line-height:1.7;margin:0 0 8px';
const H_STYLE = 'font-size:15px;color:#0C1A2B;margin:18px 0 6px';
const NOTE_STYLE = 'font-size:13px;color:#5B6B78;line-height:1.6;margin:0 0 8px;background:#FBF6EA;border-radius:8px;padding:8px 10px';
const term = (id: string) => getTermDef(id);
/** "What is X?" plain-language box built from the shared term list (same text as the site's TermTip). */
function termBox(id: string): string {
  const t = term(id);
  if (!t) return '';
  // Drop sentences that only make sense on the site (e.g. "the (R) mark in the table").
  const why = (t.why ?? '').split(/(?<=\.)\s+/).filter(x => !/\btable\b/i.test(x)).join(' ');
  return `<p style="${NOTE_STYLE}"><strong>What is ${t.term}?</strong> ${t.impact}${why ? ` ${why}` : ''} <a href="${BASE_URL}${glossaryHref(id)}" style="color:#103A5C">Learn more</a></p>`;
}
const signName = (i: number) => `${RASHIS[i].sanskrit} (${RASHIS[i].english})`;

function signChangeBlock(e: TransitAlertEvent, rashiIndex: number): string {
  const reading = readPlanetTransit(e.planet, rashiIndex, new Date(Date.parse(e.atISO) + 3600_000));
  const nodeTerm = e.planet === 'Rahu' ? termBox('rahu') : e.planet === 'Ketu' ? termBox('ketu') : '';
  return `<p style="${H_STYLE}">${gradeChip(reading.grade)} &nbsp;<strong>${e.planet}</strong> moves into ${signName(e.signIndex)} on ${e.label}</p>
    <p style="${P_STYLE}">${reading.text}</p>${nodeTerm}`;
}

function sadeSatiBlock(e: TransitAlertEvent, rashiIndex: number): string {
  const ss = e.sadeSati!;
  const remedy = remedyByKey('sadeSati');
  const prayers = (remedy?.free.prayers ?? []).slice(0, 2);
  const lines = prayers.map(p => `<li style="margin:0 0 4px">${p.text.en} <span style="color:#8A9BA8">(${p.source})</span></li>`).join('');
  const endLine = ss.cycleEndISO ? ` By our calculation this Sade Sati runs to around ${ISTMY.format(new Date(ss.cycleEndISO))}, with Saturn moving on to the next sign roughly every 2½ years.` : '';
  const head = ss.resumes
    ? `Your Sade Sati continues: <strong>Saturn</strong> returns to ${signName(e.signIndex)} on ${e.label}`
    : `Your Sade Sati begins: <strong>Saturn</strong> moves into ${signName(e.signIndex)} on ${e.label}`;
  const body = ss.resumes
    ? `${signName(e.signIndex)} is the 12th sign from your Moon sign, ${RASHIS[rashiIndex].sanskrit}. Saturn had stepped back out of it for a few months${ss.pausedSinceISO ? ` (from ${ISTDY.format(new Date(ss.pausedSinceISO))})` : ''} while it appeared to move backwards; now it returns, so the same Sade Sati simply carries on — this is not a new one.${endLine}`
    : `${signName(e.signIndex)} is the 12th sign from your Moon sign, ${RASHIS[rashiIndex].sanskrit}, so this is the start of your Sade Sati — the first of its three roughly 2½-year phases.${endLine}`;
  return `<p style="${H_STYLE}"><strong>${head}</strong></p>
    <p style="${P_STYLE}">${body}</p>
    <p style="${P_STYLE}">${remedy?.meaning.plain.en ?? ''} It is a season to move through steadily, not a verdict: the same transit feels very different from chart to chart.</p>
    ${termBox('sadeSati')}
    ${lines ? `<p style="${P_STYLE}"><strong>Simple, free practices many families follow</strong> (optional — nothing here guarantees a result):</p><ul style="${P_STYLE};padding-left:20px">${lines}</ul>` : ''}
    <p style="${P_STYLE}"><a href="${BASE_URL}/sade-sati" style="color:#103A5C;font-weight:700">See your Sade Sati dates and phases →</a></p>`;
}

function retrogradeBlock(e: TransitAlertEvent, rashiIndex: number): string {
  const info = PLANET_INFO[e.planet.toLowerCase() as keyof typeof PLANET_INFO];
  const until = e.retro?.directLabel ? ` until about ${e.retro.directLabel}, when it turns direct (forward) again` : '';
  return `<p style="${H_STYLE}"><strong>${e.planet}</strong>, the ruler of your Moon sign, turns retrograde on ${e.label}</p>
    <p style="${P_STYLE}">${e.planet} rules ${RASHIS[rashiIndex].sanskrit}, your Moon sign, so we treat it as your key planet. From this date it appears to move backwards through ${signName(e.signIndex)}${until}.</p>
    <p style="${P_STYLE}">In Vedic astrology ${e.planet} stands for ${info?.karaka ?? 'its own themes'}. A retrograde stretch is traditionally read as a time to review, revise and finish things in these areas rather than rush into brand-new starts — a slower, more thoughtful rhythm, not a bad omen.</p>
    ${termBox('retrograde')}`;
}

/** Render one email holding every event due for this subscriber; null when there is none. */
export function renderTransitAlert(rashiIndex: number, name: string, unsubUrl: string, events: TransitAlertEvent[], unsubAllUrl?: string): { subject: string; html: string } | null {
  if (rashiIndex < 0 || rashiIndex > 11 || events.length === 0) return null; // never send an empty alert
  const order: Record<TransitAlertKind, number> = { 'sade-sati-start': 0, retrograde: 1, 'sign-change': 2 };
  const sorted = [...events].sort((a, b) => order[a.kind] - order[b.kind] || a.atISO.localeCompare(b.atISO));
  const blocks = sorted.map(e => e.kind === 'sade-sati-start' ? sadeSatiBlock(e, rashiIndex) : e.kind === 'retrograde' ? retrogradeBlock(e, rashiIndex) : signChangeBlock(e, rashiIndex));
  const changes = sorted.filter(e => e.kind === 'sign-change');
  const first = sorted[0];
  let subject: string;
  if (first.kind === 'sade-sati-start') subject = first.sadeSati!.resumes
    ? `Sade Sati continues for ${RASHIS[rashiIndex].sanskrit} from ${first.dateLabel} — what it means`
    : `Sade Sati begins for ${RASHIS[rashiIndex].sanskrit} on ${first.dateLabel} — a calm guide`;
  else if (first.kind === 'retrograde') subject = `${first.planet}, your Moon-sign ruler, turns retrograde on ${first.dateLabel}`;
  else {
    const planets = changes.map(h => h.planet);
    const names = planets.length > 1 ? `${planets.slice(0, -1).join(', ')} and ${planets[planets.length - 1]}` : planets[0];
    subject = `Transit alert: ${names} ${planets.length > 1 ? 'change' : 'changes'} sign on ${first.dateLabel}`;
  }
  const more = sorted.length - (first.kind === 'sign-change' ? changes.length : 1);
  if (more > 0) subject += ` (+${more} more)`;
  const intro = `Hi ${name || 'there'}, here ${sorted.length > 1 ? 'are the sky changes' : 'is a sky change'} coming up for your Moon sign, ${signName(rashiIndex)}. Your Moon sign is counted as house 1 — the usual way Vedic transits (gochar) are read.`;
  const inner = `
    <div style="font-size:13px;color:#8A9BA8;margin-bottom:8px">${intro}</div>
    ${termBox('gochar')}
    ${blocks.join('')}
    <p style="font-size:12px;color:#8A9BA8;margin:16px 0 0">Times are Indian Standard Time (IST) for the planet's sidereal (Lahiri) position, with Rahu and Ketu as the mean lunar node — the convention Drik Panchang uses. Almanacs can differ by a few minutes (for Saturn, by up to about an hour). A transit read from the Moon sign alone is a general picture; your full birth chart and Dasha refine it.</p>
    <div style="text-align:center;margin-top:18px"><a href="${BASE_URL}/transit" style="display:inline-block;background:#103A5C;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:10px 18px;border-radius:8px">See the full transit picture →</a></div>
    ${unsubAllUrl ? `<p style="font-size:11px;color:#9DB0BF;margin:18px 0 0;text-align:center">Not useful? <a href="${unsubUrl}" style="color:#9DB0BF">Stop transit alerts only</a> · <a href="${unsubAllUrl}" style="color:#9DB0BF">unsubscribe from all BornClock emails</a>.</p>` : ''}`;
  return { subject, html: emailShell(inner, unsubAllUrl ? undefined : unsubUrl) };
}

export function transitAlertEmail(rashiIndex: number, name: string, unsubUrl: string, leadDays = 2, now: Date = new Date(), sky?: TransitSky, unsubAllUrl?: string): { subject: string; html: string } | null {
  if (rashiIndex < 0 || rashiIndex > 11) return null;
  return renderTransitAlert(rashiIndex, name, unsubUrl, transitAlertEvents(rashiIndex, now, leadDays, sky ?? transitSky(now, leadDays)), unsubAllUrl);
}

// ── Family birthday reminder ─────────────────────────────────────────────────────
// Builder + sender live in ./_reminders.ts (T5 fix); re-exported for existing callers.
export { birthdayReminderEmail } from './_reminders.js';

function unsubFor(token: string | null | undefined, list?: 'transit'): string {
  return `${BASE_URL}/api/unsubscribe?token=${encodeURIComponent(token || 'sample-token')}${list ? `&list=${list}` : ''}`;
}

/** Daily opt-in notifications: family reminders, daily horoscope, transit alerts. */
export async function runDailyNotifications(): Promise<Record<string, unknown>> {
  const sb = sbAdmin();
  if (!sb) return { skipped: true, reason: 'SUPABASE not configured' };
  const live = notifyLive();
  const today = new Date();
  const summary: Record<string, unknown> = { live, family: { due: 0, sent: 0 }, horoscope: { due: 0, sent: 0 }, transit: { due: 0, sent: 0, kinds: {} as Record<string, number> } };
  // Sky-wide transit events are computed ONCE per run and shared by every subscriber.
  let sky: TransitSky | null = null;

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
    const tran = summary.transit as { due: number; sent: number; kinds: Record<string, number> };
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
        sky ??= transitSky(today, 2);
        const events = transitAlertEvents(idx, today, 2, sky);
        const mail = renderTransitAlert(idx, '', unsubFor((s as any).unsubscribe_token, 'transit'), events, unsub);
        if (mail) {
          tran.due++;
          for (const e of events) tran.kinds[e.kind] = (tran.kinds[e.kind] ?? 0) + 1;
          // NOTIFY_LIVE gate: with the flag unset (the default) nothing is sent — dry-run counts only.
          if (live && (await sendRawEmail({ to, ...mail, headers: { 'List-Unsubscribe': `<${unsubFor((s as any).unsubscribe_token, 'transit')}>` } }))) tran.sent++;
        }
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
