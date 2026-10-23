// AI astrologer chat endpoint (Part F). Multi-turn, grounded in the user's
// computed birth chart (Part B engine), wrapped in defense-in-depth guardrails.
// Stateless + zero-retention: conversation history is passed in per request and
// never stored server-side (matches api/longevity-coach.ts).
//
// ORDER MATTERS: the crisis pre-scan runs BEFORE the rate limit and BEFORE any
// model call, so a person in distress always receives support — even if they've
// hit their daily question cap. The crisis guardrail overrides everything.

import { calculateBirthChart } from '../src/lib/vedic/calculateBirthChart.js';
import { extractReadingFacts } from '../src/lib/vedic/readingPrompts.js';
import { ageInYears } from '../src/lib/vedic/yogaTiming.js';
import { gemstoneChatContext } from '../src/lib/vedic/gemstones.js';
import {
  detectCrisis, crisisMatches, CRISIS_RESPONSE,
  detectHealthSymptom, HEALTH_REDIRECT_RESPONSE,
  buildChatSystemPrompt, scanChatResponse, UNSAFE_REPLY_FALLBACK,
  detectTimingQuestion, classifyTimingCategory, deterministicTimingReply,
  resolveMarriageContext, verifyMarriageGuardrail, detectQuestionTense, disallowedExactDays,
} from '../src/lib/vedic/chatGuardrails.js';
import { rephraseHarmfulPredictions } from '../src/lib/vedic/harmfulPredictions.js';
import { buildNowContext, type NowContext } from '../src/lib/vedic/chatNowContext.js';
import { formatMonthYear } from '../src/lib/vedic/yogaTiming.js';
import { verifyTimingClaims, verifyYogaClaims } from '../src/lib/vedic/readingSpecificity.js';
import { limitReachedMessage } from '../src/lib/vedic/rateLimit.js';
import { hashClientId, peekLimit, recordQuestionServer } from '../src/lib/vedic/serverRateLimit.js';
import { verifyAdminRequest } from './_adminAuth.js';
import { getAuthedUser, userIsPremium, serviceClient } from './_userAuth.js';
import { resolveRequestBirthTz } from './_birthParams.js';

const GEMINI_MODEL = 'gemini-flash-latest';
const MAX_MESSAGE = 1000;
const MAX_HISTORY = 12; // recent turns kept for context

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

async function callGemini(systemPrompt, contents) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      // gemini-flash-latest ignores thinkingBudget:0 and still spends ~700 hidden
      // "thinking" tokens, so the cap must cover thinking + a full answer or the
      // reply truncates mid-sentence. 1400 leaves comfortable headroom.
      generationConfig: { maxOutputTokens: 1400, temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  if (data?.promptFeedback?.blockReason) throw new Error(`blocked: ${data.promptFeedback.blockReason}`);
  const text = (data?.candidates?.[0]?.content?.parts ?? []).map(p => p?.text).filter(Boolean).join('') || '';
  if (!text.trim()) throw new Error('empty');
  return text.trim();
}

// Exposed for testing: given facts + history + message, produce the reply
// payload. `generate` is injected so tests can supply a fake model.
export async function buildChatReply(facts, history, message, generate, gemstone?, now?: NowContext) {
  // Part AC (Part S.2 + S.3): for a marriage-timing question, resolve tense +
  // marital-status context so the prompt (and the deterministic fallback) filter
  // windows by tense and honour the already-married guardrail.
  const isMarriage = detectTimingQuestion(message) && classifyTimingCategory(message) === 'marriage';
  const marriageCtx = isMarriage ? resolveMarriageContext(message) : undefined;
  // Marital status from the profile: a married user is treated exactly like one whose
  // phrasing implies marriage (past windows only, never a "next marriage" window).
  if (marriageCtx && now?.maritalStatus === 'married') marriageCtx.alreadyMarried = true;
  // Audit K6: a past-tense question may cite ANY adult-era past window.
  const pastQuestion = detectQuestionTense(message) === 'past';
  const systemPrompt = buildChatSystemPrompt(facts, gemstone, marriageCtx, { now, pastQuestion });
  const contents = [
    ...history.slice(-MAX_HISTORY).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(m.text || '').slice(0, MAX_MESSAGE) }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];
  const grounding = [
    `Rashi:${facts.rashi}`,
    `Nakshatra:${facts.nakshatra.name}(pada ${facts.nakshatra.pada})`,
    `Lagna:${facts.lagna}`,
    facts.dasha ? `Dasha:${facts.dasha.maha}/${facts.dasha.antar}` : null,
    // Part X: the chat MAY answer a direct Pratyantardasha question accurately (it's now
    // computed). It stays out of the main reading narrative, but the chat is grounded
    // with it so it gives a correct answer if asked rather than a broken/invented one.
    facts.pratyantardasha ? `Pratyantardasha(3rd level):${facts.pratyantardasha.lord}` : null,
    `Mangal:${facts.doshas.mangal.present ? facts.doshas.mangal.severityLabel : 'none'}`,
    `KaalSarp:${facts.doshas.kaalSarp.present ? 'present' : 'none'}`,
    `SadeSati:${facts.doshas.sadeSati.active ? 'active' : 'none'}`,
  ].filter(Boolean);

  // Timing questions ("when will I get rich/a job/married") now cite REAL dates,
  // so they get a dedicated date-accuracy guard (Part D-Fix3) with the same
  // zero-tolerance + retry discipline as the Part F safety guardrails: a date
  // that isn't a real computed window is never shown — retry once, then fall
  // back to a deterministic, guaranteed-correct answer built from the windows.
  const isTiming = detectTimingQuestion(message);
  // Months the reply may cite: the computed windows + today / transit sign changes (K7)
  // + — for a past-tense question — every adult-era past window (K6).
  const pastMonths = pastQuestion
    ? (facts.timing?.categories || []).flatMap(c => (c.allPast || []).flatMap(w => [formatMonthYear(w.start), formatMonthYear(w.end)]))
    : [];
  const validMonths = [...new Set([...(facts.timing?.validMonths || []), ...(now?.validMonths || []), ...pastMonths])];
  // Exact days the reply may repeat: today's date and anything the user typed.
  const allowedDayTexts = [now?.todayLabel || '', message, ...history.filter(m => m.role === 'user').map(m => String(m.text || ''))];
  // Yoga-citation guard (Part J): the reply must never assert a Yoga the chart
  // doesn't have. Runs on EVERY reply (cheap), same zero-tolerance/retry discipline.
  const presentYogaNames = (facts.yogas || []).map((y: any) => y.name);
  const hasYogakaraka = (facts.yogas || []).some((y: any) => /yogakaraka/i.test(y.note || ''));
  const SAFETY_FIX = 'Reminder: your previous reply used a forbidden word. Do NOT use "will", "must", "definitely", "guaranteed", "invest", "buy", or "sell" anywhere — rephrase as "tends to", "often", "may", "put time/care into". Never name assets or give a financial instruction.';
  const DATE_FIX = 'Reminder: your previous reply stated a date that is NOT in the COMPUTED TIMING WINDOWS list. Re-answer using ONLY the exact planet periods and date ranges from that list — never invent, round, or shift a date.';
  const YOGA_FIX = 'Reminder: your previous reply named a Yoga that is NOT in the DETECTED YOGAS list for this chart. Only cite Yogas from that list (with their exact grade); if the user asked about one that is not present, say plainly they do not have it — do not invent one.';
  const EXACT_DAY_FIX = 'Reminder: your previous reply gave an exact calendar day. Astrology timing here is only a month-year RANGE from the computed Dasha windows — never a single day. Re-answer with the window only.';
  const MARRIAGE_FIX = 'Reminder: this person is already married and/or asked about the PAST. Do NOT mention any future/upcoming relationship window and do NOT bring up a second/further marriage. Answer ONLY about periods that have already ended.';

  try {
    let lastFlags: string[] = [], lastBadDates: string[] = [], lastBadYogas: string[] = [], lastBadMarriage: string[] = [], lastExactDays: string[] = [];
    const rephrasedAll: string[] = [];
    for (let attempt = 1; attempt <= 3; attempt++) {
      const corrections: string[] = [];
      if (attempt > 1) {
        if (lastFlags.length) corrections.push(SAFETY_FIX);
        if (lastBadDates.length) corrections.push(DATE_FIX);
        if (lastBadYogas.length) corrections.push(YOGA_FIX);
        if (lastBadMarriage.length) corrections.push(MARRIAGE_FIX);
        if (lastExactDays.length) corrections.push(EXACT_DAY_FIX);
      }
      const turns = corrections.length ? [...contents, { role: 'user', parts: [{ text: corrections.join(' ') }] }] : contents;
      const generated = await generate(systemPrompt, turns);
      // Audit K8 (founder decision): death / accident / serious-illness / child-harm /
      // marriage-certainty statements are REPHRASED into caring, practical caution in
      // the same language (timing window kept) — not blocked, not silently dropped.
      const re = rephraseHarmfulPredictions(generated);
      const raw = re.text;
      for (const f of re.rephrased) rephrasedAll.push(f.domain);

      // Safety scan (never banned language) + date-accuracy + Yoga-citation accuracy +
      // the Part S.3 marriage guardrail — all under the SAME retry discipline, so nothing
      // unverified reaches the user.
      const flags = scanChatResponse(raw);
      const badDates = (isTiming && validMonths.length) ? verifyTimingClaims(raw, validMonths).wrong.map(w => w.claimed) : [];
      const badYogas = verifyYogaClaims(raw, presentYogaNames, hasYogakaraka).wrong.map(w => w.token);
      const badMarriage = verifyMarriageGuardrail(raw, marriageCtx, facts.timing);
      const exactDays = disallowedExactDays(raw, allowedDayTexts);
      if (!flags.length && !badDates.length && !badYogas.length && !badMarriage.length && !exactDays.length) {
        return { reply: raw, crisis: false, degraded: false, sanitized: false, ...(isTiming ? { timingChecked: true } : {}), yogaChecked: true, ...(marriageCtx ? { marriageChecked: true } : {}), ...(rephrasedAll.length ? { rephrased: [...new Set(rephrasedAll)] } : {}), grounding };
      }
      lastFlags = flags; lastBadDates = badDates; lastBadYogas = badYogas; lastBadMarriage = badMarriage; lastExactDays = exactDays;
    }

    // Exhausted retries. For a timing question, fall back to a deterministic,
    // guaranteed-correct-and-safe answer built straight from the computed windows
    // (so the user still gets their real dates). Otherwise, the safe fallback.
    if (isTiming && !lastBadYogas.length) {
      const safe = deterministicTimingReply(facts.timing, classifyTimingCategory(message), marriageCtx);
      if (safe) return { reply: safe, crisis: false, degraded: false, sanitized: false, timingCorrected: true, grounding };
    }
    return { reply: UNSAFE_REPLY_FALLBACK, crisis: false, degraded: false, sanitized: true, redFlags: [...lastFlags, ...lastBadDates.map(d => `bad-date:${d}`), ...lastExactDays.map(d => `exact-day:${d}`), ...lastBadYogas.map(y => `bad-yoga:${y}`), ...lastBadMarriage.map(m => `bad-marriage:${m}`)], grounding };
  } catch (e) {
    return {
      reply: "I'm having a little trouble reaching your chart right now — please try again in a moment. If it keeps happening, your full reading on the Kundali page is always available.",
      crisis: false, degraded: true, degradedReason: String(e?.message || e), grounding,
    };
  }
}

async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }

  // `questionCount` may still be sent by older clients; it is intentionally
  // IGNORED now — the server keeps its own authoritative count (P5-3).
  const { birth, messages, message, tier: rawTier, userTimeZone, maritalStatus } = body ?? {};

  // TIER RESOLUTION (Part N). Admin is checked FIRST and short-circuits the
  // free/paid logic entirely. Crucially, the tier is re-derived SERVER-SIDE from a
  // verified Supabase JWT — the client's `rawTier` is NEVER trusted to claim admin.
  // A verified admin gets `tier:'admin'` (unlimited); everyone else keeps free/paid.
  // The 'paid' tier is ALSO derived server-side (audit item 9): the caller's
  // verified token → their profile → premium. A body `tier:'paid'` is ignored.
  const admin = await verifyAdminRequest(request);
  void rawTier; // client claim — never trusted
  let paid = false;
  if (!admin.isAdmin) {
    const caller = await getAuthedUser(request);
    if (caller) paid = await userIsPremium(serviceClient(), caller.id);
  }
  const tier = admin.isAdmin ? 'admin' : (paid ? 'paid' : 'free');
  if (admin.isAdmin) console.log('[vedic-chat] admin/testing bypass — excluded from usage analytics:', admin.email);

  const text = typeof message === 'string' ? message.trim().slice(0, MAX_MESSAGE) : '';

  if (!text) return json({ error: 'empty-message', reply: 'Please type a question and I’ll look at your chart.' }, 400);

  // 1) CRISIS PRE-SCAN — before rate limit, before any model call. Overrides all.
  if (detectCrisis(text)) {
    return json({ reply: CRISIS_RESPONSE, crisis: true, degraded: false, sanitized: false, grounding: [], _matched: crisisMatches(text).length });
  }

  // 1b) HEALTH-SYMPTOM PRE-SCAN — a described symptom gets a warm medical redirect
  // directly, never an astrological read. Also bypasses the rate limit.
  if (detectHealthSymptom(text)) {
    return json({ reply: HEALTH_REDIRECT_RESPONSE, healthRedirect: true, crisis: false, degraded: false, sanitized: false, grounding: [] });
  }

  // 2) No saved chart → don't guess; tell the client to collect birth details.
  if (!birth || ![birth.y, birth.m, birth.d].every(v => Number.isFinite(Number(v)))) {
    return json({ error: 'no-profile', reply: 'To answer from your real chart, I need your birth details first. Add them on the Kundali page and come back — I’ll remember them here.' }, 400);
  }

  // 3) Rate limit — SERVER-AUTHORITATIVE (P5-3). The server keeps its own daily
  // count keyed by a hashed client IP; the client's `questionCount` is no longer
  // trusted (it's ignored). A verified admin has tier 'admin' (unlimited) and is
  // never rate-limited. We PEEK here (reject if already at the cap) and only
  // RECORD after an answer is actually delivered — so a model/degraded error
  // never eats the visitor's quota (matching the previous client behaviour,
  // only now enforced on the server where it can't be bypassed).
  const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || 'unknown';
  const limitKey = admin.isAdmin ? '' : await hashClientId(clientIp, process.env.RATE_LIMIT_SALT || 'bornclock');
  if (!admin.isAdmin) {
    const status = peekLimit(limitKey, tier);
    if (!status.allowed) {
      return json({ reply: limitReachedMessage(tier), rateLimited: true, crisis: false, remaining: 0 }, 429);
    }
  }

  try {
    // 4) Ground in the computed chart.
    let facts, gemstone, nowCtx: NowContext | undefined;
    try {
      const bp = {
        y: Number(birth.y), m: Number(birth.m), d: Number(birth.d),
        h: Number(birth.h ?? 12), min: Number(birth.min ?? 0),
        lat: Number(birth.lat ?? 28.6139), lon: Number(birth.lon ?? 77.209),
      };
      // fix-timezone-accuracy: offset from the birthplace + date via the shared resolver
      // (the client's numeric `tz` is no longer trusted; `tzid` = optional manual zone).
      const btz = resolveRequestBirthTz(k => (k === 'tzid' ? birth.tzid : null), bp);
      if ('error' in btz) return json({ error: 'bad-birth', reply: btz.error }, 400);
      const chart = await calculateBirthChart({
        year: bp.y, month: bp.m, day: bp.d, hour: bp.h, minute: bp.min,
        latitude: bp.lat, longitude: bp.lon, timezoneOffset: btz.tz,
      }, { includeShadbala: true });
      // Audit K3: pass age so a child is never given marriage/career timing.
      const birthUTC = new Date(Date.UTC(bp.y, bp.m - 1, bp.d, bp.h, bp.min) - btz.tz * 3600_000);
      const now = new Date();
      const ageYears = ageInYears(birthUTC, now);
      const ms = maritalStatus ?? birth.maritalStatus;
      facts = extractReadingFacts(chart, now, { ageYears, birth: birthUTC, maritalStatus: ms === 'married' || ms === 'single' ? ms : 'not-said' });
      // Audit K7: today's date (user's zone if sent), age, running Dasha, slow transits.
      nowCtx = buildNowContext(chart, now, { ageYears, userTimeZone, birthTimeZone: btz.birthTimezone?.timezone, maritalStatus: ms });
      gemstone = gemstoneChatContext(chart); // Item 3: Lagna-based gemstone context for the chat
    } catch (inputErr) {
      return json({ error: 'bad-birth', reply: String(inputErr?.message || inputErr) }, 400);
    }

    const history = Array.isArray(messages) ? messages : [];
    const payload = await buildChatReply(facts, history, text, callGemini, gemstone, nowCtx);

    // Count the question against the server-side daily limit ONLY when a real
    // answer was delivered (not a degraded/error fallback) and only for non-admin
    // tiers. Attach the authoritative `remaining` so the client can display it.
    let remaining: number | undefined;
    if (!admin.isAdmin && !payload.degraded) {
      remaining = recordQuestionServer(limitKey, tier).remaining;
    }

    // Tag admin/testing replies so this traffic is identifiable and can be excluded
    // from real usage analytics later (Part N design principle 4).
    if (admin.isAdmin) return json({ ...payload, admin: true });
    return json(remaining !== undefined ? { ...payload, remaining } : payload);
  } catch (e) {
    return json({ error: 'chat-failed', reply: 'Something went wrong on my side — please try again.', detail: String(e?.message || e) }, 500);
  }
}

export const POST = handler;
