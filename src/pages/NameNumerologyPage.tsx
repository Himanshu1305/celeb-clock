import { useState } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import { TrustStrip } from '@/components/paj/TrustStrip';
import PageTagline from '@/components/PageTagline';
import { calculateAllNameNumbers, getLetterBreakdown, NAME_NUMBER_MEANINGS } from '@/data/nameNumerologyData';
import { useReportPrice } from '@/hooks/useCurrency';
import { TermTip } from '@/components/vedic/TermTip';
import { chaldeanName, CHALDEAN_LETTER_TABLE, type NameNumberResult } from '@/lib/numerologyExtra';
import { compoundReading, compoundBasisNote } from '@/lib/numerologyTools';
import { NAME_NUMBER_INDIAN_MEANINGS } from '@/data/indianNumberMeanings';

type NumberType = 'expression' | 'soulUrge' | 'personality';

const NUMBER_TYPE_INFO: Record<NumberType, { label: string; subtitle: string; color: string; bgColor: string; borderColor: string }> = {
  expression: { label: 'Expression Number', subtitle: 'Calculated from all letters — who you are destined to be', color: 'text-brand-purple', bgColor: 'bg-brand-purple/10', borderColor: 'border-brand-purple/30' },
  soulUrge: { label: 'Soul Urge Number', subtitle: "Calculated from vowels (and Y when no other vowel is beside it) — what your heart truly desires", color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-300' },
  personality: { label: 'Personality Number', subtitle: 'Calculated from consonants — how others see you', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-300' },
};

export default function NameNumerologyPage() {
  const reportPriceLabel = useReportPrice();
  const [name, setName] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateAllNameNumbers> | null>(null);
  const [breakdown, setBreakdown] = useState<ReturnType<typeof getLetterBreakdown>>([]);
  const [activeType, setActiveType] = useState<NumberType>('expression');
  const [chaldean, setChaldean] = useState<NameNumberResult | null>(null);
  // Batch 9: Chaldean (the Indian name number) first; Western (Pythagorean) is the second tab.
  const [system, setSystem] = useState<'chaldean' | 'western'>('chaldean');

  const handleCalculate = () => {
    if (!name.trim()) return;
    setResult(calculateAllNameNumbers(name));
    setBreakdown(getLetterBreakdown(name));
    setChaldean(chaldeanName(name));
  };
  const compound = chaldean ? compoundReading(chaldean.total) : null;
  const chaldeanMeaning = chaldean ? NAME_NUMBER_INDIAN_MEANINGS[chaldean.root] : null;

  const faqItems = [
    { question: 'What is my name number?',
      answer: 'In the Chaldean system most used in India, each letter has a value from 1 to 8 (A, I, J, Q, Y = 1; B, K, R = 2; C, G, L, S = 3; D, M, T = 4; E, H, N, X = 5; U, V, W = 6; O, Z = 7; F, P = 8 — no letter is given 9). Add the values of the name you use, and that total is your compound number; reduce it to one digit 1–9 for your name number. Shah Rukh Khan: SHAH 14 + RUKH 15 + KHAN 13 = 42 → 4 + 2 = 6.' },
    { question: 'What is a compound number?',
      answer: 'The two-digit total before the final reduction. Cheiro\'s "Book of Numbers" (1926) gives a traditional meaning for each compound from 10 to 52 — 42, for example, carries the meaning of 24 (help from people in position). His list stops at 52; for a higher total we say so plainly and read it through his "same series" rule (subtract 9 until the number is 52 or less).' },
    { question: 'What if my name total is 11, 22 or 33?',
      answer: 'Indian name-number practice reduces every total to a single digit, so 33 → 6. In the Western (Pythagorean) convention 11, 22 and 33 are master numbers and are kept. We show the Indian name number first and, when a master number occurs, the "Western master number" separately — so you never see two unlabelled answers.' },
    { question: "What is the difference between Chaldean and Pythagorean name numerology?",
      answer: "Chaldean (the first tab) assigns letters by sound with values 1–8 and is the system most Indian numerologists use for name numbers and spellings. Pythagorean (the Western tab) numbers the alphabet in order, A=1 … I=9, J=1 …, and gives the Expression, Soul Urge (vowels — Y counts when no other vowel is beside it, as in Lynn or Mary) and Personality (consonants) numbers. The two systems usually give different numbers for the same name." },
    { question: 'Should I use my full birth name or current name?',
      answer: 'The Western tradition uses the full name given at birth. Indian name-number practice usually looks at the name you actually use day to day. Many people calculate both and compare.' },
  ];

  const getMeaning = (num: number, type: NumberType) => {
    const m = NAME_NUMBER_MEANINGS[num];
    if (!m) return 'This number carries unique energy — its meaning is found in the context of your full chart.';
    return m[type];
  };

  return (
    <ToolLayout
      theme="mystic"
      testId="name-numerology-page"
      seo={(
        <SEO
          title="Name Numerology Calculator — Chaldean Number & Meaning | BornClock"
          description="Free name number calculator: your Chaldean name number, compound number and its traditional meaning (Cheiro), plus Western Expression, Soul Urge and Personality numbers."
          keywords="name numerology calculator, name number calculator, chaldean name number, compound number meaning, numerology by name, expression number"
          canonicalUrl="/name-numerology"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner/' }], current: 'Name Numerology', edition: 'Chaldean name number · Western Expression / Soul Urge / Personality' }}
      footer={{
        tagline: "Your Chaldean name number and compound meaning first, then the Western Expression, Soul Urge and Personality numbers — computed from your name's letters.",
        nav: [
          { label: 'Mystic Corner', to: '/mystic-corner/' },
          { label: 'Numerology', to: '/numerology/' },
          { label: 'Compatibility', to: '/compatibility/' },
          { label: 'Tarot by Birthday', to: '/tarot-card-by-birthday/' },
          { label: 'Privacy', to: '/privacy/' },
        ],
        note: '© 2026 BornClock · Calculated, not templated.',
      }}
      eyebrow="Name Numerology"
      h1="Name Numerology Calculator — Chaldean Name Number & Meaning"
    >
        <JsonLd id="webapp" data={{
          '@context': 'https://schema.org', '@type': 'WebApplication',
          name: 'Name Numerology Calculator — Chaldean Name Number & Meaning',
          description: 'Free name number calculator — Chaldean name number and compound meaning, plus Western (Pythagorean) Expression, Soul Urge and Personality numbers.',
          url: 'https://bornclock.com/name-numerology/', applicationCategory: 'LifestyleApplication', operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          provider: { '@type': 'Organization', name: 'BornClock', url: 'https://bornclock.com' },
        }} />
        <JsonLd id="faq" data={{
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
        }} />
        <div className="max-w-2xl mx-auto px-4 py-10">
          <PageTagline />
          <TrustStrip claim="Calculated from the letters of your actual name — Chaldean (Indian) and Pythagorean (Western) values, both labelled." href="/how-it-works/#numerology" />

          <div className="bg-brand-purple/10 border-l-4 border-brand-purple/30 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-brand-purple leading-relaxed">
              Enter your name to get your Chaldean name number — the one most Indian numerologists use — with its compound number and traditional meaning. The Western tab adds your Pythagorean Expression, Soul Urge and Personality numbers.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Enter your name</p>
            <div className="flex gap-3 mb-2">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }}
                placeholder="e.g. Ravi Shankar Kumar"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-navy"
              />
              <button
                onClick={handleCalculate}
                className="bg-brand-navy text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-navy transition-colors"
              >
                Calculate →
              </button>
            </div>
            <p className="text-xs text-gray-600">Chaldean practice usually reads the name you use every day; the Western tradition uses your full birth name. Try both if they differ.</p>
          </div>

          {result && chaldean && (
            <div className="mb-10" data-testid="name-num-results">
              <div role="tablist" aria-label="Numerology system" className="grid grid-cols-2 gap-2 mb-6">
                <button role="tab" data-testid="tab-chaldean" aria-selected={system === 'chaldean'} onClick={() => setSystem('chaldean')}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold border-2 ${system === 'chaldean' ? 'bg-brand-purple/10 border-brand-purple/40 text-brand-purple' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                  Chaldean name number (Indian)
                </button>
                <button role="tab" data-testid="tab-western" aria-selected={system === 'western'} onClick={() => setSystem('western')}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold border-2 ${system === 'western' ? 'bg-brand-purple/10 border-brand-purple/40 text-brand-purple' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                  Western (Pythagorean)
                </button>
              </div>

              {system === 'chaldean' && (
                <div role="tabpanel" data-testid="chaldean-panel" className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 flex items-center justify-center text-3xl font-black text-brand-purple flex-shrink-0" data-testid="chaldean-root">
                      {chaldean.root}
                    </div>
                    <div>
                      <h2 className="font-black text-gray-900 text-lg">
                        Name number (<TermTip id="chaldean">Chaldean</TermTip>, Indian method){chaldeanMeaning ? ` · ${chaldeanMeaning.title}` : ''}
                      </h2>
                      <p className="text-xs text-gray-500">Letter total {chaldean.total}{chaldean.total > 9 ? ` → reduced to ${chaldean.root}` : ''}{chaldeanMeaning ? ` · ruling planet ${chaldeanMeaning.planet}` : ''}</p>
                    </div>
                  </div>
                  {chaldeanMeaning && <p className="text-sm text-gray-700 leading-relaxed mb-4">{chaldeanMeaning.text}</p>}
                  {chaldean.master && (
                    <p className="text-sm text-gray-700 mb-4 bg-gray-50 rounded-xl p-3" data-testid="chaldean-master">
                      <strong><TermTip id="masterNumber">Western master number</TermTip>: {chaldean.master}</strong> — the Western convention keeps {chaldean.master} instead of reducing it to {chaldean.root}. Indian name-number practice uses {chaldean.root}.
                    </p>
                  )}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4" data-testid="chaldean-compound">
                    <p className="text-xs font-semibold text-gray-500 mb-1"><TermTip id="compoundNumber">Compound number</TermTip> (Cheiro tradition)</p>
                    {compound ? (
                      <>
                        <p className="font-semibold text-gray-900">{compound.total} — {compound.meaning.name}</p>
                        <p className="text-sm text-gray-700 mt-1">{compound.meaning.text}</p>
                        <p className="text-xs text-gray-500 mt-2">{compoundBasisNote(compound)}</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-700">Your letter total is a single digit, so there is no separate compound number.</p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Letter-by-letter (Chaldean values)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {chaldean.letters.map((l, i) => (
                      <div key={i} className="rounded-lg px-2 py-2 text-center min-w-[36px] bg-brand-purple/10 border border-brand-purple/30">
                        <div className="text-xs font-black text-brand-purple">{l.ch.toUpperCase()}</div>
                        <div className="text-xs text-gray-500">{l.value}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Chart: {CHALDEAN_LETTER_TABLE.map(r => `${r.value} = ${r.letters}`).join(' · ')}. <Link to="/chaldean-numerology/" className="text-brand-purple underline">How the Chaldean chart and compound numbers work</Link>.</p>
                </div>
              )}

              {system === 'western' && (<div role="tabpanel" data-testid="western-panel">
              <div className="grid grid-cols-3 gap-3 mb-6">
                {(Object.keys(NUMBER_TYPE_INFO) as NumberType[]).map(type => {
                  const info = NUMBER_TYPE_INFO[type];
                  const num = result[type];
                  return (
                    <button key={type} onClick={() => setActiveType(type)}
                      className={`rounded-2xl p-4 text-center border-2 transition-all ${
                        activeType === type ? `${info.bgColor} ${info.borderColor}` : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className={`text-4xl font-black mb-1 ${activeType === type ? info.color : 'text-gray-700'}`}>{num}</div>
                      <div className="text-xs font-semibold text-gray-600">{type === 'expression' ? 'Expression' : type === 'soulUrge' ? 'Soul Urge' : 'Personality'}</div>
                    </button>
                  );
                })}
              </div>
              <p data-testid="name-num-terms" className="-mt-4 mb-6 text-xs text-muted-foreground text-center">
                What these mean: <TermTip id="expressionNumber">Expression</TermTip> · <TermTip id="soulUrge">Soul Urge</TermTip> · <TermTip id="personalityNumber">Personality</TermTip>
              </p>

              {(Object.keys(NUMBER_TYPE_INFO) as NumberType[]).map(type => {
                if (activeType !== type) return null;
                const info = NUMBER_TYPE_INFO[type];
                const num = result[type];
                const meaning = NAME_NUMBER_MEANINGS[num];
                return (
                  <div key={type} className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-2xl ${info.bgColor} flex items-center justify-center text-3xl font-black ${info.color} flex-shrink-0`}>
                        {num}
                      </div>
                      <div>
                        <h2 className="font-black text-gray-900 text-lg">{info.label} · {meaning?.title || `Number ${num}`}</h2>
                        <p className="text-xs text-gray-500">{info.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">{getMeaning(num, type)}</p>
                    {meaning && (
                      <>
                        <div className="bg-gray-50 rounded-xl p-4 mb-3">
                          <p className="text-xs font-semibold text-gray-500 mb-2">Best Career Paths</p>
                          <div className="flex flex-wrap gap-2">
                            {meaning.bestCareers.map(c => (
                              <span key={c} className={`text-xs ${info.bgColor} ${info.color} px-3 py-1 rounded-full`}>{c}</span>
                            ))}
                          </div>
                        </div>
                        {meaning.famousNames.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">Famous names with this Expression number (name as written)</p>
                          <div className="flex flex-wrap gap-2">
                            {meaning.famousNames.map(n => (
                              <span key={n} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">{n}</span>
                            ))}
                          </div>
                        </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}

              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Letter-by-letter breakdown</p>
                <div className="flex flex-wrap gap-1.5">
                  {breakdown.map((item, i) => (
                    <div key={i} className={`rounded-lg px-2 py-2 text-center min-w-[36px] ${item.isVowel ? 'bg-rose-50 border border-rose-200' : 'bg-brand-purple/10 border border-brand-purple/30'}`}>
                      <div className={`text-xs font-black ${item.isVowel ? 'text-rose-700' : 'text-brand-purple'}`}>{item.letter}</div>
                      <div className="text-xs text-gray-500">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span><span className="inline-block w-3 h-3 bg-rose-100 border border-rose-200 rounded mr-1"></span>Vowels (Soul Urge)</span>
                  <span><span className="inline-block w-3 h-3 bg-brand-purple/10 border border-brand-purple/30 rounded mr-1"></span>Consonants (Personality)</span>
                </div>
              </div>
              </div>)}

              <div className="bg-brand-navy rounded-2xl p-6 text-center text-white">
                <p className="text-lg font-bold mb-1">Get your complete Birthday Intelligence Report</p>
                <p className="text-brand-purple text-sm mb-4">Your name numerology + moon sign + tarot card + 12 more sections — personalised to your exact birthday.</p>
                <Link to="/birthday-report/" className="inline-block bg-white text-brand-purple px-8 py-3 rounded-xl font-semibold hover:bg-brand-purple/10 transition-colors">
                  Generate My Report → {reportPriceLabel}
                </Link>
              </div>
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Nine Name Numbers — Chaldean (Indian) reading</h2>
            <div className="space-y-3 mb-8">
              {Object.entries(NAME_NUMBER_INDIAN_MEANINGS).map(([num, m]) => (
                <div key={num} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-brand-purple/10 text-brand-purple font-black text-sm flex items-center justify-center">{num}</span>
                    <span className="font-bold text-gray-900">{m.title} · {m.planet}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{m.text}</p>
                </div>
              ))}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Western (Pythagorean) Expression numbers explained</h2>
            <div className="space-y-3">
              {Object.entries(NAME_NUMBER_MEANINGS).map(([num, m]) => (
                <div key={num} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-brand-purple/10 text-brand-purple font-black text-sm flex items-center justify-center">{num}</span>
                    <span className="font-bold text-gray-900">{m.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{m.expression.slice(0, 180)}...</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map(({ question, answer }) => (
                <div key={question} className="border border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-2">{question}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Related Tools</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { text: 'Numerology Calculator (Mulank & Bhagyank)', href: '/numerology/' },
                { text: 'Chaldean chart & compound numbers', href: '/chaldean-numerology/' },
                { text: 'Name correction (compare spellings)', href: '/name-correction/' },
                { text: 'Tarot by Birthday', href: '/tarot-card-by-birthday/' },
                { text: 'Moon Sign Calculator', href: '/moon-sign/' },
                { text: 'Biorhythm Calculator', href: '/biorhythm/' },
              ].map(item => (
                <Link key={item.href} to={item.href}
                  className="p-3 rounded-xl border border-gray-200 hover:border-brand-purple/30 hover:bg-brand-purple/10 text-sm text-gray-700 hover:text-brand-purple transition-colors">
                  → {item.text}
                </Link>
              ))}
            </div>
          </div>

        </div>
    </ToolLayout>
  );
}
