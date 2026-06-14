import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { redeemPromoCode, PromoCodeResult } from '@/services/PromoCodeService';
import { Loader2, Tag, CheckCircle, XCircle } from 'lucide-react';

export interface PromoCodeInputProps {
  userId: string;
  onSuccess?: (result: PromoCodeResult) => void;
}

export function PromoCodeInput({ userId, onSuccess }: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PromoCodeResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    setResult(null);
    const res = await redeemPromoCode(code, userId);
    setResult(res);
    setLoading(false);
    if (res.success) {
      setShowConfetti(true);
      if (onSuccess) onSuccess(res);
      setTimeout(() => {
        setShowConfetti(false);
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <div className="relative">
      {/* Confetti animation */}
      {showConfetti && (
        <>
          <style>{`
            @keyframes confetti-fall {
              0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(120px) rotate(720deg); opacity: 0; }
            }
            .confetti-piece { animation: confetti-fall 1.5s ease-in forwards; }
          `}</style>
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10" aria-hidden="true">
            {['#f87171','#fbbf24','#34d399','#60a5fa','#a78bfa','#f472b6'].flatMap((color, ci) =>
              [0,1,2].map((j) => (
                <div
                  key={`${ci}-${j}`}
                  className="confetti-piece absolute w-2.5 h-2.5 rounded-sm"
                  style={{
                    backgroundColor: color,
                    left: `${10 + (ci * 15) + (j * 5)}%`,
                    top: 0,
                    animationDelay: `${(ci * 0.1 + j * 0.2)}s`,
                  }}
                />
              ))
            )}
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ENTER CODE"
            className="pl-9 font-mono tracking-widest uppercase"
            disabled={loading || (result?.success ?? false)}
            aria-label="Promo code"
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !code.trim() || (result?.success ?? false)}
          className="shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : result?.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            'Apply'
          )}
        </Button>
      </form>

      {result && (
        <div
          className={`mt-2 flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
            result.success
              ? 'bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
          role="alert"
        >
          {result.success ? (
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <span>{result.message}</span>
          {result.success && (
            <span className="text-xs opacity-70 ml-auto shrink-0">Refreshing…</span>
          )}
        </div>
      )}
    </div>
  );
}
