/**
 * Client caller for the AI astrologer chat (`/api/vedic-chat`). Turns a saved
 * birth profile into the birth params the endpoint grounds on, and carries the
 * recent conversation for context. Conversation lives only in the caller's
 * session — nothing is persisted server-side.
 */
import type { SavedBirthProfile } from '@/services/savedProfile';

export interface ChatTurn { role: 'user' | 'astrologer'; text: string }

export interface ChatResponse {
  reply: string;
  crisis?: boolean;
  healthRedirect?: boolean;
  degraded?: boolean;
  sanitized?: boolean;
  rateLimited?: boolean;
  grounding?: string[];
  error?: string;
}

export function birthFromProfile(p: SavedBirthProfile) {
  const [y, m, d] = p.dob.split('-').map(Number);
  const [h, min] = p.time.split(':').map(Number);
  return { y, m, d, h, min, lat: p.city.lat, lon: p.city.lon, tz: p.city.tz };
}

export async function sendChatMessage(
  profile: SavedBirthProfile,
  history: ChatTurn[],
  message: string,
  tier: 'free' | 'paid',
  questionCount: number,
): Promise<ChatResponse> {
  const res = await fetch('/api/vedic-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ birth: birthFromProfile(profile), messages: history, message, tier, questionCount }),
  });
  const data = await res.json().catch(() => ({}));
  // The endpoint returns a friendly `reply` even on 400/429/500 — surface it.
  if (data && typeof data.reply === 'string') return data as ChatResponse;
  return { reply: 'The astrologer is unavailable right now. Please try again in a moment.', degraded: true };
}
