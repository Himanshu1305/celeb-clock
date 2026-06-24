import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface PaywallModalProps {
  forecast: number;
  remainingYears: number;
  onClose: () => void;
}

export function PaywallModal({
  forecast,
  remainingYears,
  onClose,
}: PaywallModalProps) {
  const navigate = useNavigate();
  const { isInTrial } = useAuth();
  const trialUsed = localStorage.getItem('bornclock_trial_used');
  const hasExpiredTrial = !isInTrial && !!trialUsed;

  const handleUpgrade = () => {
    onClose();
    navigate('/upgrade');
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            Your Longevity Forecast
          </div>
          <div className="text-5xl font-black text-blue-600 mb-1">
            {forecast.toFixed(1)}
          </div>
          <div className="text-gray-500 text-sm">
            years · {remainingYears.toFixed(1)} years remaining
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Unlock your complete longevity blueprint:
          </p>
          <div className="space-y-3">
            {[
              { icon: '📅', title: 'Your Personalised 90-Day Plan', desc: 'Week-by-week actions specific to your health profile — not a generic plan' },
              { icon: '🔬', title: 'What-If Simulator', desc: 'See the exact years each lifestyle change adds to your forecast' },
              { icon: '🧬', title: 'Biological Blueprint', desc: 'Full 3-pillar breakdown: genetics, epigenetics & community' },
              { icon: '🌟', title: 'Cultural Horizon', desc: 'Icons who share your longevity path and what you can learn from them' },
              { icon: '🤖', title: 'AI Longevity Coach', desc: 'Chat with an AI that knows your exact health data' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleUpgrade}
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors mb-3"
        >
          {isInTrial ? 'Keep My Premium Access →' : 'Get Full Access →'}
        </button>

        <p className="text-xs text-gray-400 text-center mb-3">
          {isInTrial
            ? 'Trial ends soon · then ₹299/month or ₹2,499/year'
            : '₹299/month · or ₹2,499/year (save ₹1,089)'}
        </p>

        <button
          onClick={onClose}
          className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Maybe later — I'll keep the blurred version
        </button>
      </div>
    </div>
  );
}
