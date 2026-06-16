import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getReport } from '@/services/BirthdayReportService';
import type { BirthdayReportData } from '@/services/BirthdayReportService';

// ── Helper ─────────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('en-IN');

// ── Expiry page ─────────────────────────────────────────────────────────────────

const ExpiryPage = () => (
  <div className="min-h-screen bg-white flex flex-col">
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm no-print">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Navigation />
        <AuthNav />
      </div>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="text-6xl mb-6">🔒</div>
      <h1 className="text-3xl font-black text-gray-900 mb-3">This Report Has Expired</h1>
      <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
        Birthday reports are available for 7 days (30 days for premium accounts). This report's link has
        expired or may not exist. Create a new one for free!
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/birthday-report"
          className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors"
        >
          Create a New Report 🎂
        </Link>
        <Link
          to="/"
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
        >
          Back to BornClock
        </Link>
      </div>
    </div>
    <Footer />
  </div>
);

// ── Loading skeleton ────────────────────────────────────────────────────────────

const LoadingScreen = () => (
  <div className="min-h-screen bg-white flex flex-col">
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Navigation />
        <AuthNav />
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">🎂</div>
        <p className="text-gray-500">Loading birthday report...</p>
      </div>
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

const ReportView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [row, setRow] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    getReport(slug).then(data => {
      if (!data) setNotFound(true);
      else setRow(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <LoadingScreen />;
  if (notFound || !row) return <ExpiryPage />;

  const rd: BirthdayReportData = row.report_data;
  const {
    recipientName, gifterName, personalMessage, celebrities, historicalEvents,
    westernZodiac, chineseZodiac, vedicRashi, zodiacComparison, compatibility,
    lifePathNumber, lifePathData, personalYear2026, personalYearMeaning,
    birthstone, generation, planetaryAges, planetaryFacts,
    age, daysSinceBirth, daysUntilNextBirthday, nextBirthdayDate, dayOfWeekBorn,
  } = rd;

  const dob = new Date(rd.recipientDob + 'T12:00:00');
  const monthName = dob.toLocaleString('default', { month: 'long' });
  const reportUrl = `${window.location.origin}/report/${slug}`;

  const handlePrint = () => window.print();

  const handleCopy = () => {
    navigator.clipboard.writeText(reportUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{recipientName}'s Birthday Report | BornClock</title>
        <meta name="description" content={`A personalised birthday intelligence report for ${recipientName} — celebrity twins, zodiac, numerology, birthstone and more.`} />
        <meta name="robots" content="noindex" />
        <style>{`
          @media print {
            .no-print { display: none !important; }
            .print-expand { max-height: none !important; overflow: visible !important; }
            body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .dark-section { background: #0f172a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}</style>
      </Helmet>

      {/* ── Site nav ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm no-print">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Navigation />
          <AuthNav />
        </div>
      </div>

      {/* ── Sticky report header ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-[57px] z-40 shadow-sm no-print">
        <div className="container mx-auto px-4 py-2 flex flex-wrap items-center gap-3 justify-between">
          <div>
            <span className="font-bold text-gray-900">{recipientName}'s Birthday Report</span>
            {gifterName && (
              <span className="text-gray-400 text-sm ml-2">· A gift from {gifterName}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors"
            >
              {copied ? '✓ Copied' : '🔗 Copy Link'}
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-sm bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition-colors"
            >
              ⬇ Download PDF
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out ${recipientName}'s Birthday Report! 🎂\n${reportUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              💬
            </a>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — COVER HERO                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-rose-100 via-amber-50 to-purple-100 py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-4">
            <img
              src="/bornclock-logo.png"
              alt="BornClock"
              className="h-12 w-auto opacity-90"
            />
          </div>
          <div className="text-6xl mb-4">🎂</div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 leading-tight">
            {recipientName}'s Birthday<br />Intelligence Report
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Born on a {dayOfWeekBorn} · {dob.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          {/* Personal message */}
          {personalMessage && (
            <blockquote className="max-w-xl mx-auto bg-white/70 backdrop-blur-sm border-l-4 border-rose-400 rounded-r-2xl px-6 py-4 text-gray-700 italic text-lg mb-8 text-left">
              "{personalMessage}"
              {gifterName && <footer className="text-sm text-gray-400 mt-2 not-italic">— {gifterName}</footer>}
            </blockquote>
          )}

          {/* Quick stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {[
              { label: 'Years Old', value: String(age), icon: '🎈' },
              { label: 'Days Lived', value: fmt(daysSinceBirth), icon: '📅' },
              { label: 'Days to Birthday', value: String(daysUntilNextBirthday), icon: '⏳' },
              { label: 'Next Birthday', value: nextBirthdayDate.replace(/,.*/, ''), icon: '🎁' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-xl font-black text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — CELEBRITY TWINS + HISTORICAL EVENTS                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="py-14 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">🌟 Celebrity Birthday Twins</h2>
          <p className="text-center text-gray-500 text-sm mb-8">
            Famous people born on {monthName} {dob.getDate()}, ranked by global recognition
          </p>

          {celebrities.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
              {celebrities.slice(0, 6).map((c: any, i: number) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-amber-100 rounded-full flex items-center justify-center text-xl font-black text-rose-500 mb-3">
                    {(c.name || '?')[0]}
                  </div>
                  <div className="font-bold text-gray-900 text-sm">{c.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{c.occupation || 'Notable person'}</div>
                  {c.birthDate && (
                    <div className="text-xs text-rose-400 mt-1">
                      b. {new Date(c.birthDate + 'T12:00:00').getFullYear()}
                      {c.isLiving === false && ' †'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-2xl mb-12">
              <p className="text-gray-400 text-sm">No celebrity data found for this date</p>
            </div>
          )}

          {/* Historical Events */}
          {historicalEvents.length > 0 && (
            <>
              <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">📜 Historical Events on This Day</h3>
              <div className="space-y-4">
                {historicalEvents.map((evt: { year: number; event: string }, i: number) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-16 text-right">
                      <span className="text-sm font-black text-rose-500">{evt.year}</span>
                    </div>
                    <div className="flex-1 border-l-2 border-rose-100 pl-4 pb-4">
                      <p className="text-sm text-gray-700 leading-relaxed">{evt.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — ZODIAC PROFILE                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="py-14 px-4 bg-amber-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">♈ Zodiac Profile</h2>
          <p className="text-center text-gray-500 text-sm mb-8">Three tradition systems, one person</p>

          {/* 3-card overview */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Western Zodiac', value: westernZodiac?.name ?? '—', sub: westernZodiac?.element ?? '', icon: westernZodiac?.unicode ?? '♈', bg: 'bg-white' },
              { label: 'Chinese Zodiac', value: `${chineseZodiac?.animal ?? '—'} ${chineseZodiac?.emoji ?? ''}`, sub: `${chineseZodiac?.element ?? ''} ${chineseZodiac?.yin_yang ?? ''}`, icon: '', bg: 'bg-white' },
              { label: 'Vedic Rashi', value: vedicRashi?.name ?? '—', sub: vedicRashi?.english ?? '', icon: vedicRashi?.symbol ?? '', bg: 'bg-white' },
            ].map(card => (
              <div key={card.label} className={`${card.bg} rounded-2xl p-5 shadow-sm text-center`}>
                <div className="text-3xl mb-2">{card.icon}</div>
                <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">{card.label}</div>
                <div className="font-black text-gray-900 text-lg">{card.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Tabs deep dive */}
          <Tabs defaultValue="western" className="bg-white rounded-3xl shadow-sm p-6">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="western">Western</TabsTrigger>
              <TabsTrigger value="chinese">Chinese</TabsTrigger>
              <TabsTrigger value="vedic">Vedic</TabsTrigger>
            </TabsList>

            <TabsContent value="western" className="space-y-4 print-expand">
              {westernZodiac ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{westernZodiac.unicode}</span>
                    <div>
                      <h3 className="font-black text-xl text-gray-900">{westernZodiac.name}</h3>
                      <p className="text-sm text-gray-400">{westernZodiac.dateRange} · {westernZodiac.element} · {westernZodiac.rulingPlanet}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{westernZodiac.fullDescription?.slice(0, 600)}</p>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Core Traits</div>
                    <div className="flex flex-wrap gap-2">
                      {(westernZodiac.coreTraits ?? []).slice(0, 6).map((t: string) => (
                        <span key={t} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">{t}</span>
                      ))}
                    </div>
                  </div>
                </>
              ) : <p className="text-gray-400 text-sm">Data unavailable</p>}
            </TabsContent>

            <TabsContent value="chinese" className="space-y-4 print-expand">
              {chineseZodiac ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{chineseZodiac.emoji}</span>
                    <div>
                      <h3 className="font-black text-xl text-gray-900">{chineseZodiac.animal}</h3>
                      <p className="text-sm text-gray-400">{chineseZodiac.element} {chineseZodiac.yin_yang} · {chineseZodiac.year}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{chineseZodiac.description}</p>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Traits</div>
                    <div className="flex flex-wrap gap-2">
                      {(chineseZodiac.traits ?? []).map((t: string) => (
                        <span key={t} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">{t}</span>
                      ))}
                    </div>
                  </div>
                </>
              ) : <p className="text-gray-400 text-sm">Data unavailable</p>}
            </TabsContent>

            <TabsContent value="vedic" className="space-y-4 print-expand">
              {vedicRashi ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{vedicRashi.symbol}</span>
                    <div>
                      <h3 className="font-black text-xl text-gray-900">{vedicRashi.name}</h3>
                      <p className="text-sm text-gray-400">{vedicRashi.english} · {vedicRashi.element} · Ruled by {vedicRashi.ruling_planet}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{vedicRashi.description}</p>
                  {zodiacComparison && (
                    <div className="bg-amber-50 rounded-xl px-4 py-3 text-xs text-amber-800">
                      <strong>Western vs Vedic: </strong>{zodiacComparison.note}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Traits</div>
                    <div className="flex flex-wrap gap-2">
                      {(vedicRashi.traits ?? []).map((t: string) => (
                        <span key={t} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">{t}</span>
                      ))}
                    </div>
                  </div>
                </>
              ) : <p className="text-gray-400 text-sm">Data unavailable</p>}
            </TabsContent>
          </Tabs>

          {/* Compatibility */}
          {(compatibility.best.length > 0 || compatibility.challenging.length > 0) && (
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-2xl p-5">
                <div className="font-semibold text-green-800 mb-2 text-sm">💚 Most Compatible</div>
                <div className="flex flex-wrap gap-2">
                  {compatibility.best.map((s: string) => (
                    <span key={s} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{s}</span>
                  ))}
                </div>
              </div>
              <div className="bg-red-50 rounded-2xl p-5">
                <div className="font-semibold text-red-800 mb-2 text-sm">⚠️ Challenging Match</div>
                <div className="flex flex-wrap gap-2">
                  {compatibility.challenging.map((s: string) => (
                    <span key={s} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — NUMEROLOGY BLUEPRINT                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">🔢 Numerology Blueprint</h2>
          <p className="text-center text-gray-500 text-sm mb-10">Calculated from their exact date of birth</p>

          {/* Life path number */}
          <div className="text-center mb-10">
            <div className="text-9xl font-black text-rose-500 leading-none mb-2">{lifePathNumber}</div>
            <div className="text-xl font-bold text-gray-900">{lifePathData?.name ?? `Life Path ${lifePathNumber}`}</div>
            <div className="text-gray-500 text-sm mt-1">{lifePathData?.keywords?.slice(0, 3).join(' · ')}</div>
          </div>

          {lifePathData && (
            <div className="space-y-6 mb-10">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">Personality</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{lifePathData.personality?.slice(0, 400)}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-2xl p-5">
                  <h3 className="font-bold text-green-800 mb-2 text-sm">Strengths</h3>
                  <ul className="space-y-1">
                    {(lifePathData.strengths ?? []).slice(0, 4).map((s: string) => (
                      <li key={s} className="text-xs text-green-700">✓ {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50 rounded-2xl p-5">
                  <h3 className="font-bold text-amber-800 mb-2 text-sm">Growth Areas</h3>
                  <ul className="space-y-1">
                    {(lifePathData.challenges ?? []).slice(0, 4).map((s: string) => (
                      <li key={s} className="text-xs text-amber-700">→ {s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Personal Year 2026 */}
          {personalYearMeaning && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl font-black text-amber-600">{personalYear2026}</span>
                <div>
                  <div className="font-bold text-amber-900 text-sm">Personal Year in 2026</div>
                  <div className="text-xs text-amber-700">{personalYearMeaning.title}</div>
                </div>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed mb-2">{personalYearMeaning.meaning}</p>
              <div className="text-xs text-amber-600 font-medium">Focus: {personalYearMeaning.focus}</div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5 — COSMIC CONNECTIONS (BIRTHSTONE)                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="py-14 px-4 bg-purple-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">💎 Cosmic Connections</h2>
          <p className="text-center text-gray-500 text-sm mb-10">Birthstone of {monthName}</p>

          {birthstone ? (
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">💎</div>
                <h3 className="text-2xl font-black text-gray-900">{birthstone.primaryStone}</h3>
                <p className="text-sm text-gray-500 mt-1">{birthstone.color}</p>
                {birthstone.alternateStones?.length > 0 && (
                  <p className="text-xs text-purple-500 mt-1">Also: {birthstone.alternateStones.join(', ')}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2">Meaning & Symbolism</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{birthstone.meaning}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2">Properties</h4>
                  <ul className="space-y-1">
                    {(birthstone.properties ?? []).slice(0, 5).map((p: string) => (
                      <li key={p} className="text-xs text-gray-600">· {p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {birthstone.history && (
                <div className="mt-6 bg-purple-50 rounded-xl p-4">
                  <h4 className="font-bold text-purple-900 text-sm mb-2">History</h4>
                  <p className="text-xs text-purple-800 leading-relaxed">{birthstone.history.slice(0, 400)}</p>
                </div>
              )}

              {birthstone.careInstructions && (
                <div className="mt-4 bg-gray-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wide mb-1">Care Instructions</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{birthstone.careInstructions}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 text-sm">Birthstone data unavailable</div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6 — SOLAR SYSTEM AGES (dark)                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="dark-section py-14 px-4" style={{ background: '#0f172a' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-white mb-2 text-center">🪐 Solar System Ages</h2>
          <p className="text-center text-slate-400 text-sm mb-10">
            {recipientName} is {age} years old on Earth — here's their age across the solar system
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {Object.entries(planetaryAges).map(([planet, pAge]) => {
              const SYMBOLS: Record<string, string> = {
                Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '⛢', Neptune: '♆',
              };
              return (
                <div
                  key={planet}
                  className="bg-slate-800 border border-slate-700 border-l-4 rounded-2xl p-5"
                  style={{ borderLeftColor: planet === 'Neptune' ? '#818cf8' : '#f43f5e' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl text-slate-300">{SYMBOLS[planet]}</span>
                    <span className="font-bold text-white text-sm">{planet}</span>
                  </div>
                  <div className="text-2xl font-black text-rose-400">{pAge}</div>
                  <div className="text-xs text-slate-500">years on {planet}</div>
                </div>
              );
            })}
          </div>

          {/* Neptune special card */}
          <div className="bg-indigo-950 border border-indigo-800 rounded-3xl p-6 text-center">
            <div className="text-3xl mb-3">♆</div>
            <h3 className="font-black text-white text-lg mb-2">The Neptune Number</h3>
            <p className="text-2xl font-black text-indigo-300 mb-2">{planetaryAges['Neptune']} years</p>
            <p className="text-sm text-indigo-400 max-w-lg mx-auto leading-relaxed">
              {planetaryFacts?.Neptune ?? 'It rains diamonds on Neptune.'}
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7 — GENERATION                                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="py-14 px-4 bg-amber-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2">👥 Generation Portrait</h2>
          <p className="text-gray-500 text-sm mb-8">Where {recipientName} fits in history</p>

          {generation && (
            <div className="bg-white rounded-3xl shadow-sm p-8 mb-8">
              <div className="text-5xl mb-4">
                {generation.name === 'Generation Alpha' ? '🤖' :
                 generation.name === 'Generation Z' ? '📱' :
                 generation.name === 'Millennial' ? '💻' :
                 generation.name === 'Generation X' ? '📼' :
                 generation.name === 'Baby Boomer' ? '📺' : '🎖️'}
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-1">{generation.name}</h3>
              <div className="text-rose-500 font-semibold text-sm mb-4">{generation.range}</div>
              <p className="text-gray-600 leading-relaxed max-w-lg mx-auto">{generation.desc}</p>
            </div>
          )}

          {/* Longevity CTA */}
          <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
            <h4 className="font-bold text-green-900 mb-2">Want to know how long they could live?</h4>
            <p className="text-sm text-green-700 mb-4">Calculate a personalised life expectancy based on lifestyle, country, and health factors.</p>
            <Link
              to="/life-expectancy"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              🧬 Try Life Expectancy Calculator
            </Link>
          </div>
        </div>
      </div>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <div className="py-12 px-4 bg-white text-center no-print">
        <div className="flex justify-center mt-6 mb-2">
          <img
            src="/bornclock-logo.png"
            alt="BornClock"
            className="h-10 w-auto opacity-70"
          />
        </div>
        <p className="text-gray-500 text-sm mb-4">
          Made with BornClock · <Link to="/birthday-report" className="text-rose-500 hover:underline">Create another report</Link>
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl text-sm transition-colors"
          >
            {copied ? '✓ Copied!' : '🔗 Copy Link'}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl text-sm transition-colors"
          >
            ⬇ Download PDF
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ReportView;
