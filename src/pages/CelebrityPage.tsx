import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { indianCelebrities } from '@/data/indianCelebrities';
import {
  generateAllSlugs, parseCelebrityDOB, formatDOBDisplay,
  generateCelebrityTitle, generateCelebrityMeta,
  getCategoryHubSlug, CATEGORY_CONFIG,
} from '@/utils/celebrityUtils';
import {
  calculateAge, calculateLifePathNumber, LIFE_PATH_TRAITS,
  calculateWesternZodiac, calculateChineseZodiac, calculateVedicRashi,
  calculateNakshatra, calculatePlanetaryAges,
} from '@/utils/celebrityCalculations';
import {
  WESTERN_ZODIAC_PROFILES, VEDIC_RASHI_PROFILES,
  CHINESE_ZODIAC_PROFILES, NAKSHATRA_PROFILES, LIFE_PATH_EXTENDED,
} from '@/data/astrologicalData';
import type {
  WesternZodiacProfile, VedicRashiProfile,
  ChineseZodiacProfile, NakshatraProfile, LifePathProfile,
} from '@/data/astrologicalData';
import celebBios from '@/data/celebrity-bios.json';

// Build the slug map ONCE at module load (deterministic, ~598 entries).
const SLUG_MAP = generateAllSlugs(indianCelebrities as unknown as Record<string, unknown>[]);
const CELEB_TO_SLUG = new Map<Record<string, unknown>, string>();
SLUG_MAP.forEach((celeb, slug) => CELEB_TO_SLUG.set(celeb, slug));

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];

function JsonLd({ data }: { data: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

function buildPersonalitySynthesis(
  name: string,
  zodiacProfile: WesternZodiacProfile | null,
  rashiProfile: VedicRashiProfile | null,
  lifePath: number | null,
  lpExtended: LifePathProfile | null,
  nakshatraProfile: NakshatraProfile | null,
  zodiacSign: string | null,
  rashiName: string | null,
  nakshatraName: string | null
): string {
  const parts: string[] = [];

  if (zodiacProfile && rashiProfile && zodiacSign && rashiName) {
    parts.push(
      `As a ${zodiacSign} with ${rashiName} Rashi, ${name} combines the ${zodiacProfile.element.toLowerCase()} energy of ${zodiacSign} with the ${rashiProfile.element.toLowerCase()} depth of ${rashiName}, ruled by ${rashiProfile.lord} (${rashiProfile.lord_devanagari}).`
    );
  } else if (zodiacProfile && zodiacSign) {
    parts.push(
      `As a ${zodiacSign}, ${name} carries the ${zodiacProfile.element.toLowerCase()} energy of the archer — ${zodiacProfile.personality_summary.slice(0, 80).toLowerCase()}.`
    );
  }

  if (lifePath && lpExtended) {
    parts.push(
      `Their Life Path ${lifePath} — the ${lpExtended.title} — guided by ${lpExtended.ruling_planet}, brings ${lpExtended.traits.slice(0, 60).toLowerCase()} to everything they do.`
    );
  }

  if (nakshatraProfile && nakshatraName) {
    parts.push(
      `Born in the ${nakshatraName} Nakshatra (${nakshatraProfile.quality}), their ${nakshatraProfile.strengths.slice(0, 2).join(' and ').toLowerCase()} nature is a thread that runs through their entire life.`
    );
  }

  return parts.length > 0
    ? parts.join(' ')
    : `${name} is an accomplished Indian personality whose work has left a lasting mark on their field and on audiences across the nation.`;
}

export function CelebrityPage() {
  const { slug } = useParams<{ slug: string }>();
  const celeb = slug ? (SLUG_MAP.get(slug) as Record<string, unknown> | undefined) : undefined;

  // Invalid slug → redirect to the index.
  if (!celeb) return <Navigate to="/celebrity/" replace />;

  const name = String(celeb.name || '');
  const category = String(celeb.category || 'Public Figure');
  const knownFor = String(celeb.known_for || '');
  const nationality = String(celeb.nationality || 'Indian');
  const deathYear = celeb.death_year != null ? Number(celeb.death_year) : null;
  const dob = parseCelebrityDOB(celeb);
  const isFull = !!dob?.isFullDate;

  // Calculations (guarded by DOB availability).
  const western = isFull ? calculateWesternZodiac(dob!.day, dob!.month) : null;
  const vedic   = isFull ? calculateVedicRashi(dob!.day, dob!.month) : null;
  const nakshatra = isFull ? calculateNakshatra(dob!.day, dob!.month) : null;
  const chinese = dob ? calculateChineseZodiac(dob.year) : null;
  const lifePath = isFull ? calculateLifePathNumber(dob!.day, dob!.month, dob!.year) : null;
  const planetary = dob ? calculatePlanetaryAges(dob) : [];

  // ── Day 8B: rich astrological profiles (all null-guarded) ──
  const zodiacProfile: WesternZodiacProfile | null = western
    ? (WESTERN_ZODIAC_PROFILES[western.sign] ?? null) : null;
  const rashiProfile: VedicRashiProfile | null = vedic
    ? (VEDIC_RASHI_PROFILES[vedic.rashi] ?? null) : null;
  const chineseProfile: ChineseZodiacProfile | null = chinese
    ? (CHINESE_ZODIAC_PROFILES[chinese.animal] ?? null) : null;
  const nakshatraProfile: NakshatraProfile | null = nakshatra
    ? (NAKSHATRA_PROFILES[nakshatra.nakshatra] ?? null) : null;
  const lpExtended: LifePathProfile | null = lifePath
    ? (LIFE_PATH_EXTENDED[lifePath] ?? null) : null;
  const bio: string | null = (celebBios as Record<string, string>)[slug ?? ''] ?? null;

  // Active tab state for astrological section
  const [activeTab, setActiveTab] = React.useState<'western' | 'vedic' | 'chinese' | 'numerology'>('western');

  const personalitySynthesis = buildPersonalitySynthesis(
    name, zodiacProfile, rashiProfile, lifePath, lpExtended, nakshatraProfile,
    western?.sign ?? null, vedic?.rashi ?? null, nakshatra?.nakshatra ?? null
  );

  // Age string (honest for every DOB situation).
  const currentYear = new Date().getFullYear();
  let ageStr = 'Information not available';
  if (dob) {
    if (deathYear) {
      ageStr = `Died in ${deathYear}, at approximately ${deathYear - dob.year} years of age`;
    } else if (isFull) {
      ageStr = `${calculateAge(dob.day, dob.month, dob.year)} years old`;
    } else {
      ageStr = `Approximately ${currentYear - dob.year} years old (based on birth year)`;
    }
  }

  // Birthday twins — only for full-DOB celebrities.
  const twins = isFull
    ? (indianCelebrities as unknown as Record<string, unknown>[]).filter(c => {
        if (c === celeb || String(c.name) === name) return false;
        const d = parseCelebrityDOB(c);
        return d?.isFullDate && d.day === dob!.day && d.month === dob!.month;
      }).slice(0, 12)
    : [];

  const hubSlug = getCategoryHubSlug(category);
  const hubLabel = CATEGORY_CONFIG[category]?.label || 'Celebrity';
  const bornOnSlug = isFull ? `${MONTH_NAMES[dob!.month - 1].toLowerCase()}-${dob!.day}` : null;

  // CTA — pre-fill DOB ONLY for full dates (never a placeholder Jan 1).
  const ctaHref = isFull
    ? `/birthday-report?dob=${dob!.year}-${String(dob!.month).padStart(2, '0')}-${String(dob!.day).padStart(2, '0')}`
    : '/birthday-report';

  // ── SEO ──
  const title = generateCelebrityTitle(name);
  const description = generateCelebrityMeta(name, dob, western?.sign || (chinese?.animal ?? ''), vedic?.rashi || '', lifePath);
  const canonical = `/celebrity/${slug}`;

  // ── Schema ──
  const personSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    nationality: 'Indian',
    description: knownFor,
    url: `https://bornclock.com/celebrity/${slug}/`,
  };
  if (isFull) {
    personSchema.birthDate = `${dob!.year}-${String(dob!.month).padStart(2, '0')}-${String(dob!.day).padStart(2, '0')}`;
  } else if (dob) {
    personSchema.birthDate = String(dob.year); // year only — ISO 8601 allows YYYY
  }
  if (deathYear) personSchema.deathDate = String(deathYear);

  const faqs = [
    {
      q: `When is ${name}'s birthday?`,
      a: dob
        ? (isFull
            ? `${name} was born on ${formatDOBDisplay(dob)}.`
            : `${name} was born in ${dob.year}. The exact birth date is not available in our records.`)
        : `${name}'s birth date is not available in our records.`,
    },
    {
      q: `How old is ${name}?`,
      a: dob ? `${name} is ${ageStr}.` : `${name}'s age information is not available.`,
    },
    {
      q: `What is ${name}'s zodiac sign?`,
      a: western
        ? `${name}'s Western zodiac sign is ${western.sign} (${western.date_range}), an element of ${western.element} ruled by ${western.ruling_planet}.`
        : `${name}'s Western zodiac sign requires an exact birth date, which is not available.${chinese ? ` Their Chinese zodiac sign is the ${chinese.animal}.` : ''}`,
    },
    {
      q: `What is ${name}'s Chinese zodiac sign?`,
      a: chinese
        ? `${name} was born in the Year of the ${chinese.animal} (${chinese.element} ${chinese.animal}) — ${chinese.traits}`
        : `${name}'s Chinese zodiac sign is not available.`,
    },
    {
      q: `What is ${name} known for?`,
      a: knownFor
        ? `${name} is an Indian ${category.toLowerCase()} known for: ${knownFor}`
        : `${name} is an Indian ${category.toLowerCase()}.`,
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bornclock.com' },
      { '@type': 'ListItem', position: 2, name: 'Celebrity Profiles', item: 'https://bornclock.com/celebrity/' },
      { '@type': 'ListItem', position: 3, name, item: `https://bornclock.com/celebrity/${slug}/` },
    ],
  };

  return (
    <>
      <SEO title={title} description={description} canonicalUrl={canonical} ogType="profile" />
      <JsonLd data={personSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <main data-testid="celebrity-page" className="min-h-screen bg-white">
        {/* ── BREADCRUMB ── */}
        <nav aria-label="Breadcrumb" className="max-w-4xl mx-auto px-4 pt-4">
          <ol className="flex items-center gap-2 text-sm text-gray-400 flex-wrap list-none p-0">
            <li data-testid="breadcrumb-item"><Link to="/" className="hover:text-indigo-600">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li data-testid="breadcrumb-item"><Link to="/celebrity/" className="hover:text-indigo-600">Celebrity Profiles</Link></li>
            <li aria-hidden="true">›</li>
            <li data-testid="breadcrumb-item" className="text-gray-700 font-medium" aria-current="page">{name}</li>
          </ol>
        </nav>

        {/* ── HERO ── */}
        <section aria-labelledby="page-h1" className="bg-gradient-to-br from-indigo-50 to-indigo-50 border-b border-indigo-100 py-10 px-4 mt-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              ⭐ {hubLabel} · Indian Celebrity
            </div>
            <h1 id="page-h1" className="text-3xl sm:text-4xl lg:text-5xl font-black gradient-text-primary leading-tight mb-3">
              {name}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {knownFor || `Indian ${category.toLowerCase()}.`}
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 pb-16">
          {/* ── LUCKY ELEMENTS PANEL ── */}
          <section
            data-testid="lucky-elements-panel"
            className="mt-8 mb-6 overflow-x-auto pb-1"
            aria-label="Lucky elements"
          >
            <div className="flex gap-2 flex-wrap">
              {rashiProfile ? (
                <>
                  <span data-testid="lucky-chip-color"
                    className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                               rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
                    🎨 Colour: {rashiProfile.lucky_colors[0]}
                  </span>
                  <span data-testid="lucky-chip-stone"
                    className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                               rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
                    💎 Stone: {rashiProfile.lucky_stone} ({rashiProfile.lucky_stone_hindi})
                  </span>
                  <span data-testid="lucky-chip-day"
                    className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                               rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
                    📅 Day: {rashiProfile.lucky_day}
                  </span>
                  <span data-testid="lucky-chip-number"
                    className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                               rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
                    🔢 Number: {rashiProfile.lucky_numbers.join(', ')}
                  </span>
                  <span data-testid="lucky-chip-direction"
                    className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                               rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
                    🧭 Direction: {rashiProfile.lucky_direction}
                  </span>
                  <span data-testid="lucky-chip-metal"
                    className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                               rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
                    ⚙️ Metal: {rashiProfile.lucky_metal}
                  </span>
                  {zodiacProfile && (
                    <span data-testid="lucky-chip-tarot"
                      className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                                 rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
                      🃏 Tarot: {zodiacProfile.tarot_card}
                    </span>
                  )}
                </>
              ) : chineseProfile ? (
                <>
                  <span data-testid="lucky-chip-color"
                    className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                               rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
                    🎨 Lucky Colour: {chineseProfile.lucky_colors[0]}
                  </span>
                  <span data-testid="lucky-chip-number"
                    className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                               rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
                    🔢 Lucky Number: {chineseProfile.lucky_numbers.join(', ')}
                  </span>
                  <span className="flex-shrink-0 text-xs text-gray-400 italic self-center">
                    Full lucky profile requires exact date of birth
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-400 italic">
                  Lucky elements require a full date of birth.
                </span>
              )}
            </div>
          </section>

          {/* ── PERSONALITY SYNTHESIS ── */}
          {personalitySynthesis && (
            <section
              data-testid="personality-synthesis"
              className="mb-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4"
            >
              <p className="text-sm text-indigo-900 leading-relaxed">{personalitySynthesis}</p>
            </section>
          )}

          {/* ── BIO SECTION ── */}
          {bio ? (
            <section
              data-testid="celebrity-bio"
              className="mb-6 bg-white rounded-xl border border-gray-200 p-5"
            >
              <h2 className="text-lg font-black text-gray-900 mb-3">About {name}</h2>
              <p className="text-gray-700 leading-relaxed text-sm">{bio}</p>
              <p className="text-xs text-gray-400 mt-3 italic">
                Based on publicly available information.
              </p>
            </section>
          ) : (
            <section data-testid="celebrity-bio-pending" className="mb-6">
              <div className="bg-gray-50 border border-dashed border-gray-200
                              rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">
                  Detailed biography for {name} coming soon.
                </p>
              </div>
            </section>
          )}

          {/* ── FACTS TABLE ── */}
          <section className="mt-8 mb-10" aria-labelledby="facts-heading">
            <h2 id="facts-heading" className="text-2xl font-black text-gray-900 mb-4 pb-3 border-b border-gray-200">
              {name} — Birthday & Personal Facts
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table data-testid="facts-table" className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <th scope="row" className="text-left px-4 py-3 font-semibold text-gray-600 bg-gray-50 w-2/5">Full Name</th>
                    <td className="px-4 py-3 text-gray-900">{name}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <th scope="row" className="text-left px-4 py-3 font-semibold text-gray-600 bg-gray-50">Profession</th>
                    <td className="px-4 py-3 text-gray-900">{category}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <th scope="row" className="text-left px-4 py-3 font-semibold text-gray-600 bg-gray-50">Nationality</th>
                    <td className="px-4 py-3 text-gray-900">{nationality}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <th scope="row" className="text-left px-4 py-3 font-semibold text-gray-600 bg-gray-50">Date of Birth</th>
                    <td data-testid="fact-dob" className="px-4 py-3 text-gray-900">{formatDOBDisplay(dob)}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <th scope="row" className="text-left px-4 py-3 font-semibold text-gray-600 bg-gray-50">Age</th>
                    <td data-testid="fact-age" className="px-4 py-3 text-gray-900">{ageStr}</td>
                  </tr>
                  {chinese && (
                    <tr className="border-b border-gray-100">
                      <th scope="row" className="text-left px-4 py-3 font-semibold text-gray-600 bg-gray-50">Chinese Zodiac</th>
                      <td className="px-4 py-3 text-gray-900">{chinese.emoji} {chinese.element} {chinese.animal}</td>
                    </tr>
                  )}
                  {western && (
                    <tr className="border-b border-gray-100">
                      <th scope="row" className="text-left px-4 py-3 font-semibold text-gray-600 bg-gray-50">Western Zodiac</th>
                      <td className="px-4 py-3 text-gray-900">{western.symbol} {western.sign}</td>
                    </tr>
                  )}
                  {vedic && (
                    <tr className="border-b border-gray-100">
                      <th scope="row" className="text-left px-4 py-3 font-semibold text-gray-600 bg-gray-50">Vedic Rashi</th>
                      <td className="px-4 py-3 text-gray-900">{vedic.rashi} ({vedic.western_equivalent})</td>
                    </tr>
                  )}
                  {nakshatra && (
                    <tr className="border-b border-gray-100">
                      <th scope="row" className="text-left px-4 py-3 font-semibold text-gray-600 bg-gray-50">Nakshatra</th>
                      <td className="px-4 py-3 text-gray-900">{nakshatra.nakshatra} (No. {nakshatra.number})</td>
                    </tr>
                  )}
                  {lifePath != null && (
                    <tr>
                      <th scope="row" className="text-left px-4 py-3 font-semibold text-gray-600 bg-gray-50">Life Path Number</th>
                      <td className="px-4 py-3 text-gray-900">{lifePath} — {LIFE_PATH_TRAITS[lifePath]?.title}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {!isFull && (
              <p className="text-xs text-gray-500 mt-2 italic">
                Only the birth year is documented for {name}. Zodiac sign, life path, and planetary ages require an exact birth date and are omitted to avoid guessing.
              </p>
            )}
          </section>

          {/* ── EXPANDED ASTROLOGICAL TABS ── */}
          <section data-testid="astro-tabs" className="mb-8">
            <h2 className="text-xl font-black text-gray-900 mb-4">Astrological Profile</h2>

            {/* Tab buttons */}
            <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
              {[
                { id: 'western',    label: '⭐ Western Zodiac' },
                { id: 'vedic',      label: '🕉 Vedic / Rashi' },
                { id: 'chinese',    label: '🐉 Chinese Zodiac' },
                { id: 'numerology', label: '🔢 Numerology' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  data-testid={`tab-${id}`}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeTab === id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* WESTERN TAB — conditional rendering (NOT CSS display:none) */}
            {activeTab === 'western' && (
              <div data-testid="tab-content-western" className="animate-in fade-in">
                {zodiacProfile ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {western?.sign} {western?.symbol} — The {zodiacProfile.element} Sign
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      {zodiacProfile.personality_summary}
                    </p>
                    {/* Strengths + Weaknesses */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <h4 className="text-xs font-bold text-green-700 mb-2">Strengths</h4>
                        <div className="flex flex-wrap gap-1">
                          {zodiacProfile.strengths.map(s => (
                            <span key={s} className="bg-green-100 text-green-800 text-xs
                                                      px-2 py-1 rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-red-700 mb-2">Challenges</h4>
                        <div className="flex flex-wrap gap-1">
                          {zodiacProfile.weaknesses.map(w => (
                            <span key={w} className="bg-red-100 text-red-800 text-xs
                                                      px-2 py-1 rounded-full">{w}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Lucky elements grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
                      {[
                        { label: 'Lucky Colour', value: zodiacProfile.lucky_color },
                        { label: 'Lucky Stone',  value: zodiacProfile.lucky_stone },
                        { label: 'Lucky Day',    value: zodiacProfile.lucky_day },
                        { label: 'Lucky Numbers', value: zodiacProfile.lucky_numbers.join(', ') },
                      ].map(({ label, value }) => (
                        <div key={label}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                          <div className="text-gray-400 mb-0.5 text-xs">{label}</div>
                          <div className="font-semibold text-gray-900 text-xs">{value ?? '—'}</div>
                        </div>
                      ))}
                    </div>
                    {/* Tarot */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-4">
                      <div className="text-xs font-bold text-indigo-800 mb-1">
                        🃏 Tarot Card: {zodiacProfile.tarot_card}
                      </div>
                      <div className="text-xs text-indigo-700">{zodiacProfile.tarot_meaning}</div>
                    </div>
                    {/* Compatibility */}
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-gray-700 mb-2">Compatibility</h4>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {zodiacProfile.love_compatibility.map(s => (
                          <span key={s} className="bg-green-100 text-green-700 text-xs
                                                    px-2 py-1 rounded-full">✓ {s}</span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {zodiacProfile.challenging_signs.map(s => (
                          <span key={s} className="bg-red-100 text-red-700 text-xs
                                                    px-2 py-1 rounded-full">✗ {s}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <strong>Career: </strong>{zodiacProfile.career_strengths}
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Western zodiac requires an exact birth date (day and month).
                  </div>
                )}
              </div>
            )}

            {/* VEDIC TAB — only in DOM when active */}
            {activeTab === 'vedic' && (
              <div data-testid="tab-content-vedic" className="animate-in fade-in">
                {rashiProfile ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {rashiProfile.rashi} ({rashiProfile.rashi_devanagari}) — {rashiProfile.western_equivalent}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                      <span>Lord: {rashiProfile.lord} ({rashiProfile.lord_devanagari})</span>
                      <span>•</span>
                      <span>{rashiProfile.element}</span>
                      <span>•</span>
                      <span>{rashiProfile.quality}</span>
                      <span>•</span>
                      <span>{rashiProfile.symbol}</span>
                    </div>
                    {/* Lucky elements 8-cell grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
                      {[
                        { label: 'Lucky Stone',     value: `${rashiProfile.lucky_stone} (${rashiProfile.lucky_stone_hindi})` },
                        { label: 'Lucky Colour',    value: rashiProfile.lucky_colors[0] },
                        { label: 'Lucky Day',       value: rashiProfile.lucky_day },
                        { label: 'Lucky Number',    value: rashiProfile.lucky_numbers.join(', ') },
                        { label: 'Direction',       value: rashiProfile.lucky_direction },
                        { label: 'Metal',           value: rashiProfile.lucky_metal },
                        { label: 'Ruling Deity',    value: rashiProfile.ruling_deity },
                        { label: 'Body',            value: rashiProfile.body_part },
                      ].map(({ label, value }) => (
                        <div key={label}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                          <div className="text-gray-400 mb-0.5 text-xs">{label}</div>
                          <div className="font-semibold text-gray-900 text-xs leading-tight">{value}</div>
                        </div>
                      ))}
                    </div>
                    {/* Mantra */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                      <div className="text-xs font-bold text-amber-800 mb-1">🕉 Mantra</div>
                      <div className="text-sm font-medium text-amber-900">{rashiProfile.mantra}</div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      {rashiProfile.personality_summary}
                    </p>
                    {/* Strengths + Challenges */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <h4 className="text-xs font-bold text-green-700 mb-2">Strengths</h4>
                        <div className="flex flex-wrap gap-1">
                          {rashiProfile.strengths.map(s => (
                            <span key={s} className="bg-green-100 text-green-800 text-xs
                                                      px-2 py-1 rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-red-700 mb-2">Challenges</h4>
                        <div className="flex flex-wrap gap-1">
                          {rashiProfile.challenges.map(c => (
                            <span key={c} className="bg-red-100 text-red-800 text-xs
                                                      px-2 py-1 rounded-full">{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                      <strong>Career: </strong>{rashiProfile.career_strengths}
                    </p>
                    <div className="mb-3">
                      <h4 className="text-xs font-bold text-gray-700 mb-1">Compatible Rashis</h4>
                      <div className="flex flex-wrap gap-1">
                        {rashiProfile.compatible_rashis.map(r => (
                          <span key={r} className="bg-green-100 text-green-700 text-xs
                                                    px-2 py-1 rounded-full">✓ {r}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                      <h4 className="text-xs font-bold text-amber-800 mb-1">Health Tendencies</h4>
                      <p className="text-xs text-amber-900">{rashiProfile.health_tendencies}</p>
                    </div>
                    <p className="text-xs text-gray-400 italic">
                      Note: For precise Rashi, exact birth time and location are required. This is an approximate calculation.
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Vedic Rashi calculation requires an exact birth date (day and month).
                  </div>
                )}
              </div>
            )}

            {/* CHINESE TAB */}
            {activeTab === 'chinese' && (
              <div data-testid="tab-content-chinese" className="animate-in fade-in">
                {chineseProfile ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {chineseProfile.emoji} Year of the {chineseProfile.animal}
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({chineseProfile.element_fixed} {chineseProfile.yin_yang})
                      </span>
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      {chineseProfile.personality_summary}
                    </p>
                    {/* Lucky and Unlucky */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                      <div>
                        <h4 className="font-bold text-green-700 mb-2">Lucky</h4>
                        <p className="text-gray-600">Numbers: {chineseProfile.lucky_numbers.join(', ')}</p>
                        <p className="text-gray-600">Colours: {chineseProfile.lucky_colors.join(', ')}</p>
                        <p className="text-gray-600">Flowers: {chineseProfile.lucky_flowers.join(', ')}</p>
                        <p className="text-gray-600">Directions: {chineseProfile.lucky_directions.join(', ')}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-red-700 mb-2">Unlucky</h4>
                        <p className="text-gray-600">Numbers: {chineseProfile.unlucky_numbers.join(', ')}</p>
                        <p className="text-gray-600">Colours: {chineseProfile.unlucky_colors.join(', ')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <h4 className="text-xs font-bold text-green-700 mb-2">Strengths</h4>
                        <div className="flex flex-wrap gap-1">
                          {chineseProfile.strengths.map(s => (
                            <span key={s} className="bg-green-100 text-green-800 text-xs
                                                      px-2 py-1 rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-red-700 mb-2">Weaknesses</h4>
                        <div className="flex flex-wrap gap-1">
                          {chineseProfile.weaknesses.map(w => (
                            <span key={w} className="bg-red-100 text-red-800 text-xs
                                                      px-2 py-1 rounded-full">{w}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <h4 className="text-xs font-bold text-gray-700 mb-1">Best Match</h4>
                      <div className="flex flex-wrap gap-1">
                        {chineseProfile.best_match.map(a => (
                          <span key={a} className="bg-green-100 text-green-700 text-xs
                                                    px-2 py-1 rounded-full">✓ {a}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <h4 className="text-xs font-bold text-gray-700 mb-1">Challenging Match</h4>
                      <div className="flex flex-wrap gap-1">
                        {chineseProfile.worst_match.map(a => (
                          <span key={a} className="bg-red-100 text-red-700 text-xs
                                                    px-2 py-1 rounded-full">✗ {a}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <strong>Career: </strong>{chineseProfile.career_strengths}
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Chinese zodiac requires a birth year.
                  </div>
                )}
              </div>
            )}

            {/* NUMEROLOGY TAB */}
            {activeTab === 'numerology' && (
              <div data-testid="tab-content-numerology" className="animate-in fade-in">
                {lpExtended && lifePath ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-indigo-100 border-2 border-indigo-300 rounded-full
                                      flex items-center justify-center text-2xl font-black text-indigo-700">
                        {lifePath}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Life Path {lifePath}</h3>
                        <p className="text-gray-500 text-sm">{lpExtended.title}</p>
                        <p className="text-xs text-gray-400">
                          {lpExtended.ruling_planet} · {lpExtended.element}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">{lpExtended.traits}</p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <h4 className="text-xs font-bold text-green-700 mb-2">Strengths</h4>
                        <div className="flex flex-wrap gap-1">
                          {lpExtended.strengths.map(s => (
                            <span key={s} className="bg-green-100 text-green-800 text-xs
                                                      px-2 py-1 rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-red-700 mb-2">Challenges</h4>
                        <div className="flex flex-wrap gap-1">
                          {lpExtended.challenges.map(c => (
                            <span key={c} className="bg-red-100 text-red-800 text-xs
                                                      px-2 py-1 rounded-full">{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-3">
                      <h4 className="text-xs font-bold text-indigo-800 mb-1">💖 Love Style</h4>
                      <p className="text-xs text-indigo-900">{lpExtended.love_style}</p>
                    </div>
                    <div className="mb-3">
                      <h4 className="text-xs font-bold text-gray-700 mb-2">Career Paths</h4>
                      <div className="flex flex-wrap gap-1">
                        {lpExtended.career_paths.map(c => (
                          <span key={c} className="bg-gray-100 text-gray-700 text-xs
                                                    px-2 py-1 rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-3">
                      <h4 className="text-xs font-bold text-purple-800 mb-1">✨ Spiritual Lesson</h4>
                      <p className="text-xs text-purple-900">{lpExtended.spiritual_lesson}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                        <div className="text-gray-400 mb-0.5">Lucky Colour</div>
                        <div className="font-semibold text-gray-900">{lpExtended.lucky_color}</div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                        <div className="text-gray-400 mb-0.5">Lucky Stone</div>
                        <div className="font-semibold text-gray-900">{lpExtended.lucky_stone}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Life Path numerology requires a full date of birth.
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── PLANETARY AGES (full DOB only) ── */}
          {planetary.length > 0 && (
            <section className="mb-10" aria-labelledby="planetary-heading">
              <h2 id="planetary-heading" className="text-2xl font-black text-gray-900 mb-4 pb-3 border-b border-gray-200">
                {name}'s Age on Other Planets
              </h2>
              <div data-testid="planetary-table-wrapper" className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm min-w-[420px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th scope="col" className="text-left px-4 py-3 font-bold text-gray-700">Planet</th>
                      <th scope="col" className="text-right px-4 py-3 font-bold text-gray-700">Age (planet years)</th>
                      <th scope="col" className="text-right px-4 py-3 font-bold text-gray-700">Orbit (Earth years)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planetary.map((p, i) => (
                      <tr key={p.planet} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-gray-900">{p.emoji} {p.planet}</td>
                        <td className="px-4 py-3 text-right font-bold text-indigo-700">{p.age.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{p.orbit_years}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── BIRTHDAY TWINS ── */}
          <section className="mb-10" aria-labelledby="twins-heading">
            <h2 id="twins-heading" className="text-2xl font-black text-gray-900 mb-4 pb-3 border-b border-gray-200">
              Celebrity Birthday Twins
            </h2>
            {!isFull ? (
              <p data-testid="twins-no-full-dob" className="text-gray-600 text-sm bg-gray-50 border border-gray-200 rounded-xl p-4">
                Birthday twins can only be matched when the exact birth date is known. Only {name}'s birth year is documented.
              </p>
            ) : twins.length === 0 ? (
              <p data-testid="twins-none-found" className="text-gray-600 text-sm bg-gray-50 border border-gray-200 rounded-xl p-4">
                No other celebrity in our database shares {name}'s exact birthday
                {bornOnSlug ? '' : ''}. {bornOnSlug && (
                  <Link to={`/born-on/${bornOnSlug}/india`} className="text-indigo-600 hover:underline">See everyone born on this date →</Link>
                )}
              </p>
            ) : (
              <>
                <p className="text-gray-600 text-sm mb-4">
                  {twins.length} other {twins.length === 1 ? 'celebrity shares' : 'celebrities share'} {name}'s birthday
                  {isFull ? ` (${MONTH_NAMES[dob!.month - 1]} ${dob!.day})` : ''}:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {twins.map(t => {
                    const tSlug = CELEB_TO_SLUG.get(t);
                    const tName = String(t.name);
                    const tCat = String(t.category || '');
                    return tSlug ? (
                      <Link
                        key={tSlug}
                        to={`/celebrity/${tSlug}/`}
                        data-testid="birthday-twin-link"
                        className="flex flex-col p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                      >
                        <span className="font-semibold text-sm text-gray-900">{tName}</span>
                        <span className="text-xs text-gray-500">{tCat}</span>
                      </Link>
                    ) : null;
                  })}
                </div>
                {bornOnSlug && (
                  <p className="text-sm mt-4">
                    <Link to={`/born-on/${bornOnSlug}/india`} className="text-indigo-600 hover:underline">
                      See all Indians born on {MONTH_NAMES[dob!.month - 1]} {dob!.day} →
                    </Link>
                  </p>
                )}
              </>
            )}
          </section>

          {/* ── FAQ ── */}
          <section data-testid="faq-section" className="mb-10" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl font-black text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Frequently Asked Questions About {name}
            </h2>
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                  <h3 data-testid="faq-question" className="font-bold text-gray-900 mb-2">{f.q}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── RELATED ── */}
          <section className="mb-10 bg-gray-50 rounded-2xl border border-gray-200 p-6" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-xl font-bold text-gray-900 mb-4">Explore More</h2>
            <div className="flex flex-wrap gap-3">
              <Link to="/celebrity/" className="text-sm px-4 py-2 rounded-full border border-gray-200 bg-white hover:border-indigo-300 hover:text-indigo-700 transition-colors">All Celebrity Profiles</Link>
              {CATEGORY_CONFIG[category] && (
                <Link to={`/celebrity/${hubSlug}/`} className="text-sm px-4 py-2 rounded-full border border-gray-200 bg-white hover:border-indigo-300 hover:text-indigo-700 transition-colors">More {hubLabel} celebrities</Link>
              )}
              {bornOnSlug && (
                <Link to={`/born-on/${bornOnSlug}/india`} className="text-sm px-4 py-2 rounded-full border border-gray-200 bg-white hover:border-indigo-300 hover:text-indigo-700 transition-colors">Born on {MONTH_NAMES[dob!.month - 1]} {dob!.day}</Link>
              )}
            </div>
          </section>

          {/* ── CTA ── */}
          <div className="bg-gradient-to-br from-primary to-primary rounded-2xl p-8 text-center text-white" role="complementary">
            <h2 className="text-2xl font-black mb-2">Get Your Own Birthday Intelligence Report</h2>
            <p className="text-indigo-100 mb-6 max-w-md mx-auto">
              Discover your celebrity birthday twins, zodiac profiles, numerology, and life path — just like {name}'s.
            </p>
            <Link
              to={ctaHref}
              data-testid="cta-birthday-report"
              className="inline-block bg-white text-primary hover:bg-indigo-50 font-black py-4 px-8 rounded-xl transition-colors text-lg"
            >
              Generate My Free Birthday Report →
            </Link>
            <p className="text-indigo-200 text-xs mt-3">Free · Instant · No account required</p>
          </div>
        </div>
      </main>
    </>
  );
}

export default CelebrityPage;
