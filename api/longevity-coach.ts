// ZERO-RETENTION GUARANTEE: This endpoint must never persist or log message
// content or userContext. The privacy policy's "processed transiently, never
// stored, never logged" claim depends on this file staying storage-free.
// Do not add Supabase writes or content logging here.

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
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
    const systemPrompt = `You are a warm, knowledgeable longevity coach working with a specific person. Here is their complete health profile:

Personal details:
- Current age: ${userContext.currentAge} years
- Country: ${userContext.country}
- Gender: ${userContext.gender}

Longevity forecast:
- Current lifestyle forecast: ${userContext.totalForecast} years
- Years remaining: ${userContext.remainingYears} years
- Optimized potential: ${userContext.controllablePotential} years
- Potential gain with lifestyle changes: ${userContext.potentialGain} years

Health factor breakdown (current impact on forecast):
${userContext.factorBreakdown?.map((f: any) =>
  `- ${f.factor}: ${f.currentImpact > 0 ? '+' : ''}${f.currentImpact} years`
).join('\n') || 'Not available'}

Genetic profile:
- Genetic score: ${userContext.geneticScore || 'Average'}
- Genetic adjustment: ${userContext.geneticAdjustment > 0 ? '+' : ''}${userContext.geneticAdjustment} years

Epigenetic habits bonus: +${userContext.epigeneticAdjustment} years
Community bonus: +${userContext.communityBonus} years

Your role:
- Answer their specific question using their exact data
- Be warm, encouraging, and specific — not generic
- Reference their actual numbers when relevant
- Focus on practical, actionable advice
- Keep responses under 200 words
- Use evidence-based recommendations
- Never give medical diagnoses or replace professional medical advice
- End responses with one specific, actionable next step they can take today

Always remind them at end: "For medical advice, please consult a healthcare professional."`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
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
