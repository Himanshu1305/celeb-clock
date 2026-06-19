import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check, Gift } from 'lucide-react';

interface Props {
  forecast: number;
  currentAge: number;
  birthDate?: Date;
}

const MESSAGES = [
  "Every second counts. What you do today shapes how many you have left.",
  "The best time to start a healthy habit was yesterday. The second best is now.",
  "Your future self is watching the choices you make right now.",
  "Small, consistent changes compound into years of additional healthy life.",
  "You have more control over this number than you think.",
  "The people who live longest don't try to live forever — they live well.",
];

function calcTimeLeft(forecastTs: number) {
  const diff = forecastTs - Date.now();
  if (diff <= 0) return { years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  const totalSecs = Math.floor(diff / 1000);
  const totalMins = Math.floor(totalSecs / 60);
  const totalHours = Math.floor(totalMins / 60);
  const totalDays = Math.floor(totalHours / 24);
  const totalYears = Math.floor(totalDays / 365.25);
  return {
    years: totalYears,
    days: Math.floor(totalDays % 365.25),
    hours: totalHours % 24,
    minutes: totalMins % 60,
    seconds: totalSecs % 60,
  };
}

export const LongevityCountdown = ({ forecast, currentAge, birthDate }: Props) => {
  const estimatedBirth = birthDate ?? (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - currentAge);
    return d;
  })();

  const forecastDate = new Date(estimatedBirth.getTime());
  forecastDate.setFullYear(forecastDate.getFullYear() + forecast);
  const forecastTs = forecastDate.getTime();

  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(forecastTs));
  const [msgIndex, setMsgIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('shared') === '1') setIsSharedView(true);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(forecastTs)), 1000);
    return () => clearInterval(id);
  }, [forecastTs]);

  useEffect(() => {
    const id = setInterval(() => setMsgIndex(i => (i + 1) % MESSAGES.length), 10000);
    return () => clearInterval(id);
  }, []);

  const progress = Math.min(100, Math.round((currentAge / forecast) * 1000) / 10);

  const handleShare = async () => {
    const params = new URLSearchParams({ shared: '1', forecast: String(forecast), age: String(currentAge) });
    const url = `${window.location.origin}/life-expectancy?${params.toString()}`;
    const text = `My life expectancy forecast is ${forecast} years — ${timeLeft.years}y ${timeLeft.days}d remaining.\n\nSee my countdown: ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My BornClock Countdown', text, url });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* clipboard/share unavailable */ }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 md:p-8 my-6 border border-purple-800/30 shadow-xl space-y-6">
      {isSharedView && (
        <div className="flex items-center gap-2 bg-purple-900/60 border border-purple-500/40 rounded-xl px-4 py-3 text-sm text-purple-200">
          <Gift className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Someone shared their BornClock countdown with you. <a href="/life-expectancy" className="underline text-purple-300 hover:text-white">Calculate yours →</a></span>
        </div>
      )}
      <div className="text-center space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-purple-300">⏳ Your Life Countdown</p>
        <p className="text-sm text-slate-400">Estimated time remaining until age {forecast}</p>
        <p className="text-xs text-white/50 italic">
          ⓘ Countdown to your statistical life expectancy date, calculated from your date of birth.
          This is a motivational estimate — not a medical prediction.
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2 text-center">
        {[
          { label: 'Years', value: timeLeft.years },
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Mins', value: timeLeft.minutes },
          { label: 'Secs', value: timeLeft.seconds },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-2xl md:text-3xl font-black text-white tabular-nums leading-none">{pad(value)}</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Birth</span>
          <span className="text-purple-300 font-semibold">{progress}% of forecast lived</span>
          <span>Age {forecast}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-h-[64px] flex items-center justify-center text-center">
        <p className="text-sm text-slate-300 italic leading-relaxed">
          "{MESSAGES[msgIndex]}"
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-2 border-purple-700 text-purple-300 hover:bg-purple-900/30"
        >
          {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Share Countdown'}
        </Button>
      </div>

      <p className="text-center text-[10px] text-white/70 leading-relaxed">
        ⚠️ Statistical estimate only. Actual lifespan varies based on factors outside any model's scope.
      </p>
    </div>
  );
};
