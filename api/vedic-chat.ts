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
import { gemstoneChatContext } from '../src/lib/vedic/gemstones.js';
import {
  detectCrisis, crisisMatches, CRISIS_RESPONSE,
  detectHealthSymptom, HEALTH_REDIRECT_RESPONSE,
  buildChatSystemPrompt, scanChatResponse, UNSAFE_REPLY_FALLBACK,
  detectTimingQuestion, classifyTimingCategory, deterministicTimingReply,
} from '../src/lib/vedic/chatGuardrails.js';
import { verifyTimingClaims, verifyYogaClaims } from '../src/lib/vedic/readingSpecificity.js';
import { isOverLimit, limitReachedMessage } from '../src/lib/vedic/rateLimit.js';
import { verifyAdminRequest } from './_adminAuth.js';

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
export async function buildChatReply(facts, history, message, generate, gemstone?) {
  const systemPrompt = buildChatSystemPrompt(facts, gemstone);
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
  const validMonths = facts.timing?.validMonths || [];
  // Yoga-citation guard (Part J): the reply must never assert a Yoga the chart
  // doesn't have. Runs on EVERY reply (cheap), same zero-tolerance/retry discipline.
  const presentYogaNames = (facts.yogas || []).map((y: any) => y.name);
  const hasYogakaraka = (facts.yogas || []).some((y: any) => /yogakaraka/i.test(y.note || ''));
  const SAFETY_FIX = 'Reminder: your previous reply used a forbidden word. Do NOT use "will", "must", "definitely", "guaranteed", "invest", "buy", or "sell" anywhere — rephrase as "tends to", "often", "may", "put time/care into". Never name assets or give a financial instruction.';
  const DATE_FIX = 'Reminder: your previous reply stated a date that is NOT in the COMPUTED TIMING WINDOWS list. Re-answer using ONLY the exact planet periods and date ranges from that list — never invent, round, or shift a date.';
  const YOGA_FIX = 'Reminder: your previous reply named a Yoga that is NOT in the DETECTED YOGAS list for this chart. Only cite Yogas from that list (with their exact grade); if the user asked about one that is not present, say plainly they do not have it — do not invent one.';

  try {
    let lastFlags: string[] = [], lastBadDates: string[] = [], lastBadYogas: string[] = [];
    for (let attempt = 1; attempt <= 3; attempt++) {
      const corrections: string[] = [];
      if (attempt > 1) {
        if (lastFlags.length) corrections.push(SAFETY_FIX);
        if (lastBadDates.length) corrections.push(DATE_FIX);
        if (lastBadYogas.length) corrections.push(YOGA_FIX);
      }
      const turns = corrections.length ? [...contents, { role: 'user', parts: [{ text: corrections.join(' ') }] }] : contents;
      const raw = await generate(systemPrompt, turns);

      // Safety scan (never banned language) + date-accuracy + Yoga-citation accuracy,
      // all under the SAME retry discipline — nothing unverified reaches the user.
      const flags = scanChatResponse(raw);
      const badDates = (isTiming && validMonths.length) ? verifyTimingClaims(raw, validMonths).wrong.map(w => w.claimed) : [];
      const badYogas = verifyYogaClaims(raw, presentYogaNames, hasYogakaraka).wrong.map(w => w.token);
      if (!flags.length && !badDates.length && !badYogas.length) {
        return { reply: raw, crisis: false, degraded: false, sanitized: false, ...(isTiming ? { timingChecked: true } : {}), yogaChecked: true, grounding };
      }
      lastFlags = flags; lastBadDates = badDates; lastBadYogas = badYogas;
    }

    // Exhausted retries. For a timing question, fall back to a deterministic,
    // guaranteed-correct-and-safe answer built straight from the computed windows
    // (so the user still gets their real dates). Otherwise, the safe fallback.
    if (isTiming && !lastBadYogas.length) {
      const safe = deterministicTimingReply(facts.timing, classifyTimingCategory(message));
      if (safe) return { reply: safe, crisis: false, degraded: false, sanitized: false, timingCorrected: true, grounding };
    }
    return { reply: UNSAFE_REPLY_FALLBACK, crisis: false, degraded: false, sanitized: true, redFlags: [...lastFlags, ...lastBadDates.map(d => `bad-date:${d}`), ...lastBadYogas.map(y => `bad-yoga:${y}`)], grounding };
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

  const { birth, messages, message, tier: rawTier, questionCount } = body ?? {};

  // TIER RESOLUTION (Part N). Admin is checked FIRST and short-circuits the
  // free/paid logic entirely. Crucially, the tier is re-derived SERVER-SIDE from a
  // verified Supabase JWT — the client's `rawTier` is NEVER trusted to claim admin.
  // A verified admin gets `tier:'admin'` (unlimited); everyone else keeps free/paid.
  const admin = await verifyAdminRequest(request);
  const tier = admin.isAdmin ? 'admin' : (rawTier === 'paid' ? 'paid' : 'free');
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

  // 3) Rate limit. A verified admin has tier 'admin' → isOverLimit is always false,
  // so this block is short-circuited and the daily cap never applies to them. For
  // everyone else the existing free/paid enforcement is unchanged.
  if (!admin.isAdmin && Number.isFinite(Number(questionCount)) && isOverLimit(Number(questionCount), tier)) {
    return json({ reply: limitReachedMessage(tier), rateLimited: true, crisis: false }, 429);
  }

  try {
    // 4) Ground in the computed chart.
    let facts, gemstone;
    try {
      const chart = await calculateBirthChart({
        year: Number(birth.y), month: Number(birth.m), day: Number(birth.d),
        hour: Number(birth.h ?? 12), minute: Number(birth.min ?? 0),
        latitude: Number(birth.lat ?? 28.6139), longitude: Number(birth.lon ?? 77.209), timezoneOffset: Number(birth.tz ?? 5.5),
      }, { includeShadbala: true });
      facts = extractReadingFacts(chart);
      gemstone = gemstoneChatContext(chart); // Item 3: Lagna-based gemstone context for the chat
    } catch (inputErr) {
      return json({ error: 'bad-birth', reply: String(inputErr?.message || inputErr) }, 400);
    }

    const history = Array.isArray(messages) ? messages : [];
    const payload = await buildChatReply(facts, history, text, callGemini, gemstone);
    // Tag admin/testing replies so this traffic is identifiable and can be excluded
    // from real usage analytics later (Part N design principle 4).
    return json(admin.isAdmin ? { ...payload, admin: true } : payload);
  } catch (e) {
    return json({ error: 'chat-failed', reply: 'Something went wrong on my side — please try again.', detail: String(e?.message || e) }, 500);
  }
}

export const POST = handler;
