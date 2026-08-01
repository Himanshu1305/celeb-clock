import { useState } from 'react';
import { Link } from 'react-router-dom';
import { calculateBiorhythm, getBiorhythmStatus } from '@/data/biorhythmData';
import { DobInput, toISODate } from '@/components/DobInput';
import { checkInPrompt, nextUpswing, validateDob } from '@/data/rhythmFraming';

const MONTHS = ['', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

type Variant = 'today' | 'forecast' | 'habit' | 'energy';

interface Props {
  variant?: Variant;
  ctaLabel?: string;
}

// NB: Tailwind can't see dynamically-built class names, so the widget uses a fixed
// teal palette (static classes). Pages style their own surrounding sections.
export function RhythmWidget({ variant = 'today', ctaLabel = 'Calculate my rhythm →' }: Props) {
  const [dob, setDob] = useState('');
  const [birth, setBirth] = useState<Date | null>(null);
  const [error, setError] = useState('');

  const run = () => {
    const res = validateDob(dob);
    if ('error' in res) { setError(res.error); setBirth(null); return; }
    setError(''); setBirth(res.date);
  };

  const today = new Date(); today.setHours(12, 0, 0, 0);
  const current = birth ? calculateBiorhythm(birth, today) : null;

  // 7-day mini forecast
  const forecast = birth ? Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() + i);
    const r = calculateBiorhythm(birth, d);
    return { d, ...r };
  }) : [];

  const upswing = birth ? nextUpswing(birth) : null;
  const bornSlug = birth ? `/born-on/${MONTHS[birth.getMonth() + 1]}-${birth.getDate()}` : '/born-on';

  return (
    <div className="bg-teal-50 rounded-2xl p-6 border border-teal-100">
      <p className="text-sm font-semibold text-gray-700 mb-3">Enter your date of birth</p>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
        <div className="flex-1">
          <DobInput label="" onValidChange={d => setDob(d ? toISODate(d) : '')} />
        </div>
        <button onClick={run} className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors">
          {ctaLabel}
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-red-600 mt-3">{error}</p>}

      {current && (
        <div className="mt-6">
          {/* Today's three readings */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Physical', value: current.physical, cycle: '23-day' },
              { label: 'Emotional', value: current.emotional, cycle: '28-day' },
              { label: 'Mental', value: current.intellectual, cycle: '33-day' },
            ].map(({ label, value, cycle }) => {
              const s = getBiorhythmStatus(value);
              return (
                <div key={label} className={`rounded-xl p-3 text-center ${s.bgColor}`}>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-2xl font-black text-gray-900">{value > 0 ? '+' : ''}{value}%</p>
                  <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
                  <p className="text-[10px] text-gray-400 mt-0.5">{cycle}</p>
                </div>
              );
            })}
          </div>

          {/* Honest check-in prompt (never a prescription) */}
          <div className="bg-white/70 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-700">{checkInPrompt(current.physical, current.emotional)}</p>
          </div>

          {/* Habit variant: next physical+emotional upswing date */}
          {variant === 'habit' && (
            <div className="bg-white/70 rounded-xl p-4 mb-4">
              {upswing ? (
                <p className="text-sm text-gray-700">
                  Your next day with both physical and emotional rhythms on the up is{' '}
                  <strong>{upswing.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</strong>.
                  Some people find a rising day a slightly easier moment to begin something — but the research is clear that
                  showing up consistently matters far more than the start date. Treat this as a nudge, not a deadline.
                </p>
              ) : (
                <p className="text-sm text-gray-700">No combined upswing in the next 30 days — which is a fine reminder that the best day to start a habit is usually just the next one you'll actually do.</p>
              )}
            </div>
          )}

          {/* 7-day mini forecast */}
          {(variant === 'forecast' || variant === 'energy' || variant === 'today' || variant === 'habit') && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Your next 7 days — a rhythm check-in, not a plan</p>
              <div className="space-y-1.5">
                {forecast.map((f, i) => {
                  const s = getBiorhythmStatus(f.physical);
                  return (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 w-24">{i === 0 ? 'Today' : f.d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</span>
                      <span className={`font-semibold ${s.color} w-20`}>{s.label}</span>
                      <span className="text-gray-400">P {f.physical > 0 ? '+' : ''}{f.physical} · E {f.emotional > 0 ? '+' : ''}{f.emotional} · M {f.intellectual > 0 ? '+' : ''}{f.intellectual}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Internal links, incl. the born-on page for the entered DOB */}
          <div className="flex flex-wrap gap-3 text-sm">
            <Link to="/biorhythm" className={`text-teal-700 hover:underline`}>Full biorhythm chart →</Link>
            <Link to={bornSlug} className={`text-teal-700 hover:underline`}>Who shares your birthday →</Link>
            <Link to="/birthday-report" className={`text-teal-700 hover:underline`}>Your Birthday Report →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
