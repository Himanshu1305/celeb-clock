import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Check, X, Gift, Shield, ArrowRight, Repeat } from 'lucide-react';
import { detectCountry, formatPrice, type CountryInfo } from '@/services/CountryDetectionService';
import { REPORT_SECTION_COUNT } from '@/lib/reportFacts';
import { reportPrice as reportPriceFor, resolveCurrency } from '@/lib/pricing';

// Indexable pricing/comparison page (distinct from the login-gated /upgrade
// conversion page). Every benefit below is drawn from the REAL feature set:
// free/premium lists mirror src/pages/Upgrade.tsx; report price ₹199 / $6.99 for
// everyone (api/create-order.ts) — subscribers unlock free via credits, not a
// cash member rate; credits 3/month, carry-forward, cap 9 from api/get-credits.ts.

const FREE_FEATURES = [
  'Celebrity birthday twin (1/day)',
  'Zodiac sign & birthstone',
  'Life path number',
  'Planetary age calculator',
  "Today's birthdays page",
];

// [label, freeIncluded]
const COMPARISON: Array<[string, boolean]> = [
  ['Celebrity birthday twins', true],
  ['Zodiac, birthstone & life path', true],
  ['Planetary age calculator', true],
  ['Full 8-step longevity calculator', false],
  ['What-If Simulator (25+ factors)', false],
  ['AI Longevity Coach chat', false],
  ['Biological Blueprint report', false],
  ['Cultural Horizon', false],
  ['Family dashboard (up to 10 members)', false],
  ['Country comparison (57 countries)', false],
  ['Longevity leaderboard', false],
  ['Downloadable PDF reports', false],
  ['Birthday report credits (3/month · rollover · cap 9)', false],
];

export default function Pricing() {
  const [country, setCountry] = useState<CountryInfo | null>(null);
  useEffect(() => { detectCountry().then(setCountry).catch(() => {}); }, []);

  const isIndia = country?.isIndia ?? true;
  const currency = resolveCurrency(country?.currency);
  const monthly = country ? formatPrice(country, 'monthly') : { amount: '₹299', period: '/month' };
  const reportPrice = reportPriceFor(currency);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Pricing — Free Forever, Premium When You Want More | BornClock"
        description="BornClock pricing: a free birthday & age toolkit forever, optional Premium for the full longevity suite, and a one-time ₹199 Birthday Blueprint. Premium members get 3 birthday report credits a month with carry-forward."
        keywords="bornclock pricing, birthday report price, longevity calculator subscription, premium plan"
        canonicalUrl="/pricing"
      />
      <div className="container mx-auto px-4 py-6">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-3">
            Simple pricing. Free forever, premium when you want more.
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            The birthday and age tools are free for everyone. Upgrade for the full science-backed
            longevity suite, or buy a one-time Birthday Blueprint to gift.
          </p>
        </div>

        {/* Three offers */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {/* Free */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 flex flex-col">
            <div className="text-lg font-bold text-gray-700 mb-1">Free</div>
            <div className="text-4xl font-black text-gray-900 mb-1">{isIndia ? '₹0' : '$0'}</div>
            <div className="text-gray-400 text-sm mb-5">forever</div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={14} className="text-gray-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="w-full"><Link to="/">Start free</Link></Button>
          </div>

          {/* Premium */}
          <div className="bg-white rounded-2xl border-2 border-indigo-300 p-6 flex flex-col relative shadow-md">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
            <div className="text-lg font-bold text-indigo-600 mb-1">Premium</div>
            <div className="text-4xl font-black text-gray-900 mb-1">{monthly.amount}</div>
            <div className="text-gray-400 text-sm mb-5">{monthly.period} · cancel anytime</div>
            <ul className="space-y-2 mb-6 flex-1">
              {['Everything in Free', 'Full longevity suite & AI coach', 'Family dashboard & country comparison',
                'Downloadable PDF reports'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check size={14} className="text-indigo-500 flex-shrink-0" /> {f}
                </li>
              ))}
              <li className="flex items-start gap-2 text-sm font-semibold text-indigo-700">
                <Repeat size={14} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                3 birthday report credits per month — auto-applied, roll over, stack up to 9
              </li>
            </ul>
            <Button asChild className="w-full"><Link to="/upgrade">Go Premium <ArrowRight className="w-4 h-4 ml-1" /></Link></Button>
          </div>

          {/* Birthday Report */}
          <div className="bg-white rounded-2xl border-2 border-amber-200 p-6 flex flex-col">
            <div className="flex items-center gap-1.5 text-lg font-bold text-amber-700 mb-1"><Gift size={16} /> Birthday Blueprint</div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-black text-gray-900">{reportPrice}</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">Launch price</span>
            </div>
            <div className="text-gray-400 text-sm mb-5">one-time · or free with Premium credits</div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {['Print-ready personalised PDF', `${REPORT_SECTION_COUNT} sections, one birth date`,
                'Celebrity twins, zodiac, numerology, tarot', 'Print it or gift it'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={14} className="text-amber-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="w-full border-amber-300"><Link to="/birthday-report">Create a report</Link></Button>
          </div>
        </div>

        {/* Full comparison table */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Free vs Premium — full comparison</h2>
        <div className="bg-white rounded-2xl border overflow-hidden mb-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Feature</th>
                <th className="text-center font-semibold text-gray-700 px-4 py-3 w-24">Free</th>
                <th className="text-center font-semibold text-indigo-700 px-4 py-3 w-28">Premium</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(([label, free], i) => (
                <tr key={label} className={i % 2 ? 'bg-gray-50/50' : ''}>
                  <td className="px-4 py-3 text-gray-700">{label}</td>
                  <td className="px-4 py-3 text-center">
                    {free ? <Check size={16} className="text-green-600 inline" /> : <X size={16} className="text-gray-300 inline" />}
                  </td>
                  <td className="px-4 py-3 text-center"><Check size={16} className="text-indigo-600 inline" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Credits explainer */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 flex items-start gap-3">
          <Repeat className="text-indigo-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <div className="font-semibold text-indigo-900 mb-1">How birthday report credits work</div>
            <div className="text-sm text-indigo-800">
              Premium members earn <strong>three birthday report credits each month</strong>. Unused credits
              <strong> carry forward</strong> and stack up to a maximum of 9 — so you can save them up and
              gift several reports at once. Each credit unlocks one full Birthday Blueprint, and for members
              a credit is <strong>applied automatically</strong> when you open a locked report.
            </div>
          </div>
        </div>

        {/* Trust */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8 flex items-start gap-3">
          <Shield className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <div className="font-semibold text-green-900 mb-1">7-day money-back guarantee — full refund, no questions.</div>
            <div className="text-sm text-green-800">
              Reports and subscriptions are risk-free for 7 days. Email{' '}
              <a href="mailto:hello@bornclock.com" className="underline">hello@bornclock.com</a> within 7 days of purchase for a full refund.
            </div>
          </div>
        </div>

        {/* Refund FAQ */}
        <div className="bg-white border rounded-2xl p-5 mb-8">
          <div className="font-semibold text-gray-900 mb-1">What if I don't like it?</div>
          <div className="text-sm text-gray-600">
            Email <a href="mailto:hello@bornclock.com" className="text-indigo-600 underline">hello@bornclock.com</a> within
            7 days of purchase for a full refund.
          </div>
        </div>

        <div className="text-center">
          <Button asChild size="lg"><Link to="/upgrade">Compare plans &amp; subscribe <ArrowRight className="w-4 h-4 ml-1" /></Link></Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
