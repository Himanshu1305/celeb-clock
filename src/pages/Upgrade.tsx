import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SEO } from '@/components/SEO';
import PageTagline from '@/components/PageTagline';
import {
  detectCountry,
  formatPrice,
  type CountryInfo,
} from '@/services/CountryDetectionService';
import { initiateSubscription } from '@/services/RazorpayService';
import { PaymentSuccessModal } from '@/components/PaymentSuccessModal';
import { PromoCodeInput } from '@/components/PromoCodeInput';
import { Check, Shield, Star } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function Upgrade() {
  const { user, isPremium, isInTrial, trialDaysRemaining } = useAuth();
  const navigate = useNavigate();
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [loadingBilling, setLoadingBilling] = useState<'monthly' | 'annual' | null>(null);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastBilling, setLastBilling] = useState<'monthly' | 'annual'>('annual');
  const [detecting, setDetecting] = useState(true);

  useEffect(() => {
    detectCountry().then(info => {
      setCountryInfo(info);
      setDetecting(false);
    });
  }, []);

  const handleSubscribe = async (billingType: 'monthly' | 'annual') => {
    if (!user || !countryInfo) return;
    setLoadingBilling(billingType);
    setLastBilling(billingType);
    setError('');

    await initiateSubscription({
      billing: billingType,
      countryInfo,
      userEmail: user.email || '',
      userName: user.user_metadata?.full_name,
      userId: user.id,
      onSuccess: () => {
        setLoadingBilling(null);
        setShowSuccess(true);
      },
      onError: err => {
        setLoadingBilling(null);
        setError(err);
      },
      onDismiss: () => {
        setLoadingBilling(null);
      },
    });
  };

  const isPaidPremium = isPremium && !isInTrial;

  const monthlyPrice = countryInfo ? formatPrice(countryInfo, 'monthly') : null;
  const annualPrice = countryInfo ? formatPrice(countryInfo, 'annual') : null;

  const premiumFeatures = [
    'Full 8-step longevity calculator',
    'What-If Simulator (25+ factors)',
    'AI Longevity Coach chat',
    'Biological Blueprint report',
    'Cultural Horizon',
    'Family dashboard (10 members)',
    'Birthday report credits (1/month · rollover · cap 3)',
    'Longevity leaderboard',
    'Country comparison (57 countries)',
    'Downloadable PDF reports',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
        </header>
      </div>

      <SEO
        title="Upgrade to BornClock Premium | BornClock"
        description="Unlock your complete longevity blueprint. What-If Simulator, AI Coach, Family Dashboard, Birthday Reports and more."
        canonicalUrl="/upgrade"
        noindex
      />

      {showSuccess && (
        <PaymentSuccessModal
          billing={lastBilling}
          onClose={() => {
            setShowSuccess(false);
            window.location.reload();
          }}
        />
      )}

      {isPaidPremium ? (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⭐</div>
            <h1 className="text-2xl font-bold mb-2">You're Already Premium</h1>
            <p className="text-gray-600 mb-6">
              You have full access to all BornClock premium features.
            </p>
            <button
              onClick={() => navigate('/life-expectancy')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Continue to Longevity Calculator →
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 py-8 pb-16">
          {/* Hero */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Unlock BornClock Premium
            </h1>
            <PageTagline />
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              Science-backed tools to understand and extend your healthspan
            </p>
            <p className="text-indigo-700 font-medium mt-3">
              Subscribers get one birthday report credit every month — unlock any report, gift it to anyone.
            </p>
          </div>

          {/* Trial banner */}
          {isInTrial && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-center">
              <p className="text-amber-800 font-medium">
                🎁 You have{' '}
                <strong>{trialDaysRemaining} days</strong> left in your free trial. Upgrade now to
                keep uninterrupted access.
              </p>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-800 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="underline text-red-600 text-xs ml-4">
                Dismiss
              </button>
            </div>
          )}

          {/* 3-card pricing grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

            {/* Free card */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 flex flex-col">
              <div className="text-lg font-bold text-gray-700 mb-1">Free</div>
              <div className="text-4xl font-black text-gray-900 mb-1">₹0</div>
              <div className="text-gray-400 text-sm mb-5">forever</div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {[
                  'Celebrity birthday twin (1/day)',
                  'Zodiac sign & birthstone',
                  'Life path number',
                  'Planetary age calculator',
                  "Today's birthdays page",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={14} className="text-gray-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Continue Free
              </button>
            </div>

            {/* Monthly Premium card */}
            <div className="bg-white rounded-2xl border-2 border-indigo-200 p-6 flex flex-col">
              <div className="text-lg font-bold text-indigo-600 mb-1">Premium Monthly</div>
              {detecting ? (
                <div className="text-4xl font-black text-gray-300 mb-1">...</div>
              ) : (
                <>
                  <div className="text-4xl font-black text-gray-900 mb-1">
                    {monthlyPrice?.amount}
                  </div>
                  <div className="text-gray-400 text-sm mb-5">{monthlyPrice?.period}</div>
                </>
              )}
              <ul className="space-y-2 mb-6 flex-1">
                {premiumFeatures.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={14} className="text-indigo-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe('monthly')}
                disabled={loadingBilling !== null || detecting || !user}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingBilling === 'monthly' ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Opening checkout...
                  </span>
                ) : !user ? (
                  'Sign in to Subscribe'
                ) : detecting ? (
                  'Loading...'
                ) : (
                  'Subscribe Monthly'
                )}
              </button>
              <p className="text-gray-400 text-xs text-center mt-2">Cancel anytime</p>
            </div>

            {/* Annual Premium card */}
            <div className="bg-indigo-600 rounded-2xl border-2 border-indigo-600 p-6 text-white flex flex-col relative">
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Star size={10} />
                BEST VALUE
              </div>

              <div className="text-lg font-bold text-indigo-200 mb-1">Premium Annual</div>
              {detecting ? (
                <div className="text-4xl font-black text-white/50 mb-1">...</div>
              ) : (
                <>
                  <div className="text-4xl font-black mb-1">{annualPrice?.amount}</div>
                  <div className="text-indigo-200 text-sm mb-1">{annualPrice?.period}</div>
                  {annualPrice?.saving && (
                    <div className="text-green-300 text-sm font-semibold mb-4">
                      {annualPrice.saving}
                    </div>
                  )}
                </>
              )}

              <ul className="space-y-2 mb-6 flex-1 mt-2">
                {premiumFeatures.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-indigo-100">
                    <Check size={14} className="text-green-300 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe('annual')}
                disabled={loadingBilling !== null || detecting || !user}
                className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingBilling === 'annual' ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    Opening checkout...
                  </span>
                ) : !user ? (
                  'Sign in to Subscribe'
                ) : detecting ? (
                  'Loading...'
                ) : (
                  'Subscribe Annual'
                )}
              </button>

              {!user && (
                <button
                  onClick={() => navigate('/auth?redirect=/upgrade')}
                  className="w-full mt-2 py-2 text-indigo-200 text-sm underline"
                >
                  Sign in first →
                </button>
              )}

              <p className="text-indigo-300 text-xs text-center mt-3">
                7-day money-back guarantee · Cancel anytime
              </p>
            </div>
          </div>

          {/* Features detail */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
              Everything in Premium
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: '🔬',
                  title: 'What-If Simulator',
                  desc: 'Adjust 25+ lifestyle factors and watch your longevity forecast update in real time. See exactly which habits add the most years.',
                },
                {
                  icon: '🤖',
                  title: 'AI Longevity Coach',
                  desc: 'Chat with an AI that knows your exact health profile and biomarkers. Personalized, science-backed advice.',
                },
                {
                  icon: '🧬',
                  title: 'Biological Blueprint',
                  desc: 'Your complete 3-pillar longevity analysis with genetics, health habits, and community factors. Downloadable PDF.',
                },
                {
                  icon: '👨‍👩‍👧',
                  title: 'Family Dashboard',
                  desc: 'Add up to 10 family members and compare longevity forecasts. Start the health conversation your family needs.',
                },
                {
                  icon: '🌍',
                  title: 'Country Comparison',
                  desc: 'See how your forecast changes across 57 countries using UN WPP 2024 data. Your Japanese counterpart might outlive you by 8 years.',
                },
                {
                  icon: '📄',
                  title: 'Birthday Reports',
                  desc: 'Generate complete 8-page birthday personality and longevity PDFs. One credit per month, rolls over up to 3.',
                },
              ].map(feature => (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl border border-gray-200 p-5"
                >
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <div className="font-semibold text-gray-900 mb-1">{feature.title}</div>
                  <div className="text-sm text-gray-600">{feature.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Social proof stats */}
          <div className="grid grid-cols-3 gap-4 mb-8 text-center">
            {[
              { num: '25,952', label: 'celebrities in database' },
              { num: '57', label: 'countries with UN data' },
              { num: '169', label: 'automated accuracy tests' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border p-4">
                <div className="text-2xl font-black text-indigo-600">{stat.num}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              {
                quote:
                  'The What-If Simulator showed me that quitting smoking would add 8.3 years to my forecast. That made it feel real.',
                user: 'Premium user, India',
              },
              {
                quote:
                  "I discovered I'm biologically 6 years younger than my chronological age. BornClock made me care about maintaining that.",
                user: 'Premium user, USA',
              },
              {
                quote:
                  "The family dashboard showed my parents' forecasts alongside mine. Best health conversation we've ever had.",
                user: 'Premium user, UK',
              },
            ].map(t => (
              <div key={t.user} className="bg-white rounded-xl border p-5">
                <p className="text-sm text-gray-700 italic mb-3">"{t.quote}"</p>
                <p className="text-xs text-gray-400">— {t.user}</p>
              </div>
            ))}
          </div>

          {/* Guarantee */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8 flex items-start gap-3">
            <Shield className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <div className="font-semibold text-green-900 mb-1">
                7-Day Money-Back Guarantee
              </div>
              <div className="text-sm text-green-800">
                Try premium risk-free. If you're not satisfied within 7 days of your first payment,
                email{' '}
                <a href="mailto:hello@bornclock.com" className="underline">
                  hello@bornclock.com
                </a>{' '}
                for a full refund. No questions asked.
              </div>
            </div>
          </div>

          {/* Promo code */}
          {user && (
            <div className="bg-gray-50 border rounded-xl p-5">
              <p className="font-medium text-gray-700 mb-3">Have a promo code?</p>
              <PromoCodeInput userId={user.id} onSuccess={() => navigate('/')} />
            </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
}
