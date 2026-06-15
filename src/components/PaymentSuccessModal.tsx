import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PaymentSuccessModalProps {
  onClose: () => void;
  billing: 'monthly' | 'annual';
}

export function PaymentSuccessModal({ onClose, billing: _billing }: PaymentSuccessModalProps) {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const confettiItems = Array.from({ length: 40 }, (_, i) => ({
    left: `${(i * 37 + 13) % 100}%`,
    top: `${(i * 61 + 7) % 100}%`,
    delay: `${(i * 0.07) % 2}s`,
    emoji: ['🎉', '⭐', '🎊', '✨', '🎂'][i % 5],
  }));

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {confettiItems.map((item, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-bounce"
              style={{
                left: item.left,
                top: item.top,
                animationDelay: item.delay,
              }}
            >
              {item.emoji}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center relative shadow-2xl z-10">
        <div className="text-6xl mb-4">🎉</div>

        <h2 className="text-2xl font-black mb-2">Welcome to BornClock Premium!</h2>

        <p className="text-gray-600 mb-6">Your premium access is now active.</p>

        <ul className="text-left space-y-2 mb-6">
          {[
            '🔬 What-If Simulator — unlocked',
            '🤖 AI Longevity Coach — unlocked',
            '🧬 Biological Blueprint — unlocked',
            '👨‍👩‍👧 Family Dashboard — unlocked',
            '📄 Birthday Reports (3/month) — unlocked',
            '🌍 Country Comparison — unlocked',
          ].map(f => (
            <li key={f} className="text-sm text-gray-700 flex items-center gap-2">
              {f}
            </li>
          ))}
        </ul>

        <p className="text-xs text-gray-400 mb-6">
          A confirmation has been sent to your email address.
        </p>

        <button
          onClick={() => {
            onClose();
            navigate('/life-expectancy');
          }}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors mb-3"
        >
          Start Exploring Premium →
        </button>

        <button
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Stay on this page
        </button>
      </div>
    </div>
  );
}
