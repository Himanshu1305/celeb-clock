import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { calculateWesternZodiac, calculateLifePathNumber } from '@/utils/celebrityCalculations';
import { BirthdayFactsCard } from '@/components/BirthdayFactsCard';
import { findCelebrityByBirthday } from '@/data/celebrities';

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
  const [twin, setTwin] = useState<string | undefined>(undefined);

  const canGenerate = name.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(dob);

  const handleGenerate = () => {
    const w = buildWish(name, dob);
    if (w) setWish(w);
  };
  const handleReset = () => { setWish(null); setTwin(undefined); };

  // Fetch the most notable birthday twin for the card (best-effort; card renders without it).
  useEffect(() => {
    if (!wish) return;
    let cancelled = false;
    findCelebrityByBirthday(new Date(dob + 'T12:00:00'))
      .then((list) => { if (!cancelled && list?.length) setTwin(list[0].name); })
      .catch(() => { /* no twin — card still shows the other facts */ });
    return () => { cancelled = true; };
  }, [wish, dob]);

  const shareText = wish
    ? `Happy Birthday ${wish.name}! You're a ${wish.sign} with Life Path ${wish.lifePath}. Here's your birthday card — make your own at https://bornclock.com/wish`
    : '';
  // encodeURIComponent leaves apostrophes raw — encode them too for clean URLs.
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText).replace(/'/g, '%27')}`;

  return (
    <ToolLayout
      theme="neutral"
      testId="birthday-wish-page"
      seo={(
        <SEO
          title="Free Birthday Wish Card Maker — Send a Wish | BornClock"
          description="Create a personalised birthday wish card in seconds — with their zodiac sign and Life Path number — and share it on WhatsApp. Free, no signup."
          canonicalUrl="/wish"
          ogType="website"
        />
      )}
      breadcrumb={{ current: 'Birthday Wish' }}
      h1="Birthday Wish Card Maker"
      lead={<>Make a beautiful birthday card for a friend — with their zodiac and Life Path — and share it on WhatsApp in one tap.</>}
    >
      <div className="container mx-auto px-4 py-8 max-w-2xl">
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
                <div data-testid="wish-card">
                  <BirthdayFactsCard name={wish.name} birthDate={new Date(dob + 'T12:00:00')} celebrityTwin={twin} />
                </div>
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
    </ToolLayout>
  );
}
