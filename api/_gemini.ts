/**
 * Gemini API keys for BornClock. NEW_GEMINI_API_KEY (BornClock's own key) is tried first;
 * GEMINI_API_KEY (the older shared key) is the fallback — both on "not set" AND when Google
 * rejects a call made with the new key, so a bad or still-activating key never takes the
 * readings, chat or coach down. Google's error text (never the key) is logged and included
 * in the thrown error so the cause is visible.
 */
type NamedKey = { name: 'NEW_GEMINI_API_KEY' | 'GEMINI_API_KEY'; key: string };

export function geminiKeys(): NamedKey[] {
  const out: NamedKey[] = [];
  for (const name of ['NEW_GEMINI_API_KEY', 'GEMINI_API_KEY'] as const) {
    const k = process.env[name]?.trim();
    if (k && !out.some(o => o.key === k)) out.push({ name, key: k });
  }
  return out;
}

export function geminiKey(): string | undefined {
  return geminiKeys()[0]?.key;
}

/** POST a generateContent body, trying each key in order; returns the first OK response. */
export async function geminiFetch(url: string, body: string): Promise<Response> {
  const keys = geminiKeys();
  if (!keys.length) throw new Error('GEMINI_API_KEY / NEW_GEMINI_API_KEY not configured');
  let lastErr: Error | null = null;
  for (const { name, key } of keys) {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body });
    if (res.ok) return res;
    let detail = '';
    try { detail = (await res.text()).replace(/\s+/g, ' ').slice(0, 300); } catch { /* ignore */ }
    console.error(`[gemini] ${name} -> ${res.status} ${detail}`);
    lastErr = new Error(`Gemini API error: ${res.status} [${name}] ${detail.slice(0, 200)}`);
  }
  throw lastErr!;
}
