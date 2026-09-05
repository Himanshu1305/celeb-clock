import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { calculateWesternZodiac, calculateLifePathNumber } from '@/utils/celebrityCalculations';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

interface WishData {
  name: string;
  sign: string;
  lifePath: number;
  dateLabel: string;
}

function buildWish(name: string, dob: string): WishData | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const year = Number(m[1]), month = Number(m[2]), day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const sign = calculateWesternZodiac(day, month).sign;
  const lifePath = calculateLifePathNumber(day, month, year);
  return { name: name.trim(), sign, lifePath, dateLabel: `${MONTHS[month - 1]} ${day}` };
}

export default function BirthdayWishPage() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [wish, setWish] = useState<WishData | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imgSrc, setImgSrc] = useState<string>('');

  const canGenerate = name.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(dob);

  const handleGenerate = () => {
    const w = buildWish(name, dob);
    if (w) setWish(w);
  };
  const handleReset = () => { setWish(null); setImgSrc(''); };

  // Render a shareable card image to canvas (real browsers); guarded for jsdom.
  useEffect(() => {
    if (!wish) return;
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = 1080; canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
      grad.addColorStop(0, '#4f46e5'); grad.addColorStop(1, '#db2777');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 1080, 1080);
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
      ctx.font = 'bold 64px sans-serif';
      ctx.fillText('Happy Birthday', 540, 380);
      ctx.font = 'bold 88px sans-serif';
      ctx.fillText(wish.name.slice(0, 20), 540, 500);
      ctx.font = '44px sans-serif';
      ctx.fillText(`${wish.sign} · Life Path ${wish.lifePath}`, 540, 620);
      ctx.font = '36px sans-serif';
      ctx.fillText('bornclock.com', 540, 980);
      setImgSrc(canvas.toDataURL('image/png'));
    } catch {
      /* canvas unavailable (e.g. jsdom) — the styled card still renders. */
    }
  }, [wish]);

  const shareText = wish
    ? `Happy Birthday ${wish.name}! You're a ${wish.sign} with Life Path ${wish.lifePath}. Here's your birthday card — make your own at https://bornclock.com/wish`
    : '';
  // encodeURIComponent leaves apostrophes raw — encode them too for clean URLs.
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText).replace(/'/g, '%27')}`;

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Free Birthday Wish Card Maker — Send a Wish | BornClock"
        description="Create a personalised birthday wish card in seconds — with their zodiac sign and Life Path number — and share it on WhatsApp. Free, no signup."
        canonicalUrl="/wish"
        ogType="website"
      />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
          Birthday Wish Card Maker
        </h1>
        <p className="text-muted-foreground mb-8">
          Make a beautiful birthday card for a friend — with their zodiac and Life Path — and share it on WhatsApp in one tap.
        </p>

        {!wish ? (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block" htmlFor="wish-name">
                  Friend's name
                </label>
                <Input
                  id="wish-name"
                  data-testid="wish-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya"
                  maxLength={40}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block" htmlFor="wish-dob">
                  Their date of birth
                </label>
                <Input
                  id="wish-dob"
                  data-testid="wish-dob-input"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
              <Button
                data-testid="wish-generate-btn"
                className="w-full"
                disabled={!canGenerate}
                onClick={handleGenerate}
              >
                Generate birthday card
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div
                  data-testid="wish-card"
                  className="rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 to-pink-600 text-white text-center p-8"
                >
                  {imgSrc ? (
                    <img src={imgSrc} alt={`Birthday card for ${wish.name}`} className="w-full rounded-xl" />
                  ) : (
                    <>
                      <p className="text-lg font-semibold opacity-90">Happy Birthday</p>
                      <p className="text-3xl font-black my-3">{wish.name}</p>
                      <p className="opacity-90">{wish.dateLabel} · {wish.sign} · Life Path {wish.lifePath}</p>
                      <p className="mt-6 text-sm opacity-80">bornclock.com</p>
                    </>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <a
                data-testid="wish-whatsapp-share"
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white rounded-lg px-5 py-3 font-semibold hover:bg-green-700 transition-colors"
              >
                Share on WhatsApp
              </a>
              <Button data-testid="wish-reset-btn" variant="outline" onClick={handleReset}>
                Create Another
              </Button>
            </div>

            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-3">
                  Want the full picture — zodiac, numerology, and celebrity birthday twins?
                </p>
                <Button asChild>
                  <Link to={`/birthday-report?dob=${dob}`}>Get their full Birthday Report →</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
