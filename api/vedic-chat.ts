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
import {
  detectCrisis, crisisMatches, CRISIS_RESPONSE,
  detectHealthSymptom, HEALTH_REDIRECT_RESPONSE,
  buildChatSystemPrompt, scanChatResponse, UNSAFE_REPLY_FALLBACK,
} from '../src/lib/vedic/chatGuardrails.js';
import { isOverLimit, limitReachedMessage } from '../src/lib/vedic/rateLimit.js';

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
      generationConfig: { maxOutputTokens: 800, temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } },
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
export async function buildChatReply(facts, history, message, generate) {
  const systemPrompt = buildChatSystemPrompt(facts);
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

  try {
    const raw = await generate(systemPrompt, contents);
    const flags = scanChatResponse(raw);
    if (flags.length > 0) {
      // The model produced disallowed language — never show it.
      return { reply: UNSAFE_REPLY_FALLBACK, crisis: false, degraded: false, sanitized: true, redFlags: flags, grounding };
    }
    return { reply: raw, crisis: false, degraded: false, sanitized: false, grounding };
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
  const tier = rawTier === 'paid' ? 'paid' : 'free';
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

  // 3) Rate limit (server-side double-check; client is authoritative this session).
  if (Number.isFinite(Number(questionCount)) && isOverLimit(Number(questionCount), tier)) {
    return json({ reply: limitReachedMessage(tier), rateLimited: true, crisis: false }, 429);
  }

  try {
    // 4) Ground in the computed chart.
    let facts;
    try {
      const chart = await calculateBirthChart({
        year: Number(birth.y), month: Number(birth.m), day: Number(birth.d),
        hour: Number(birth.h ?? 12), minute: Number(birth.min ?? 0),
        latitude: Number(birth.lat ?? 28.6139), longitude: Number(birth.lon ?? 77.209), timezoneOffset: Number(birth.tz ?? 5.5),
      });
      facts = extractReadingFacts(chart);
    } catch (inputErr) {
      return json({ error: 'bad-birth', reply: String(inputErr?.message || inputErr) }, 400);
    }

    const history = Array.isArray(messages) ? messages : [];
    const payload = await buildChatReply(facts, history, text, callGemini);
    return json(payload);
  } catch (e) {
    return json({ error: 'chat-failed', reply: 'Something went wrong on my side — please try again.', detail: String(e?.message || e) }, 500);
  }
}

export const POST = handler;
