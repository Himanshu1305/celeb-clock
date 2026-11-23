/**
 * Which Gemini API key BornClock uses. NEW_GEMINI_API_KEY (BornClock's own key) wins;
 * GEMINI_API_KEY (the older shared key) is kept as a fallback, so removing or rotating
 * either one never breaks the readings, chat or coach.
 */
export function geminiKey(): string | undefined {
  for (const k of [process.env.NEW_GEMINI_API_KEY, process.env.GEMINI_API_KEY]) {
    if (k && k.trim()) return k.trim();
  }
  return undefined;
}
