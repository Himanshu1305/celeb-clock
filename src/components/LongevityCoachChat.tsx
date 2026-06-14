import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Lock, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LongevityResult } from '@/services/LongevityCalculationService';

interface LongevityCoachChatProps {
  result: LongevityResult;
  userName?: string;
  isPremium: boolean;
}

interface ChatMessage {
  role: 'user' | 'coach';
  text: string;
}

const SUGGESTIONS = [
  "What's my biggest opportunity to add years to my life?",
  "How does my genetic score affect my forecast?",
  "What one habit change would help me the most?",
  "Explain my community bonus to me",
];

export function LongevityCoachChat({ result, userName, isPremium }: LongevityCoachChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const userContext = {
    currentAge: result.currentAge,
    country: result.quizSnapshot?.country || 'Unknown',
    gender: result.quizSnapshot?.gender || 'Unknown',
    totalForecast: result.totalForecast,
    remainingYears: Math.max(0, Math.round((result.totalForecast - result.currentAge) * 10) / 10),
    controllablePotential: result.controllablePotential,
    potentialGain: Math.round((result.controllablePotential - result.totalForecast) * 10) / 10,
    factorBreakdown: result.factorBreakdown,
    geneticScore: result.geneticVitalityScore,
    geneticAdjustment: result.geneticAdjustment,
    epigeneticAdjustment: result.epigeneticAdjustment,
    communityBonus: result.communityBonus,
  };

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    if (messages.length >= 20) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/longevity-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, userContext }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      setMessages([...newMessages, { role: 'coach', text: data.reply }]);
    } catch {
      setError('The coach is unavailable right now. Please try again.');
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="relative rounded-2xl border bg-white dark:bg-card shadow-sm overflow-hidden">
      {/* Premium blur overlay */}
      {!isPremium && (
        <div className="absolute inset-0 z-10 backdrop-blur-sm bg-white/70 dark:bg-background/70 flex flex-col items-center justify-center gap-4 p-6 text-center rounded-2xl">
          <Lock className="w-8 h-8 text-primary" />
          <h3 className="font-semibold text-lg">AI Longevity Coach is a Premium Feature</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Upgrade to chat with your personal AI health advisor who knows your exact forecast and health profile.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link to="/upgrade">Upgrade to Premium →</Link>
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-foreground">Your Personal Longevity Coach</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Ask me anything about your forecast, your health factors, or how to improve your score.
        </p>
        <span className="inline-block text-xs text-indigo-600 dark:text-indigo-400 mt-1 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
          Powered by AI · Uses your personal data
        </span>
      </div>

      {/* Chat area */}
      <div className="max-h-80 overflow-y-auto p-4 space-y-3 flex flex-col">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground text-center mb-3">
              {userName ? `Hello ${userName}! ` : ''}Try one of these questions:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  disabled={!isPremium}
                  className="text-xs px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-gray-100 dark:bg-muted text-foreground rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-muted px-4 py-3 rounded-2xl rounded-bl-sm">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        {messages.length >= 20 && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Max conversation length reached.{' '}
              <button
                onClick={() => setMessages([])}
                className="text-indigo-600 hover:underline"
              >
                Start a new conversation
              </button>
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask your longevity coach…"
            disabled={!isPremium || loading || messages.length >= 20}
            className="flex-1 text-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!isPremium || loading || !input.trim() || messages.length >= 20}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
