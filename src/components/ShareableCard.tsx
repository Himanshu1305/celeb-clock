import { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { differenceInDays, differenceInYears } from 'date-fns';
import html2canvas from 'html2canvas';
import { calculateLifePath } from '@/components/NumerologyLifePath';

const getZodiacSign = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const signs = [
    { sign: '♒ Aquarius', start: [1, 20], end: [2, 18] },
    { sign: '♓ Pisces', start: [2, 19], end: [3, 20] },
    { sign: '♈ Aries', start: [3, 21], end: [4, 19] },
    { sign: '♉ Taurus', start: [4, 20], end: [5, 20] },
    { sign: '♊ Gemini', start: [5, 21], end: [6, 20] },
    { sign: '♋ Cancer', start: [6, 21], end: [7, 22] },
    { sign: '♌ Leo', start: [7, 23], end: [8, 22] },
    { sign: '♍ Virgo', start: [8, 23], end: [9, 22] },
    { sign: '♎ Libra', start: [9, 23], end: [10, 22] },
    { sign: '♏ Scorpio', start: [10, 23], end: [11, 21] },
    { sign: '♐ Sagittarius', start: [11, 22], end: [12, 21] },
    { sign: '♑ Capricorn', start: [12, 22], end: [1, 19] },
  ];
  for (const s of signs) {
    if (
      (month === s.start[0] && day >= s.start[1]) ||
      (month === s.end[0] && day <= s.end[1])
    ) return s.sign;
  }
  return '♑ Capricorn';
};

interface ShareableCardProps {
  birthDate: Date;
}

export const ShareableCard = ({ birthDate }: ShareableCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const years = differenceInYears(new Date(), birthDate);
  const totalDays = differenceInDays(new Date(), birthDate);
  const zodiac = getZodiacSign(birthDate);
  const lifePath = calculateLifePath(birthDate);

  const captureCard = async (): Promise<HTMLCanvasElement | null> => {
    if (!cardRef.current) return null;
    return html2canvas(cardRef.current, { scale: 3, useCORS: true });
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const canvas = await captureCard();
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = 'my-age-card.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      const canvas = await captureCard();
      if (!canvas) return;
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'my-age-card.png', { type: 'image/png' });
        if (navigator.share) {
          await navigator.share({ title: 'My Age Card', files: [file] });
        } else {
          // fallback: download
          const link = document.createElement('a');
          link.download = 'my-age-card.png';
          link.href = URL.createObjectURL(blob);
          link.click();
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold gradient-text-primary">📸 Your Shareable Age Card</h2>
          <p className="text-muted-foreground">Download or share your personalized card on social media</p>
        </div>

        {/* The card to capture */}
        <div className="flex justify-center">
          <div
            ref={cardRef}
            className="w-full max-w-[600px] aspect-[1200/630] rounded-2xl p-8 flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, hsl(214 84% 36%), hsl(174 44% 47%), hsl(214 84% 46%))',
              color: 'white',
            }}
          >
            <div>
              <p className="text-sm font-medium opacity-80">celeb-clock.lovable.app</p>
            </div>
            <div className="text-center space-y-3">
              <p className="text-5xl font-extrabold">{years} Years Old</p>
              <p className="text-xl font-medium opacity-90">{totalDays.toLocaleString()} days on Earth</p>
            </div>
            <div className="flex justify-between text-sm font-medium opacity-90">
              <span>{zodiac}</span>
              <span>Life Path #{lifePath}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button onClick={handleDownload} disabled={loading} className="gap-2">
            <Download className="w-4 h-4" />
            Download as Image
          </Button>
          <Button onClick={handleShare} disabled={loading} variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
