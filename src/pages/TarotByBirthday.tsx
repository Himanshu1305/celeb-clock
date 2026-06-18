import React, { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { SEO, FAQSchema } from '@/components/SEO';
import PageTagline from '@/components/PageTagline';
import { getTarotCardByLifePath, MAJOR_ARCANA, type TarotCard } from '@/data/tarotData';

function calculateLifePath(day: number, month: number, year: number): number {
  const sum =
    String(day).split('').reduce((s, d) => s + parseInt(d), 0) +
    String(month).split('').reduce((s, d) => s + parseInt(d), 0) +
    String(year).split('').reduce((s, d) => s + parseInt(d), 0);
  let n = sum;
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((s, d) => s + parseInt(d), 0);
  }
  return n;
}

type TabKey = 'meaning' | 'love' | 'career' | 'health' | 'spirituality';

// Card back design — mystical purple/indigo pattern
const CardBack = () => (
  <div
    className="w-full h-full flex items-center justify-center relative overflow-hidden"
    style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)' }}
  >
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 8px,
          rgba(255,255,255,0.1) 8px,
          rgba(255,255,255,0.1) 9px
        )`,
      }}
    />
    <div className="relative z-10 text-center">
      <div className="text-3xl mb-1">✦</div>
      <div className="text-xs text-indigo-300 font-medium tracking-widest uppercase">BornClock</div>
    </div>
    <div className="absolute top-2 left-2 text-indigo-400 text-xs">✦</div>
    <div className="absolute top-2 right-2 text-indigo-400 text-xs">✦</div>
    <div className="absolute bottom-2 left-2 text-indigo-400 text-xs">✦</div>
    <div className="absolute bottom-2 right-2 text-indigo-400 text-xs">✦</div>
    <div className="absolute inset-0 tarot-card-shimmer" />
  </div>
);

// Card front — revealed Major Arcana
const CardFront = ({ card }: { card: TarotCard }) => (
  <div
    className="w-full h-full flex flex-col items-center justify-center p-3 text-center"
    style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
  >
    <p className="text-xs text-indigo-300 mb-1 tracking-wider">Card {card.number}</p>
    <div className="text-4xl mb-2">{card.emoji}</div>
    <p className="text-white font-black text-sm leading-tight">{card.name}</p>
    <div className="w-8 h-px bg-indigo-400 my-2" />
    <div className="flex flex-wrap justify-center gap-1">
      {card.keywords.slice(0, 2).map(kw => (
        <span key={kw} className="text-indigo-300 text-xs">{kw}</span>
      ))}
    </div>
  </div>
);

interface InteractiveTarotDrawProps {
  onCardDrawn: (card: TarotCard) => void;
  drawnCard: TarotCard | null;
}

function InteractiveTarotDraw({ onCardDrawn, drawnCard }: InteractiveTarotDrawProps) {
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [assignedCards] = useState<TarotCard[]>(() => {
    const allCards = Object.values(MAJOR_ARCANA);
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [stars, setStars] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleCardClick = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (flippedIndex !== null || isDrawing) return;

    setIsDrawing(true);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const newStars = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: rect.left + Math.random() * rect.width,
      y: rect.top + Math.random() * rect.height,
    }));
    setStars(newStars);
    setTimeout(() => setStars([]), 1000);

    setTimeout(() => {
      setFlippedIndex(index);
      onCardDrawn(assignedCards[index]);
      setIsDrawing(false);
    }, 200);
  };

  const getCardStyle = (index: number, total: number): CSSProperties => {
    const spreadAngle = 60;
    const startAngle = -spreadAngle / 2;
    const angleStep = spreadAngle / (total - 1);
    const angle = startAngle + index * angleStep;
    const radian = (angle * Math.PI) / 180;
    const radius = 280;
    const x = Math.sin(radian) * radius * 0.4;
    const y = -Math.cos(radian) * radius * 0.08 + 20;

    return {
      position: 'absolute',
      transform: `translateX(${x}px) translateY(${y}px) rotate(${angle}deg)`,
      transformOrigin: 'bottom center',
      transition: 'all 0.3s ease',
      left: '50%',
      marginLeft: '-36px',
      bottom: '0',
      width: '72px',
      height: '110px',
      zIndex: index,
    };
  };

  if (drawnCard) {
    return (
      <div className="text-center py-4">
        <div
          className="inline-block w-32 h-48 rounded-xl overflow-hidden shadow-2xl mx-auto"
          style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <p className="text-xs text-indigo-300 mb-2 tracking-wider">Card {drawnCard.number}</p>
            <div className="text-5xl mb-3">{drawnCard.emoji}</div>
            <p className="text-white font-black text-base leading-tight">{drawnCard.name}</p>
            <div className="w-10 h-px bg-indigo-400 my-2" />
            <div className="flex flex-wrap justify-center gap-1">
              {drawnCard.keywords.slice(0, 2).map(kw => (
                <span key={kw} className="text-indigo-300 text-xs">{kw}</span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm text-indigo-600 font-medium mt-3 italic">
          You drew {drawnCard.name} ✨
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Draw again
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {stars.map(star => (
        <div
          key={star.id}
          className="star-particle fixed text-yellow-400 text-lg"
          style={{ left: star.x, top: star.y }}
        >
          ✦
        </div>
      ))}

      <p className="text-center text-sm text-gray-500 mb-6 italic">
        {isDrawing
          ? 'Revealing your card...'
          : 'Hover over the cards and choose one — trust your instinct'}
      </p>

      <div
        className="relative mx-auto"
        style={{ height: '160px', width: '100%', maxWidth: '400px' }}
      >
        {assignedCards.map((card, index) => (
          <div
            key={index}
            className={`tarot-card-container ${flippedIndex === index ? 'flipped' : ''}`}
            style={getCardStyle(index, assignedCards.length)}
            onClick={e => handleCardClick(index, e)}
          >
            <div className="tarot-card-inner w-full h-full">
              <div className="tarot-card-front w-full h-full">
                <CardBack />
              </div>
              <div className="tarot-card-back w-full h-full">
                <CardFront card={card} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Each card is unique — no two draws are the same
      </p>
    </div>
  );
}

export default function TarotByBirthday() {
  const [drawnCard, setDrawnCard] = useState<TarotCard | null>(null);
  const [dob, setDob] = useState('');
  const [birthdayResult, setBirthdayResult] = useState<{
    lifePathNumber: number;
    card: TarotCard;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('meaning');

  const handleCalculate = () => {
    if (!dob) return;
    const [year, month, day] = dob.split('-').map(Number);
    const lp = calculateLifePath(day, month, year);
    setBirthdayResult({ lifePathNumber: lp, card: getTarotCardByLifePath(lp) });
  };

  const getCombinationReading = (drawn: TarotCard, birthday: TarotCard): string => {
    if (drawn.name === birthday.name) {
      return `Remarkable — you drew your own birthday card. The universe is confirming your path with unusual clarity. ${birthday.name} appears twice in your reading, amplifying its message: ${birthday.keywords.slice(0, 3).join(', ')}.`;
    }
    return `Your drawn card (${drawn.name}) and your birthday card (${birthday.name}) together suggest a tension between ${drawn.keywords[0]} and ${birthday.keywords[0]}. The ${drawn.name} represents what you're reaching toward right now; ${birthday.name} represents your deeper, permanent nature. When these energies align, you become someone who ${drawn.keywords[1] || 'transforms'} through the lens of ${birthday.keywords[1] || 'wisdom'}.`;
  };

  const faqItems = [
    {
      question: 'How is my tarot card determined by birthday?',
      answer:
        "Your birthday tarot card is determined by your Life Path number — calculated by reducing your full date of birth to a single digit (or master number 11, 22, 33). Each Life Path number corresponds to one of the Major Arcana cards in the tarot deck, which represents your soul's core archetype and life theme.",
    },
    {
      question: 'What are the Major Arcana tarot cards?',
      answer:
        'The Major Arcana are the 22 trump cards in a tarot deck, numbered 0 (The Fool) through 21 (The World). Unlike the Minor Arcana which reflect everyday events, the Major Arcana represent significant life themes, soul lessons, and archetypal forces that shape a person\'s entire journey.',
    },
    {
      question: 'Can my tarot card change?',
      answer:
        'Your birthday tarot card — determined by your Life Path number — remains constant throughout your life. However, you also have a Personal Year card that changes annually, reflecting the current energetic theme of that particular year for you.',
    },
    {
      question: 'Which tarot card is the most powerful?',
      answer:
        'The World (XXI) is often considered the most complete card, representing full integration and achievement. The Fool (0) holds infinite potential. Master number cards — Justice (11) and The World (22) — carry particularly intense archetypal energy.',
    },
  ];

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'meaning', label: '✨ Meaning' },
    { key: 'love', label: '❤️ Love' },
    { key: 'career', label: '💼 Career' },
    { key: 'health', label: '🌿 Health' },
    { key: 'spirituality', label: '🕯️ Spirit' },
  ];

  return (
    <>
      <SEO
        title="Tarot Card by Birthday — Draw Your Card & Find Your Major Arcana | BornClock"
        description="Draw your tarot card interactively — then discover your permanent Major Arcana card from your date of birth. Free animated tarot card reading with full interpretations."
        keywords="tarot card by birthday, birthday tarot card, major arcana calculator, life path tarot, tarot by date of birth"
        canonicalUrl="/tarot-card-by-birthday"
      />
      <FAQSchema items={faqItems} />

      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-10">

          <nav className="text-sm text-gray-400 mb-6 flex gap-1 items-center flex-wrap">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span>›</span>
            <span className="text-gray-600">Tarot Card by Birthday</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-1">Your Tarot Card by Birthday</h1>
          <PageTagline />

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Your birthday tarot card is determined by your Life Path number — the single most
              important number in numerology, calculated from your full date of birth. Each Life
              Path corresponds to one of the 22 Major Arcana cards, representing your soul's core
              archetype and the deepest theme of your life journey.
            </p>
          </div>

          {/* SECTION 1: Interactive card draw */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-1 text-center">🃏 Draw Your Card</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Ten cards are spread before you. One is calling to you right now.
            </p>
            <InteractiveTarotDraw onCardDrawn={setDrawnCard} drawnCard={drawnCard} />
          </div>

          {/* SECTION 2: Birthday card */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-1 text-center">🎂 Your Birthday Card</h2>
            <p className="text-sm text-gray-500 text-center mb-4">
              Determined by your Life Path number — this card is permanent and unique to your birthday.
            </p>
            <div className="flex gap-3">
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleCalculate}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                Find My Card →
              </button>
            </div>
          </div>

          {/* Birthday card result */}
          {birthdayResult && (
            <div className="mb-8">
              <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 text-white text-center mb-6">
                <p className="text-sm text-indigo-300 mb-1">
                  Your Life Path is {birthdayResult.lifePathNumber} · Your card is
                </p>
                <div className="text-7xl mb-3">{birthdayResult.card.emoji}</div>
                <p className="text-sm font-semibold text-indigo-300 mb-1">
                  Card {birthdayResult.card.number}
                </p>
                <h2 className="text-3xl font-black text-white mb-4">{birthdayResult.card.name}</h2>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {birthdayResult.card.keywords.map(kw => (
                    <span key={kw} className="bg-white/10 text-white/80 text-xs px-3 py-1 rounded-full">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 min-w-0 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                {activeTab === 'meaning' && (
                  <>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                      {birthdayResult.card.upright}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                      {birthdayResult.card.deepMeaning}
                    </p>
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                      <p className="text-xs font-semibold text-amber-600 mb-1">⚠️ Shadow side</p>
                      <p className="text-sm text-gray-700">{birthdayResult.card.reversed}</p>
                    </div>
                  </>
                )}
                {activeTab === 'love' && (
                  <p className="text-sm text-gray-700 leading-relaxed">{birthdayResult.card.love}</p>
                )}
                {activeTab === 'career' && (
                  <p className="text-sm text-gray-700 leading-relaxed">{birthdayResult.card.career}</p>
                )}
                {activeTab === 'health' && (
                  <p className="text-sm text-gray-700 leading-relaxed">{birthdayResult.card.health}</p>
                )}
                {activeTab === 'spirituality' && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {birthdayResult.card.spirituality}
                  </p>
                )}

                <div className="mt-6 bg-green-50 rounded-xl p-4 border border-green-100">
                  <p className="text-xs font-semibold text-green-600 mb-1">✨ Your Affirmation</p>
                  <p className="text-sm text-gray-700 italic">"{birthdayResult.card.affirmation}"</p>
                </div>

                {birthdayResult.card.famousPeople.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      Famous people with this card
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {birthdayResult.card.famousPeople.map(p => (
                        <span
                          key={p}
                          className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-indigo-600 rounded-2xl p-6 mt-6 text-center text-white">
                <p className="text-lg font-bold mb-1">Get the complete Birthday Intelligence Report</p>
                <p className="text-indigo-200 text-sm mb-4">
                  Your tarot card + moon sign + nakshatra + name numerology + 12 more sections —
                  personalised to your exact birthday.
                </p>
                <Link
                  to="/birthday-report"
                  className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
                >
                  Generate My Report → ₹199
                </Link>
              </div>
            </div>
          )}

          {/* SECTION 3: Combination reading — only when both present */}
          {drawnCard && birthdayResult && (
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 mb-8 text-white">
              <h2 className="text-lg font-bold text-center mb-4">✨ Your Combined Reading</h2>
              <div className="flex justify-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-3xl mb-1">{drawnCard.emoji}</div>
                  <p className="text-xs text-indigo-300">Drawn card</p>
                  <p className="text-sm font-bold text-white">{drawnCard.name}</p>
                </div>
                <div className="text-2xl self-center text-indigo-300">+</div>
                <div className="text-center">
                  <div className="text-3xl mb-1">{birthdayResult.card.emoji}</div>
                  <p className="text-xs text-indigo-300">Birthday card</p>
                  <p className="text-sm font-bold text-white">{birthdayResult.card.name}</p>
                </div>
              </div>
              <p className="text-sm text-indigo-200 leading-relaxed text-center">
                {getCombinationReading(drawnCard, birthdayResult.card)}
              </p>
            </div>
          )}

          {/* Educational content: all 22 Major Arcana cards */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">The 22 Major Arcana Cards</h2>
            <p className="text-gray-500 text-sm mb-6">
              Each card represents a universal archetype. Your birthday determines which one is your
              soul's signature.
            </p>
            <div className="space-y-3">
              {Object.entries(MAJOR_ARCANA).map(([num, card]) => (
                <div
                  key={num}
                  className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{card.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-medium">Card {card.number}</span>
                        <span className="font-bold text-gray-900">{card.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {card.keywords.slice(0, 3).map(kw => (
                          <span
                            key={kw}
                            className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
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
                { text: 'Moon Sign Calculator', href: '/moon-sign' },
                { text: 'Numerology Calculator', href: '/numerology' },
                { text: 'Name Numerology', href: '/name-numerology' },
                { text: 'Biorhythm Calculator', href: '/biorhythm' },
              ].map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors"
                >
                  → {item.text}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
