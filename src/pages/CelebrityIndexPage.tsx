import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { indianCelebrities } from '@/data/indianCelebrities';
import { generateAllSlugs, HUB_SLUGS, getHubConfig } from '@/utils/celebrityUtils';

const SLUG_MAP = generateAllSlugs(indianCelebrities as unknown as Record<string, unknown>[]);
const CELEB_TO_SLUG = new Map<Record<string, unknown>, string>();
SLUG_MAP.forEach((celeb, slug) => CELEB_TO_SLUG.set(celeb, slug));

// A-Z ordered list of every celebrity with its slug.
const ALL_CELEBS = Array.from(SLUG_MAP.entries())
  .map(([slug, celeb]) => ({ slug, name: String(celeb.name), category: String(celeb.category || '') }))
  .sort((a, b) => a.name.localeCompare(b.name));

// 8 featured (must exist in the data — resolved from the slug map by name).
const FEATURED_NAMES = [
  'Virat Kohli', 'Sachin Tendulkar', 'Shah Rukh Khan', 'Amitabh Bachchan',
  'AR Rahman', 'Lata Mangeshkar', 'Narendra Modi', 'Ratan Tata',
];
const FEATURED = FEATURED_NAMES
  .map(n => {
    const entry = ALL_CELEBS.find(c => c.name === n);
    return entry || null;
  })
  .filter((e): e is { slug: string; name: string; category: string } => e !== null);

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function CelebrityIndexPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bornclock.com' },
      { '@type': 'ListItem', position: 2, name: 'Celebrity Profiles', item: 'https://bornclock.com/celebrity/' },
    ],
  };

  return (
    <>
      <SEO
        title={`Indian Celebrity Birthday Profiles — ${indianCelebrities.length} Profiles | BornClock`}
        description={`Birthday, age, zodiac and numerology profiles for ${indianCelebrities.length} Indian celebrities — actors, cricketers, singers, leaders and more.`}
        canonicalUrl="/celebrity"
        ogType="website"
      />
      <JsonLd data={breadcrumbSchema} />

      <main data-testid="celebrity-index-page" className="min-h-screen bg-white">
        {/* ── BREADCRUMB ── */}
        <nav aria-label="Breadcrumb" className="max-w-5xl mx-auto px-4 pt-4">
          <ol className="flex items-center gap-2 text-sm text-gray-400 flex-wrap list-none p-0">
            <li data-testid="breadcrumb-item"><Link to="/" className="hover:text-indigo-600">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li data-testid="breadcrumb-item" className="text-gray-700 font-medium" aria-current="page">Celebrity Profiles</li>
          </ol>
        </nav>

        {/* ── HERO ── */}
        <section aria-labelledby="page-h1" className="bg-gradient-to-br from-indigo-50 to-indigo-50 border-b border-indigo-100 py-10 px-4 mt-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              ⭐ {indianCelebrities.length} Indian Celebrities
            </div>
            <h1 id="page-h1" className="text-3xl sm:text-4xl lg:text-5xl font-black gradient-text-primary leading-tight mb-3">
              Indian Celebrity Birthday Profiles
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Birthday, age, zodiac sign, numerology and life-path profiles for {indianCelebrities.length} Indian celebrities — every fact calculated from date of birth.
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 pb-16">
          {/* ── CATEGORY HUBS ── */}
          <section className="mt-8 mb-10" aria-labelledby="hubs-heading">
            <h2 id="hubs-heading" className="text-2xl font-black text-gray-900 mb-4 pb-3 border-b border-gray-200">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {HUB_SLUGS.map(hub => {
                const cfg = getHubConfig(hub);
                return (
                  <Link
                    key={hub}
                    to={`/celebrity/${hub}/`}
                    data-testid="category-hub-link"
                    className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="font-bold text-sm text-gray-900">{cfg.label}</div>
                    <div className="text-xs text-gray-500">{cfg.label} celebrity profiles</div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ── FEATURED ── */}
          {FEATURED.length > 0 && (
            <section className="mb-10" aria-labelledby="featured-heading">
              <h2 id="featured-heading" className="text-2xl font-black text-gray-900 mb-4 pb-3 border-b border-gray-200">Featured Profiles</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {FEATURED.map(f => (
                  <Link
                    key={f.slug}
                    to={`/celebrity/${f.slug}/`}
                    data-testid="featured-celebrity-link"
                    className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 hover:border-indigo-400 transition-colors text-center"
                  >
                    <div className="font-semibold text-sm text-gray-900">{f.name}</div>
                    <div className="text-xs text-gray-500">{f.category}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── FULL A-Z LIST ── */}
          <section aria-labelledby="all-heading">
            <h2 id="all-heading" className="text-2xl font-black text-gray-900 mb-4 pb-3 border-b border-gray-200">
              All {indianCelebrities.length} Celebrities (A–Z)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
              {ALL_CELEBS.map(c => (
                <Link
                  key={c.slug}
                  to={`/celebrity/${c.slug}/`}
                  data-testid="celebrity-index-link"
                  className="text-sm text-gray-700 hover:text-indigo-700 hover:underline py-1 truncate"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default CelebrityIndexPage;
