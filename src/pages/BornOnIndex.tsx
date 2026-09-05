import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { Calendar } from 'lucide-react';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_DAYS = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1920 + 1 }, (_, i) => CURRENT_YEAR - i);

// Compact month/day/year selector — lets a visitor jump straight to their full
// birthday report (Task 2C: year dropdown 1920 → current year).
function BirthdayJump() {
  const navigate = useNavigate();
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [year, setYear] = useState(CURRENT_YEAR - 25);
  const maxDay = MONTH_DAYS[month];
  const safeDay = Math.min(day, maxDay);
  const go = () => {
    const dob = `${year}-${String(month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
    navigate(`/birthday-report?dob=${dob}`);
  };
  const selectClass =
    'h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground';
  return (
    <div className="mb-10 bg-card/60 border border-border rounded-xl p-5">
      <h2 className="font-semibold text-lg text-foreground mb-3">Find your exact birthday</h2>
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Month"
          data-testid="bornon-month-select"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className={selectClass}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{MONTH_NAMES[m]}</option>
          ))}
        </select>
        <select
          aria-label="Day"
          data-testid="bornon-day-select"
          value={safeDay}
          onChange={(e) => setDay(Number(e.target.value))}
          className={selectClass}
        >
          {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          aria-label="Year"
          data-testid="bornon-year-select"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className={selectClass}
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button
          onClick={go}
          data-testid="bornon-jump-btn"
          className="h-11 px-5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          Go
        </button>
      </div>
    </div>
  );
}

export default function BornOnIndex() {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Celebrities Born On — Browse by Birthday | BornClock"
        description="Browse all famous people by birthday. Select any date from January 1 to December 31 to see celebrities born on that day, their zodiac sign, and birthday insights."
        canonicalUrl="/born-on"
        ogType="website"
        ogImage="https://bornclock.com/og/born-on.png"
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>›</span>
          <span className="text-foreground">Born On</span>
        </nav>

        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-7 h-7 text-primary" />
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Celebrities Born On
          </h1>
        </div>
        <p className="text-muted-foreground mb-10">
          Browse famous birthdays by date — from January 1 to December 31, including February 29.
        </p>

        <BirthdayJump />

        <div className="space-y-8">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
            <div key={month}>
              <h2 className="font-semibold text-xl text-foreground mb-3 border-b border-border pb-2">
                {MONTH_NAMES[month]}
              </h2>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: MONTH_DAYS[month] }, (_, d) => d + 1).map(day => (
                  <Link
                    key={day}
                    to={`/born-on/${MONTH_NAMES[month].toLowerCase()}-${day}`}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border text-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  >
                    {day}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
          <h2 className="font-bold text-xl text-foreground mb-2">Know your birthday?</h2>
          <p className="text-muted-foreground mb-4">
            Get your full birthday report — celebrity matches, zodiac deep-dive, numerology, and more.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
          >
            Generate my birthday report
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
