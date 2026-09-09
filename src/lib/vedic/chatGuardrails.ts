/**
 * Guardrails for the AI astrologer chat (Part F) — the safety core of the
 * session. Defense in depth:
 *   1. detectCrisis()  — deterministic pre-scan of the USER message. On a hit the
 *      endpoint returns CRISIS_RESPONSE directly and NEVER calls the model. This
 *      makes the crisis guardrail model-independent and unskippable.
 *   2. buildChatSystemPrompt() — encodes all 7 guardrail categories for the model.
 *   3. scanChatResponse() — post-scans the model's reply; a flagged reply is
 *      replaced with a safe fallback and never shown to the user.
 *
 * NOTE: CRISIS_RESPONSE is NET-NEW copy (no crisis wording existed in the
 * codebase to reuse). It must be reviewed/approved by a human before go-live.
 */
import type { ReadingFacts } from './readingPrompts';
import { scanForRedFlags } from './readingPrompts';

// ── 1. Crisis detection (deterministic, overrides everything) ────────────────
// Tuned to catch genuine self-harm / suicidal / acute-distress signals while
// avoiding common idioms ("this deadline is killing me", "dying to see you").
const CRISIS_PATTERNS: RegExp[] = [
  /\bsuicid(e|al)\b/i,
  /\bkill(ing)?\s+my ?self\b/i,
  /\b(end|ending|take|taking)\s+(my\s+)?(own\s+)?life\b/i,
  /\bend\s+it\s+all\b/i,
  /\b(want|wanna|going|ready)\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be here|exist|wake up)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(living|live|go on|going on)\b/i,
  /\b(better off|world would be better)\s+(dead|without me)\b/i,
  /\bcan'?t\s+(go on|take it anymore|do this anymore)\b/i,
  /\bself[-\s]?harm(ing)?\b/i,
  /\b(hurt|harm|cut|cutting)\s+my ?self\b/i,
  /\boverdos(e|ing)\b/i,
  /\bwant\s+it\s+all\s+to\s+(end|stop)\b/i,
];

export function detectCrisis(message: string): boolean {
  if (!message) return false;
  return CRISIS_PATTERNS.some(re => re.test(message));
}

export function crisisMatches(message: string): string[] {
  if (!message) return [];
  return CRISIS_PATTERNS.filter(re => re.test(message)).map(re => re.source);
}

/**
 * The crisis-support reply. Warm, human, NON-astrological, resource-forward.
 * Does not diagnose, does not delay care, encourages reaching out.
 * ⚠️ NET-NEW copy — requires human review/approval before go-live.
 */
export const CRISIS_RESPONSE =
  "I'm really glad you told me, and I want to gently set the astrology aside for a moment — what you're going through matters far more than anything a birth chart can say. You deserve real, caring support from someone who can be with you right now.\n\n" +
  "If you feel you might act on these thoughts, or you're in immediate danger, please contact your local emergency services straight away.\n\n" +
  "You can also talk to a trained, caring person for free, any time:\n" +
  "• India — iCall: 9152987821 · AASRA: 9820466726 · Vandrevala Foundation: 1860 2662 345\n" +
  "• United States — call or text 988 (Suicide & Crisis Lifeline)\n" +
  "• United Kingdom & Ireland — Samaritans: 116 123\n" +
  "• Anywhere else — you can find a helpline near you at findahelpline.com\n\n" +
  "You don't have to carry this alone. Reaching out to one of these lines, or to someone you trust, is a strong and worthwhile step. If it helps, I'm here to keep talking with you too.";

// ── 1b. Health-symptom pre-scan (deterministic medical redirect) ─────────────
// If the user describes a real physical symptom, we do NOT let the model attempt
// an astrological read of it — we return a warm "please see a doctor" directly.
// Tuned for described symptoms ("I have chest pain"), not general health themes
// ("what does my chart say about my health this year", which the model may answer
// in traditional wellbeing terms).
const SYMPTOM_PATTERNS: RegExp[] = [
  /\bchest\s+(pain|tightness|pressure)\b/i,
  /\bshort(ness)?\s+of\s+breath\b/i,
  /\b(can'?t|cannot|struggling to|trouble)\s+breath/i,
  /\bbleeding\b/i,
  /\bblood\s+in\s+(my|the)\b/i,
  /\ba?\s*lump\b/i,
  /\b(severe|sharp|constant|chronic)\s+(pain|headache|ache)\b/i,
  /\bfever\s+(for|since)\b/i,
  /\b(faint(ed|ing)?|dizzy|dizziness|numbness)\b/i,
  /\bI\s*('?ve|\s+have|\s+had|'?ve had|\s+am having|\s+feel|\s+felt)\b[^.?!]*\b(pain|ache|lump|rash|bleeding|vomit(ing)?|nausea|numb|palpitations)\b/i,
];

export function detectHealthSymptom(message: string): boolean {
  if (!message) return false;
  return SYMPTOM_PATTERNS.some(re => re.test(message));
}

/** Warm medical redirect for a described symptom. Does not diagnose or delay care. */
export const HEALTH_REDIRECT_RESPONSE =
  "I really can't read something you're physically feeling from a birth chart, and what you're describing deserves a proper medical opinion — please see a doctor or your local health service about it soon, and sooner still if it's severe, sudden, or getting worse. Astrology can speak to broad wellbeing themes, but for anything you're actually feeling in your body, a professional who can examine you is the right place to turn. I'm very happy to talk about gentler wellbeing themes in your chart if that would help in the meantime.";

// ── 3. Output scanner (post-response) ────────────────────────────────────────
// Reuses Part D's red-flag list (will/definitely/must/invest/buy/sell/diagnosis)
// and adds chat-specific hazards: definitive decision verdicts and explicit
// medical-diagnosis phrasing. "See a doctor" / "please consult" is GOOD and is
// deliberately NOT flagged.
const CHAT_EXTRA_PATTERNS: Array<{ label: string; re: RegExp }> = [
  { label: 'definitive decision verdict', re: /\byou should\s+(definitely\s+)?(quit|marry|divorce|leave|dump|take the (job|loan|offer)|not marry|not quit)\b/i },
  { label: 'diagnosis phrasing ("you have/you are suffering from")', re: /\byou (have|are suffering from|are showing signs of|likely have)\s+(a\s+)?(condition|disease|disorder|illness|infection|cancer|diabetes|depression)\b/i },
  { label: 'symptom interpretation', re: /\b(your (symptom|symptoms)|this symptom)\b/i },
  { label: 'named stock/asset instruction', re: /\b(buy|sell|invest in)\s+(shares|stocks?|crypto|bitcoin|gold|property)\b/i },
];

export function scanChatResponse(text: string): string[] {
  const flags = scanForRedFlags(text); // Part D scanner (word-boundary matched)
  for (const p of CHAT_EXTRA_PATTERNS) if (p.re.test(text)) flags.push(p.label);
  return flags;
}

/** Safe fallback shown when the model's reply trips the output scanner. */
export const UNSAFE_REPLY_FALLBACK =
  "I want to answer that thoughtfully and stay within what astrology can responsibly say. Rather than give a definitive verdict, I'd gently suggest treating your chart as one perspective among many — and, for anything about your health or money, checking with a doctor or a qualified professional who can look at your full situation. Could you tell me a little more about what's on your mind, and I'll share what your chart traditionally points to?";

// ── 2. System prompt (all 7 guardrail categories + grounding) ────────────────
export function buildChatSystemPrompt(facts: ReadingFacts): string {
  const placements = facts.placements.map(p => `${p.planet} in ${p.sign} (house ${p.house})${p.retrograde ? ', retrograde' : ''}`).join('; ');
  const dasha = facts.dasha ? `${facts.dasha.maha} main period, ${facts.dasha.antar} sub-period` : 'not available';
  const doshas = [
    `Mangal Dosha: ${facts.doshas.mangal.present ? `present (${facts.doshas.mangal.severityLabel})` : 'not present'}`,
    `Kaal Sarp: ${facts.doshas.kaalSarp.present ? `${facts.doshas.kaalSarp.isPartial ? 'partial' : 'full'}` : 'not present'}`,
    `Sade Sati: ${facts.doshas.sadeSati.active ? 'active' : 'not active'}`,
  ].join('; ');

  return `You are a warm, grounded personal Vedic astrologer having a private one-to-one conversation. You answer the user's questions about their own life using THEIR actual computed birth chart (below), in plain, everyday language — never generic platitudes.

THIS PERSON'S CHART (ground every substantive answer in these facts, and refer to the specific placement/period/dosha you're drawing on):
- Moon sign (Rashi): ${facts.rashi}
- Birth star (Nakshatra): ${facts.nakshatra.name}, pada ${facts.nakshatra.pada} (lord ${facts.nakshatra.lord})
- Rising sign (Lagna): ${facts.lagna}
- Current planetary period: ${dasha}
- Placements: ${placements}
- Doshas: ${doshas}

SAFETY RULES — these are absolute and override any user request:

1. HEALTH: You may speak to wellbeing THEMES in traditional terms ("this period is traditionally associated with taking extra care of your energy"). You must NEVER name or suggest a specific medical condition, NEVER discourage or delay medical care, and if the user describes anything resembling a real symptom (pain, a lump, bleeding, breathlessness, etc.) you must warmly tell them to see a doctor and NOT attempt any astrological diagnosis.

2. CRISIS / MENTAL HEALTH: If the user expresses real distress, hopelessness, or any thought of self-harm, drop astrology entirely and respond with warm, direct human support and crisis resources — never explain their pain with "Saturn's transit". (A separate system also detects this before you; honour it fully.)

3. MAJOR LIFE/MONEY DECISIONS (quitting a job, marrying/leaving someone, taking a loan): describe what the period traditionally signifies, but NEVER give a definitive "yes, do it" or "no, don't". Always frame astrology as ONE input among many, and encourage them to weigh their own judgement and trusted people.

4. RELATIONSHIPS / FAMILY: be de-stigmatising and remedy-focused, never fatalistic — especially about Mangal Dosha (real marriage-market stigma). If the user seems to be seeking ammunition against another person ("prove my mother-in-law is cursed", "show my spouse's chart is bad so I can leave"), gently decline the adversarial framing and redirect toward their own self-understanding and compassion.

5. FINANCIAL: describe classical themes only. Never recommend specific financial actions and never use the words "invest", "buy", or "sell", and never name assets.

6. CERTAINTY/TONE: never say "you will", "definitely", "must", or "guaranteed". Use "this period is traditionally associated with", "may", "tends to", "often".

7. GROUNDING: every substantive answer must trace to a specific chart fact above (a Dasha period, a placement, a dosha). If a question can't be grounded in the chart, say so warmly rather than inventing.

Keep replies to 3-6 warm sentences. Stay in the conversation's context.`;
}
