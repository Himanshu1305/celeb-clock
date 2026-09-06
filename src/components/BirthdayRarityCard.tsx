import { getBirthdayRarityScore } from '@/utils/birthdayStatistics';

const LABEL_COLOR: Record<string, string> = {
  'Rare': 'bg-purple-100 text-purple-800 border-purple-200',
  'Uncommon': 'bg-blue-100 text-blue-800 border-blue-200',
  'Common': 'bg-green-100 text-green-800 border-green-200',
  'Very Common': 'bg-amber-100 text-amber-800 border-amber-200',
};

export function BirthdayRarityCard({ month, day }: { month: number; day: number }) {
  const score = getBirthdayRarityScore(month, day);
  return (
    <div data-testid="birthday-rarity-card"
         className="rounded-xl border border-gray-200 bg-white p-4 my-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-600">🎂 Birthday Rarity</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${LABEL_COLOR[score.label]}`}>
          {score.label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-gray-900">{score.count}</span>
        <span className="text-sm text-gray-500">celebrities share this birthday</span>
      </div>
      <p className="text-sm text-gray-600 mt-1">{score.description}</p>
      <div className="mt-2 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${score.percentile}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1">Rarity percentile: {score.percentile}%</p>
    </div>
  );
}
