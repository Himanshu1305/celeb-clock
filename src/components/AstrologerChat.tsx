/**
 * AI astrologer chat (Part F). Renders the conversation and enforces the daily
 * rate limit client-side. Conversation is session-only (React state) — never
 * persisted. Requires a saved birth profile (passed in); the page handles the
 * no-profile case. Paid tier is stubbed to 'free' this session (no payment
 * system) — the rate-limit module supports both tiers and is unit-tested.
 */
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SavedBirthProfile } from '@/services/savedProfile';
import { sendChatMessage, type ChatTurn } from '@/services/chatService';
import { getStatus, commitQuestion, limitReachedMessage, type Tier } from '@/lib/vedic/rateLimit';

const SUGGESTIONS = [
  'What does my career look like this year?',
  'What does my chart say about my relationships?',
  'What is this current planetary period about for me?',
  'What should I focus on right now?',
];

interface Msg { role: 'user' | 'astrologer'; text: string; kind?: 'crisis' | 'health' | 'normal' }

export function AstrologerChat(
  { profile, tier: baseTier = 'free', isAdmin = false, accessToken = null }:
  { profile: SavedBirthProfile; tier?: Tier; isAdmin?: boolean; accessToken?: string | null },
) {
  // Part N: a verified admin uses the unlimited 'admin' tier. This client flag only
  // affects the local UI/counter — the REAL grant is the server verifying the JWT we
  // send below. A non-admin flipping this in dev tools gains nothing: the server
  // still caps them (and the local counter was never a real boundary anyway).
  const tier: Tier = isAdmin ? 'admin' : baseTier;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number>(() => getStatus(tier).remaining);
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { setRemaining(getStatus(tier).remaining); }, [tier]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;

    // Rate-limit gate (client-authoritative this session).
    const status = getStatus(tier);
    if (!status.allowed) { setLimitMsg(limitReachedMessage(tier)); return; }

    const history: ChatTurn[] = messages.map(m => ({ role: m.role, text: m.text }));
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    setLimitMsg(null);

    const res = await sendChatMessage(profile, history, q, tier, status.used, accessToken);
    const kind: Msg['kind'] = res.crisis ? 'crisis' : res.healthRedirect ? 'health' : 'normal';
    setMessages(prev => [...prev, { role: 'astrologer', text: res.reply, kind }]);

    // Only a genuine astrology answer counts against the daily limit — crisis,
    // health redirects, rate-limit notices and failures never consume a question.
    if (!res.crisis && !res.healthRedirect && !res.rateLimited && !res.degraded && !res.error) {
      setRemaining(commitQuestion(tier).remaining);
    }
    if (res.rateLimited) setLimitMsg(res.reply);
    setLoading(false);
  }

  return (
    <div data-testid="astrologer-chat" className="rounded-2xl border bg-white dark:bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gradient-to-r from-[#6E5AA6] to-[#6E5AA6] dark:from-[#6E5AA6]/20 dark:to-[#6E5AA6]/20">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="w-5 h-5 text-[#6E5AA6]" />
          <h3 className="font-semibold text-foreground">Your Personal Astrologer</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Ask about your life — grounded in your own birth chart ({profile.city.name}). Private to you.
        </p>
        <span data-testid="astrologer-remaining" className="inline-block text-xs text-[#6E5AA6] mt-1 bg-[#6E5AA6]/10 px-2 py-0.5 rounded-full">
          {isAdmin ? '∞ Unlimited (admin / testing mode)' : `${remaining} question${remaining === 1 ? '' : 's'} left today`}
        </span>
      </div>

      <div className="max-h-96 overflow-y-auto p-4 space-y-3 flex flex-col">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground text-center mb-2">Try one of these:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map(s => (
                <button key={s} data-testid="astrologer-suggestion" onClick={() => send(s)}
                        className="text-xs px-3 py-1.5 rounded-full bg-[#6E5AA6]/10 text-[#6E5AA6] hover:bg-[#6E5AA6]/10">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div data-testid={m.role === 'user' ? 'astrologer-msg-user' : 'astrologer-msg-bot'}
                 data-crisis={m.role === 'astrologer' && m.kind === 'crisis' ? 'true' : undefined}
                 className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                   m.role === 'user' ? 'bg-[#0E2238] text-white rounded-br-sm'
                   : m.kind === 'crisis' ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-bl-sm'
                   : 'bg-gray-100 dark:bg-muted text-foreground rounded-bl-sm'}`}>
              {m.role === 'astrologer'
                ? <ReactMarkdown components={{ p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p> }}>{m.text}</ReactMarkdown>
                : m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div data-testid="astrologer-loading" className="bg-gray-100 dark:bg-muted px-4 py-3 rounded-2xl rounded-bl-sm">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#0E2238] rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-[#0E2238] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[#0E2238] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}

        {limitMsg && <p data-testid="astrologer-ratelimit" className="text-center text-sm text-amber-700">{limitMsg}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t">
        <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex gap-2">
          <Input data-testid="astrologer-input" value={input} onChange={e => setInput(e.target.value)}
                 placeholder="Ask your astrologer anything…" disabled={loading} className="flex-1 text-sm" />
          <Button data-testid="astrologer-send" type="submit" size="icon" disabled={loading || !input.trim()}
                  className="bg-[#0E2238] hover:bg-[#0E2238] text-white">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default AstrologerChat;
