import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, RefreshCw } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { LongevityResult, calculateLongevityScore } from '@/services/LongevityCalculationService';
import { saveWeeklyScore, getScoreHistory, ScoreEntry } from '@/services/LongevityScoreService';

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
  const [history, setHistory] = useState<ScoreEntry[]>([]);
  const score = calculateLongevityScore(result);

  useEffect(() => {
    if (userId) {
      saveWeeklyScore(userId, score, result.totalForecast);
      if (isPremium) {
        getScoreHistory(userId, 12).then(setHistory);
      }
    }
  }, [userId, score, result.totalForecast, isPremium]);

  const improvable = result.factorBreakdown
    .filter(f => f.currentImpact < 0)
    .sort((a, b) => a.currentImpact - b.currentImpact)
    .slice(0, 3);

  const chartData = history.map(h => ({
    week: h.week_start.slice(5),
    score: h.score,
  }));

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

        {/* Score history chart */}
        {isPremium && chartData.length > 1 ? (
          <div className="mb-6">
            <p className="text-xs font-medium text-muted-foreground mb-2">Score over time</p>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={chartData}>
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={28} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(v: number) => [v, 'Score']}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : !isPremium ? (
          <div className="mb-6 rounded-xl bg-muted/40 border border-border flex items-center justify-center h-28 text-center px-4">
            <div>
              <p className="text-sm text-muted-foreground">📈 Track your score over time</p>
              <p className="text-xs text-muted-foreground mb-2">Premium feature</p>
              <Link to="/upgrade" className="text-xs text-indigo-600 font-medium hover:underline">
                Upgrade →
              </Link>
            </div>
          </div>
        ) : null}

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
