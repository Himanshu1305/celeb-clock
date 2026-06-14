import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, ArrowRight, Cake } from 'lucide-react';

const MONTHS = [
  { name: 'January',   slug: 'january',   days: 31, highlight: ['1', '8', '15', '17', '25'] },
  { name: 'February',  slug: 'february',  days: 28, highlight: ['2', '10', '14', '20', '27'] },
  { name: 'March',     slug: 'march',     days: 31, highlight: ['3', '14', '17', '21', '25'] },
  { name: 'April',     slug: 'april',     days: 30, highlight: ['1', '5', '12', '22', '30'] },
  { name: 'May',       slug: 'may',       days: 31, highlight: ['1', '10', '14', '25', '31'] },
  { name: 'June',      slug: 'june',      days: 30, highlight: ['4', '9', '13', '21', '25'] },
  { name: 'July',      slug: 'july',      days: 31, highlight: ['4', '7', '14', '22', '26'] },
  { name: 'August',    slug: 'august',    days: 31, highlight: ['4', '9', '15', '21', '26'] },
  { name: 'September', slug: 'september', days: 30, highlight: ['2', '11', '19', '23', '28'] },
  { name: 'October',   slug: 'october',   days: 31, highlight: ['3', '9', '14', '22', '31'] },
  { name: 'November',  slug: 'november',  days: 30, highlight: ['8', '11', '17', '22', '29'] },
  { name: 'December',  slug: 'december',  days: 31, highlight: ['10', '16', '21', '25', '31'] },
];

function daysInMonth(m: typeof MONTHS[0]) {
  return Array.from({ length: m.days }, (_, i) => String(i + 1));
}

export default function BirthdayHub() {
  const navigate = useNavigate();
  const [searchDay, setSearchDay] = useState('');
  const [searchMonth, setSearchMonth] = useState('');

  const today = new Date();
  const todaySlug = `${MONTHS[today.getMonth()].slug}-${today.getDate()}`;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const m = MONTHS.find(
      mo => mo.name.toLowerCase().startsWith(searchMonth.toLowerCase().trim().slice(0, 3))
    );
    const d = parseInt(searchDay);
    if (m && d >= 1 && d <= m.days) {
      navigate(`/birthday/${m.slug}-${d}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Celebrity Birthdays by Date — Every Day of the Year | BornClock"
        description="Browse famous celebrity birthdays for every day of the year. Find who shares your birthday, explore historical events, zodiac signs, and more for any date."
        keywords="celebrity birthdays by date, famous birthdays calendar, who was born on my birthday, celebrity birthdays list"
        canonicalUrl="/birthday"
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Hero */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Celebrity Birthdays — Every Day of the Year
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse famous birthdays for any date. Select a month and day to see who shares it with you.
          </p>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/todays-birthdays">
              <Cake className="h-4 w-4" />
              Today's Birthdays
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to={`/birthday/${todaySlug}`}>
              <Calendar className="h-4 w-4" />
              Dedicated page for today ({today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-2">
            <Link to="/">
              Find My Birthday Twin <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Date search */}
        <Card className="glass-card p-5 mb-10 max-w-md mx-auto">
          <p className="text-sm font-medium text-foreground mb-3">Jump to any date</p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Month (e.g. June)"
              value={searchMonth}
              onChange={e => setSearchMonth(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Day"
              type="number"
              min="1"
              max="31"
              value={searchDay}
              onChange={e => setSearchDay(e.target.value)}
              className="w-20"
            />
            <Button type="submit">Go</Button>
          </form>
        </Card>

        {/* Month sections */}
        <div className="space-y-8">
          {MONTHS.map(month => (
            <section key={month.slug}>
              <h2 className="text-xl font-bold text-foreground mb-3 pb-2 border-b border-border">
                {month.name}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {daysInMonth(month).map(day => {
                  const isHighlight = month.highlight.includes(day);
                  return (
                    <Link
                      key={day}
                      to={`/birthday/${month.slug}-${day}`}
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm transition-all hover:scale-110 ${
                        isHighlight
                          ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                          : 'bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {day}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Popular dates:</span>
                {month.highlight.map(d => (
                  <Link
                    key={d}
                    to={`/birthday/${month.slug}-${d}`}
                    className="text-xs text-primary hover:underline"
                  >
                    {month.name} {d}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/">
              Enter your birthday to find your celebrity twin <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
