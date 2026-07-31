// ZERO-RETENTION GUARANTEE: This endpoint must never persist or log message
// content or userContext. The privacy policy's "processed transiently, never
// stored, never logged" claim depends on this file staying storage-free.
// Do not add Supabase writes or content logging here.

import { QUIZ_COUNTRIES } from '../src/services/LongevityCalculationService.js';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── userContext validation (the injection defence) ────────────────────────────
// The forecast is computed client-side, so every userContext field arrives
// untrusted and is interpolated straight into the system prompt. Rather than
// wrap the prompt in delimiters, we validate each field against the calculator's
// OWN allowlists before it can reach the prompt. Allowlist sources:
//   - country:      QUIZ_COUNTRIES (LongevityCalculationService, imported)
//   - gender:       HealthQuizData.gender union 'male' | 'female' (''/other → Not specified)
//   - geneticScore: LongevityResult['geneticVitalityScore'] union (4 labels)
//   - factor names: the add('…') factor list in the calculator (14 names)
const COUNTRIES = new Set(QUIZ_COUNTRIES);
const GENDERS = new Set(['male', 'female']);
const GENETIC_SCORES = new Set(['Exceptional', 'Strong', 'Average', 'Below Average']);
const FACTOR_NAMES = new Set([
  'Tobacco Smoking', 'Alcohol Consumption', 'Physical Exercise', 'Diet Quality', 'Stress Level',
  'BMI / Body Weight', 'Blood Pressure', 'Sleep Duration', 'Social Connections', 'Family Genetics',
  'Epigenetic Habits', 'Heart Disease', 'Diabetes', 'Hypertension',
]);

const MAX_MESSAGE = 2000;

// Collapse whitespace/newlines, strip control chars, cap length. Any injected
// instruction that survived earlier checks cannot carry a newline into the prompt.
function cleanStr(v: unknown, max = 50): string {
  return String(v ?? '')
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

// A finite number within a sane inclusive range → rounded to 1dp, else null
// (its line is omitted from the prompt rather than fabricating a value).
function num(v: unknown, min: number, max: number): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? Math.round(n * 10) / 10 : null;
}

function signed(n: number): string {
  return `${n > 0 ? '+' : ''}${n}`;
}

export interface CleanContext {
  currentAge: number | null;
  country: string;
  gender: string;
  totalForecast: number | null;
  remainingYears: number | null;
  controllablePotential: number | null;
  potentialGain: number | null;
  factorBreakdown: { factor: string; currentImpact: number }[];
  geneticScore: string;
  geneticAdjustment: number | null;
  epigeneticAdjustment: number | null;
  communityBonus: number | null;
}

export function sanitizeUserContext(raw: any): CleanContext {
  const ctx = raw ?? {};
  const country = cleanStr(ctx.country);
  const gender = cleanStr(ctx.gender).toLowerCase();
  const geneticScore = cleanStr(ctx.geneticScore);

  const rawFactors = Array.isArray(ctx.factorBreakdown) ? ctx.factorBreakdown : [];
  const factorBreakdown = rawFactors
    .map((f: any) => ({ factor: cleanStr(f?.factor), currentImpact: num(f?.currentImpact, -60, 60) }))
    .filter((f: { factor: string; currentImpact: number | null }) =>
      FACTOR_NAMES.has(f.factor) && f.currentImpact !== null)
    .slice(0, 20) as { factor: string; currentImpact: number }[];

  return {
    currentAge: num(ctx.currentAge, 0, 130),
    country: COUNTRIES.has(country) ? country : 'Not specified',
    gender: GENDERS.has(gender) ? gender : 'Not specified',
    totalForecast: num(ctx.totalForecast, 0, 130),
    remainingYears: num(ctx.remainingYears, 0, 130),
    controllablePotential: num(ctx.controllablePotential, 0, 130),
    potentialGain: num(ctx.potentialGain, -60, 60),
    factorBreakdown,
    geneticScore: GENETIC_SCORES.has(geneticScore) ? geneticScore : 'Average',
    geneticAdjustment: num(ctx.geneticAdjustment, -40, 40),
    epigeneticAdjustment: num(ctx.epigeneticAdjustment, 0, 40),
    communityBonus: num(ctx.communityBonus, 0, 40),
  };
}

export function capMessage(message: unknown): string {
  return String(message ?? '').slice(0, MAX_MESSAGE);
}

export function buildSystemPrompt(c: CleanContext): string {
  const personal = [
    c.currentAge !== null ? `- Current age: ${c.currentAge} years` : null,
    `- Country: ${c.country}`,
    `- Gender: ${c.gender}`,
  ].filter(Boolean).join('\n');

  const forecast = [
    c.totalForecast !== null ? `- Current lifestyle forecast: ${c.totalForecast} years` : null,
    c.remainingYears !== null ? `- Years remaining: ${c.remainingYears} years` : null,
    c.controllablePotential !== null ? `- Optimized potential: ${c.controllablePotential} years` : null,
    c.potentialGain !== null ? `- Potential gain with lifestyle changes: ${c.potentialGain} years` : null,
  ].filter(Boolean).join('\n');

  const factorBreakdown = c.factorBreakdown.length
    ? c.factorBreakdown.map(f => `- ${f.factor}: ${signed(f.currentImpact)} years`).join('\n')
    : 'Not available';

  const genetic = [
    `- Genetic score: ${c.geneticScore}`,
    c.geneticAdjustment !== null ? `- Genetic adjustment: ${signed(c.geneticAdjustment)} years` : null,
  ].filter(Boolean).join('\n');

  const bonuses = [
    c.epigeneticAdjustment !== null ? `Epigenetic habits bonus: +${c.epigeneticAdjustment} years` : null,
    c.communityBonus !== null ? `Community bonus: +${c.communityBonus} years` : null,
  ].filter(Boolean).join('\n');

  return `You are a warm, knowledgeable longevity coach working with a specific person. Here is their complete health profile:

Personal details:
${personal}

Longevity forecast:
${forecast}

Health factor breakdown (current impact on forecast):
${factorBreakdown}

Genetic profile:
${genetic}

${bonuses}

Your role:
- Answer their specific question using their exact data
- Be warm, encouraging, and specific — not generic
- Reference their actual numbers when relevant
- Focus on practical, actionable advice
- Keep responses under 200 words
- Use evidence-based recommendations
- These numbers are a statistical estimate from self-reported factors and population data, not a clinical measurement or a prediction. Say "suggests", "associated with", "people with similar patterns tend to" — never "you will".
- You are not a clinician. The test isn't whether a question mentions a disease — it's whether answering would substitute for a doctor who can examine someone, know their history, and be accountable. Explaining what a factor means and what the general evidence says: yes. Interpreting someone's symptoms, medications, test results, or specific medical situation: no — however it's phrased, and whether it's about them or someone they describe. Decline in one warm sentence, name who can help, offer what you can do instead.
- End responses with one specific, actionable next step they can take today

When the exchange genuinely touches health decisions, symptoms, medication, or a specific condition, close with: "For medical advice, please consult a healthcare professional." For neutral questions — what a score means, how the calculation works, general encouragement — don't append it.`;
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { message, userContext } = body ?? {};

  if (!message || !userContext) {
    return json({ error: 'Missing message or context' }, 400);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: 'API key not configured' }, 500);
  }

  try {
    // Validate untrusted userContext against the calculator's allowlists, then build
    // the prompt from the cleaned values only. Cap the user message length too.
    const systemPrompt = buildSystemPrompt(sanitizeUserContext(userContext));
    const safeMessage = capMessage(message);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: safeMessage }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'I could not generate a response. Please try again.';

    return json({ reply });
  } catch (error) {
    console.error('Longevity coach error:', error);
    return json({ error: 'Failed to get response. Please try again.' }, 500);
  }
}

export const POST = handler;
