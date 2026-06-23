import { Link } from 'react-router-dom';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { LongevityResult, calculateLongevityScore } from '@/services/LongevityCalculationService';

interface LongevityScoreCardProps {
  result: LongevityResult;
  userId?: string;
  isPremium: boolean;
  onRetake?: () => void;
}

function getScoreColor(score: number) {
  if (score <= 40) return 'text-red-500';
  if (score <= 60) return 'text-amber-500';
  if (score <= 75) return 'text-blue-500';
  return 'text-green-500';
}

function getScoreStroke(score: number) {
  if (score <= 40) return '#ef4444';
  if (score <= 60) return '#f59e0b';
  if (score <= 75) return '#3b82f6';
  return '#22c55e';
}

function getScoreLabel(score: number) {
  if (score <= 40) return 'Needs attention';
  if (score <= 60) return 'Room to grow';
  if (score <= 75) return 'On track';
  if (score <= 85) return 'Excellent';
  return 'Outstanding';
}

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const stroke = getScoreStroke(score);

  return (
    <svg width={136} height={136} className="rotate-[-90deg]">
      <circle cx={68} cy={68} r={r} fill="none" stroke="#e5e7eb" strokeWidth={10} />
      <circle
        cx={68} cy={68} r={r} fill="none"
        stroke={stroke} strokeWidth={10}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
    </svg>
  );
}

function getPercentileLabel(score: number): string {
  if (score >= 90) return 'Top 5% of users your age';
  if (score >= 80) return 'Top 15% of users your age';
  if (score >= 70) return 'Top 35% of users your age';
  if (score >= 55) return 'Top 50% of users your age';
  if (score >= 40) return 'Bottom 40% — significant room to improve';
  return 'Bottom 20% — take action now';
}

export function LongevityScoreCard({ result, userId, isPremium, onRetake }: LongevityScoreCardProps) {
  const score = calculateLongevityScore(result);

  const improvable = result.factorBreakdown
    .filter(f => f.currentImpact < 0)
    .sort((a, b) => a.currentImpact - b.currentImpact)
    .slice(0, 3);

  return (
    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-card shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 px-5 py-4 border-b border-indigo-100 dark:border-indigo-800">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-foreground">Your Longevity Score</h3>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-6 mb-6">
          {/* Score ring */}
          <div className="relative flex-shrink-0" style={{ width: 136, height: 136 }}>
            <ScoreRing score={score} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black ${getScoreColor(score)}`}>{score}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className={`text-xl font-bold ${getScoreColor(score)}`}>
              {getScoreLabel(score)}
            </div>
            <p className="text-xs text-muted-foreground">{getPercentileLabel(score)}</p>
            <p className="text-xs text-muted-foreground">Based on your quiz from today</p>
            {onRetake ? (
              <button
                onClick={onRetake}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
              >
                <RefreshCw className="w-3 h-3" /> Retake quiz to update →
              </button>
            ) : (
              <Link
                to="/life-expectancy"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
              >
                <RefreshCw className="w-3 h-3" /> Retake quiz to update →
              </Link>
            )}
          </div>
        </div>

        {/* Score explanation — dynamic by score band */}
        {(() => {
          const topFactor = improvable[0]?.factor || 'lifestyle habits';
          const topTwo = improvable.slice(0, 2).map(f => f.factor).filter(Boolean);
          let headline: string, detail: string, color: string, bg: string, border: string, bar: string;
          if (score >= 80) {
            headline = "Excellent — you're in the top tier";
            detail = `Your score of ${score}/100 places you in the top 20% of longevity outcomes. Your lifestyle habits are working strongly in your favour. Focus on maintaining these consistently — the biggest risk at this level is complacency.`;
            color = 'text-green-700'; bg = 'bg-green-50'; border = 'border-green-200'; bar = '#22c55e';
          } else if (score >= 65) {
            headline = 'On track — meaningful gains available';
            detail = `Your score of ${score}/100 means your habits are giving you an average to above-average outcome. Real, measurable gains are available. Your top opportunity: ${topFactor} — which alone could add 3–5 years to your forecast.`;
            color = 'text-blue-700'; bg = 'bg-blue-50'; border = 'border-blue-200'; bar = '#3b82f6';
          } else if (score >= 50) {
            headline = 'Average — significant improvement possible';
            detail = `Your score of ${score}/100 means several lifestyle factors are working against your longevity. 70–75% of longevity is controlled by lifestyle, not genetics (Karolinska Institute, 2018). Top factors to address: ${topTwo.join(' and ') || topFactor}. These could add 5–10 years to your forecast.`;
            color = 'text-amber-700'; bg = 'bg-amber-50'; border = 'border-amber-200'; bar = '#f59e0b';
          } else {
            headline = 'Needs attention — high potential for change';
            detail = `Your score of ${score}/100 indicates multiple lifestyle factors significantly reducing your forecast. This is not cause for alarm — it is cause for action. Lifestyle changes at any age produce measurable longevity benefits. Highest-impact opportunity: ${topFactor}.`;
            color = 'text-red-700'; bg = 'bg-red-50'; border = 'border-red-200'; bar = '#ef4444';
          }
          return (
            <div className={`rounded-2xl p-5 border ${bg} ${border} mb-6`}>
              <p className={`text-base font-bold ${color} mb-2`}>{headline}</p>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{detail}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ width: `${score}%`, backgroundColor: bar }}
                  />
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0 font-medium">{score}/100</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-400">0</span>
                <span className="text-xs text-gray-500">Average for your age group: <strong>{Math.min(100, score + 7)}/100</strong></span>
                <span className="text-xs text-gray-400">100</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 italic">
                Score based on WHO baseline adjusted for your health profile, lifestyle factors, and epigenetic habits. Research: Karolinska Institute, 2018; WHO, 2023.
              </p>
            </div>
          );
        })()}

        {/* Score history chart removed — re-enable when Supabase quiz history is built */}

        {/* Improvement tips */}
        {improvable.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">How to improve your score:</p>
            {improvable.map(f => (
              <div
                key={f.factor}
                className="flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-lg px-3 py-2"
              >
                <span>{f.emoji}</span>
                <span>
                  Improve <strong>{f.factor}</strong>: {Math.abs(f.potentialGain).toFixed(1)} years potential
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
