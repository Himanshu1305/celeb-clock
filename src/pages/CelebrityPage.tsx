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

          {/* ── ZODIAC CARDS ── */}
          <section className="mb-10" aria-labelledby="zodiac-heading">
            <h2 id="zodiac-heading" className="text-2xl font-black text-gray-900 mb-4 pb-3 border-b border-gray-200">
              {name}'s Astrological Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {western && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
                  <div className="text-3xl mb-1" aria-hidden="true">{western.symbol}</div>
                  <div className="font-bold text-indigo-900">Western: {western.sign}</div>
                  <div className="text-xs text-gray-500 mb-1">{western.date_range} · {western.element} · {western.ruling_planet}</div>
                  <p className="text-sm text-gray-700">{western.traits}</p>
                </div>
              )}
              {chinese && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
                  <div className="text-3xl mb-1" aria-hidden="true">{chinese.emoji}</div>
                  <div className="font-bold text-indigo-900">Chinese: {chinese.animal}</div>
                  <div className="text-xs text-gray-500 mb-1">{chinese.element} {chinese.animal}</div>
                  <p className="text-sm text-gray-700">{chinese.traits}</p>
                </div>
              )}
              {vedic && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
                  <div className="text-3xl mb-1" aria-hidden="true">🕉️</div>
                  <div className="font-bold text-indigo-900">Vedic: {vedic.rashi}</div>
                  <div className="text-xs text-gray-500 mb-1">Lord {vedic.lord} · {vedic.element}</div>
                  <p className="text-sm text-gray-700">{vedic.traits}</p>
                </div>
              )}
            </div>
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
