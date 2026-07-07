import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import PageTagline from '@/components/PageTagline';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { generateReportData, saveReport } from '@/services/BirthdayReportService';
import { EmailService } from '@/services/EmailService';

// ── Constants ──────────────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  'Finding celebrity birthday twins...',
  'Calculating three zodiac profiles...',
  'Building numerology blueprint...',
  'Mapping cosmic planetary ages...',
  'Crafting your personalised report...',
];

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'UAE', 'Singapore', 'New Zealand',
  'South Africa', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal',
  'Malaysia', 'Philippines', 'Indonesia', 'Japan', 'South Korea',
  'Brazil', 'Mexico', 'Argentina', 'Nigeria', 'Kenya', 'Other',
];

const CHECKLIST_ITEMS = [
  'Celebrity birthday twins',
  'Historical events on this date',
  'Western zodiac deep-dive',
  'Chinese zodiac analysis',
  'Vedic rashi profile',
  'Zodiac compatibility guide',
  'Life path number + meaning',
  'Personal Year 2026 forecast',
  'Birthstone history & lore',
  'Age on all 7 planets',
  'Generation portrait',
  'Personalised gift message',
];

// ── Page component ────────────────────────────────────────────────────────────

const BirthdayReport = () => {
  const { user, isPremium, isAdmin, isInTrial, trialDaysRemaining } = useAuth();
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  const [recipientName, setRecipientName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('India');
  const [gifterName, setGifterName] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [phase, setPhase] = useState<'form' | 'loading' | 'success'>('form');
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [reportSlug, setReportSlug] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Progress animation
  useEffect(() => {
    if (phase !== 'loading') return;
    const startTime = Date.now();
    const duration = 4500;
    const id = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(88, (elapsed / duration) * 88));
      setMsgIndex(Math.floor(elapsed / 900) % LOADING_MESSAGES.length);
    }, 80);
    return () => clearInterval(id);
  }, [phase]);

  const reportUrl = reportSlug ? `${window.location.origin}/report/${reportSlug}` : '';

  const handleSubmit = async () => {
    if (!recipientName.trim()) { setError('Please enter the recipient\'s name.'); return; }
    if (!dob) { setError('Please enter the recipient\'s date of birth.'); return; }
    setError('');

    setPhase('loading');
    setProgress(0);
    setMsgIndex(0);

    try {
      const data = await generateReportData(
        recipientName.trim(),
        dob,
        gifterName.trim(),
        personalMessage.trim(),
        country
      );

      const slug = await saveReport(user?.id ?? null, data, isPremium, gender);

      if (!slug) {
        setError('Could not save report — please sign in and try again.');
        setPhase('form');
        return;
      }

      setProgress(100);
      setReportSlug(slug);

      // Fire-and-forget: send report link to the gifter's email (if signed in)
      if (user?.email && slug) {
        const reportLink = `${window.location.origin}/report/${slug}`;
        EmailService.sendReportCreated(user.email, gifterName.trim() || user.user_metadata?.first_name || 'there', recipientName.trim(), reportLink);
      }

      setTimeout(() => setPhase('success'), 400);
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Please try again.');
      setPhase('form');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reportUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setPhase('form');
    setReportSlug('');
    setProgress(0);
    setMsgIndex(0);
    setError('');
    setRecipientName('');
    setDob('');
    setGender('');
    setCountry('India');
    setGifterName('');
    setPersonalMessage('');
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Birthday Blueprint — The Ultimate Personalised Birthday Gift | BornClock"
        description="Create a personalised birthday report: celebrity twins, zodiac profiles, numerology, birthstone, planetary ages, and a personalised message. The birthday gift they'll never forget."
        keywords="birthday report gift, personalised birthday gift, birthday intelligence report, zodiac birthday gift, celebrity birthday twins, numerology birthday"
        canonicalUrl="/birthday-report"
      />

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Navigation />
          <AuthNav />
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50 py-8 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center mb-6">
            <img
              src="/bornclock-logo.png"
              alt="BornClock"
              className="h-16 w-auto mb-2"
            />
            <p className="text-sm text-indigo-500 italic font-medium mt-1">Know your time. Live it well.</p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-full text-sm font-medium mb-6">
            🎁 The Birthday Gift They'll Actually Remember
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-5">
            The Birthday Gift<br />
            <span className="text-rose-500">They'll Never Forget</span>
          </h1>
          <PageTagline />
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            A beautifully crafted web report revealing their celebrity birthday twins, three zodiac profiles,
            life path number, birthstone, planetary ages, and a personalised message — all in one link.
          </p>
          <button
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-lg transition-colors shadow-lg"
          >
            Create Their Birthday Report 🎂
          </button>
        </div>
      </div>

      {/* ── 3 Why Cards ──────────────────────────────────────────────────── */}
      <div className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Why it makes the perfect gift</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-rose-50 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🌟</div>
              <h3 className="font-bold text-gray-900 mb-2">Celebrity Birthday Twins</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Discover which world-famous people share their exact birthday — ranked by global fame with descriptions.</p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">♈</div>
              <h3 className="font-bold text-gray-900 mb-2">Three Zodiac Profiles</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Deep-dive into their Western, Chinese, and Vedic zodiac signs — compatibility, elements, and 2026 forecast.</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🔢</div>
              <h3 className="font-bold text-gray-900 mb-2">Numerology Blueprint</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Their life path number, what it means, and their personal year forecast for 2026 — calculated from their birthdate.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pricing Card ─────────────────────────────────────────────────── */}
      <div className="py-6 px-4 bg-gray-50">
        <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Birthday Report</div>
            {(isPremium || isInTrial) ? (
              <>
                <div className="text-4xl font-black text-green-500">FREE</div>
                <div className="text-xs text-green-600 font-medium mt-1">
                  {isInTrial && trialDaysRemaining > 0
                    ? `Included in your trial · ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''} remaining`
                    : 'Included in your Premium plan'}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-baseline justify-center gap-3">
                  <span className="text-4xl font-black text-rose-500">₹199</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-2xl font-bold text-gray-700">$2.99</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">India / Global</div>
              </>
            )}
          </div>
          <ul className="space-y-2 mb-6">
            {CHECKLIST_ITEMS.map(item => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-rose-400 font-bold flex-shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={scrollToForm}
            className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors"
          >
            Create Now →
          </button>
          <p className="text-xs text-center text-gray-400 mt-3">Instant web link · Shareable · 30-day access</p>
        </div>
      </div>

      {/* ── Sample Preview (blurred teaser) ──────────────────────────────── */}
      <div className="py-14 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">A peek inside</h2>
          <p className="text-center text-gray-500 mb-8 text-sm">Every section is personalised to their exact birthdate</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🌟', title: 'Celebrity Twins', color: 'bg-rose-50' },
              { icon: '♈', title: 'Zodiac Profiles', color: 'bg-amber-50' },
              { icon: '🔢', title: 'Numerology', color: 'bg-purple-50' },
              { icon: '🪐', title: 'Planetary Ages', color: 'bg-blue-50' },
            ].map(card => (
              <div
                key={card.title}
                className={`${card.color} rounded-2xl p-5 relative overflow-hidden`}
                style={{ filter: 'blur(3px)', userSelect: 'none' }}
              >
                <div className="text-3xl mb-2">{card.icon}</div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-2 bg-gray-200 rounded mb-1 w-full" />
                <div className="h-2 bg-gray-200 rounded mb-1 w-5/6" />
                <div className="h-2 bg-gray-200 rounded w-4/6" />
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-500">
              🔒 Generate a report to unlock the full view
            </span>
          </div>
        </div>
      </div>

      {/* ── Gifting Ideas ────────────────────────────────────────────────── */}
      <div className="py-6 px-4 bg-amber-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Perfect for every occasion</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['🎂 Birthdays', '💑 Anniversaries', '🎓 Graduation', '👶 New Baby', '🏆 Retirement', '💌 Just Because'].map(tag => (
              <span key={tag} className="px-4 py-2 bg-white rounded-full text-sm text-gray-700 shadow-sm border border-amber-200">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form / Loading / Success ──────────────────────────────────────── */}
      <div ref={formRef} className="py-8 px-4 bg-white" id="create-report">
        <div className="max-w-lg mx-auto">

          {/* ── FORM ── */}
          {phase === 'form' && (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Create Their Birthday Report</h2>
              <p className="text-center text-gray-500 text-sm mb-8">Takes about 10 seconds to generate</p>

              <div className="space-y-5 bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                {/* Recipient Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Recipient's Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Priya, James, Mum..."
                    value={recipientName}
                    maxLength={200}
                    onChange={e => setRecipientName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(gender === g ? '' : g)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          gender === g
                            ? 'bg-rose-500 text-white border-rose-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Gifter Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name (optional)</label>
                  <input
                    type="text"
                    placeholder="So we can credit the gift to you"
                    value={gifterName}
                    onChange={e => setGifterName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>

                {/* Personal Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Personal Message (optional)
                    <span className="text-gray-400 font-normal ml-2 text-xs">{personalMessage.length}/200</span>
                  </label>
                  <textarea
                    placeholder="Write a birthday message that will appear at the top of their report..."
                    value={personalMessage}
                    onChange={e => setPersonalMessage(e.target.value.slice(0, 200))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!recipientName.trim() || !dob}
                  className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-lg transition-colors shadow-md"
                >
                  Create Birthday Report 🎂
                </button>

                <p className="text-center text-xs text-gray-400">
                  Report link is shareable · Unlock the full report with a one-time purchase
                </p>
              </div>
            </>
          )}

          {/* ── LOADING ── */}
          {phase === 'loading' && (
            <div className="text-center py-8">
              <div className="text-5xl mb-6 animate-bounce">🎂</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Building the report...</h2>
              <p className="text-gray-500 text-sm mb-8 h-5">{LOADING_MESSAGES[msgIndex]}</p>
              <div className="max-w-sm mx-auto mb-4">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-400 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">{Math.round(progress)}% complete</p>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {phase === 'success' && (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Ready!</h2>
              <p className="text-gray-500 mb-8">
                {recipientName}'s birthday report is live. Share the link below!
              </p>

              {/* Report URL */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
                <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Report Link</p>
                <p className="text-sm text-gray-700 font-mono break-all bg-white px-3 py-2 rounded-lg border border-gray-100">
                  {reportUrl}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    {copied ? '✓ Copied!' : '📋 Copy Link'}
                  </button>
                  <Link
                    to={`/report/${reportSlug}`}
                    target="_blank"
                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors text-sm text-center"
                  >
                    🎂 Open Report
                  </Link>
                </div>
                <div className="flex gap-3">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`I made this Birthday Report for you! 🎂\n${reportUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors text-sm text-center"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href={`mailto:?subject=Your Birthday Blueprint 🎂&body=${encodeURIComponent(`I made your Birthday Blueprint — it's pretty amazing! 🎂\n\nEverything about the day you were born: celebrity twins, zodiac, numerology, tarot, and more.\n\n${reportUrl}`)}`}
                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors text-sm text-center"
                  >
                    ✉️ Email
                  </a>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Generate another report →
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BirthdayReport;
