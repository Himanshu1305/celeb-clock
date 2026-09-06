import { useParams, Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { calculateWesternZodiac } from '@/utils/celebrityCalculations';
import { WESTERN_ZODIAC_PROFILES } from '@/data/astrologicalData';
import celebritiesData from '@/data/celebrities.json';

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const MONTH_TITLE = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const pad = (n: number) => String(n).padStart(2, '0');
const reduceNum = (n: number): number => { while (n > 9) n = String(n).split('').reduce((a, c) => a + Number(c), 0); return n; };

export default function DatePersonalityPage() {
  const { month, day } = useParams<{ month: string; day: string }>();
  const monthIdx = MONTHS.indexOf((month || '').toLowerCase());
  const dayNum = Number(day);
  const valid = monthIdx >= 0 && Number.isFinite(dayNum) && dayNum >= 1 && dayNum <= 31;

  if (!valid) {
    return (
      <div data-testid="personality-page" className="min-h-screen bg-gradient-cosmic">
        <SEO title="Birthday Personality | BornClock" description="Discover the personality of any birth date." canonicalUrl="/born-in" />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <header className="flex justify-between items-center mb-8"><Navigation /><AuthNav /></header>
          <h1 className="text-2xl font-bold text-foreground">Birthday Personality</h1>
          <p className="text-muted-foreground mt-2">Pick a valid date to see its personality profile.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const monthNum = monthIdx + 1;
  const monthName = MONTH_TITLE[monthIdx];
  const zodiac = calculateWesternZodiac(dayNum, monthNum);
  const profile = WESTERN_ZODIAC_PROFILES[zodiac.sign];
  const birthNumber = reduceNum(dayNum);
  const md = `${pad(monthNum)}-${pad(dayNum)}`;
  const celebs = (celebritiesData.celebrities as Array<{ name: string; slug: string; birth_month_day?: string | null }>)
    .filter(c => c.birth_month_day === md).slice(0, 6);

  return (
    <div data-testid="personality-page" className="min-h-screen bg-gradient-cosmic">
      <SEO
        title={`Born on ${monthName} ${dayNum}? Personality & Traits | BornClock`}
        description={`The personality of people born on ${monthName} ${dayNum} — ${zodiac.sign} zodiac traits, birth number ${birthNumber}, famous birthdays and what your birth date says about you.`}
        canonicalUrl={`/born-on/${month}/${dayNum}/personality`}
      />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="flex justify-between items-center mb-8"><Navigation /><AuthNav /></header>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
          Born on {monthName} {dayNum}: Personality
        </h1>
        <p className="text-muted-foreground mb-6">
          {zodiac.symbol} {zodiac.sign} · Birth Number {birthNumber}
        </p>

        <div className="rounded-xl border border-border p-4 mb-4">
          <h2 className="font-semibold text-foreground mb-1">Your {zodiac.sign} nature</h2>
          <p className="text-muted-foreground">{profile?.personality_summary || zodiac.traits}</p>
        </div>

        <div className="rounded-xl border border-border p-4 mb-4">
          <h2 className="font-semibold text-foreground mb-1">Birth Number {birthNumber}</h2>
          <p className="text-muted-foreground">
            The day of the month you were born ({dayNum}) reduces to Birth Number {birthNumber}, one influence on your temperament. Your full Life Path comes from your complete birth date.
          </p>
        </div>

        {celebs.length > 0 && (
          <div className="rounded-xl border border-border p-4 mb-4">
            <h2 className="font-semibold text-foreground mb-2">Famous people born on {monthName} {dayNum}</h2>
            <div className="flex flex-wrap gap-2">
              {celebs.map(c => (
                <Link key={c.slug} to={`/celebrity/${c.slug}/`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
          <p className="text-muted-foreground mb-3">Get the full picture of your birth date</p>
          <Link to={`/birthday-report?dob=1990-${pad(monthNum)}-${pad(dayNum)}`} className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">
            Get your Birthday Report →
          </Link>
        </div>

        <p className="mt-6 text-sm">
          <Link to={`/born-on/${month}-${dayNum}`} className="text-primary hover:underline">See everyone born on {monthName} {dayNum} →</Link>
        </p>
      </div>
      <Footer />
    </div>
  );
}
