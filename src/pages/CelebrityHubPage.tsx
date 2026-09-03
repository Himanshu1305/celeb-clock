import { useParams, useLocation, Navigate, Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { indianCelebrities } from '@/data/indianCelebrities';
import {
  generateAllSlugs, HUB_SLUGS, getHubConfig, getCategoryHubSlug,
} from '@/utils/celebrityUtils';

const SLUG_MAP = generateAllSlugs(indianCelebrities as unknown as Record<string, unknown>[]);
const CELEB_TO_SLUG = new Map<Record<string, unknown>, string>();
SLUG_MAP.forEach((celeb, slug) => CELEB_TO_SLUG.set(celeb, slug));

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function CelebrityHubPage() {
  const params = useParams<{ category?: string }>();
  const location = useLocation();
  // Works for both the explicit routes (/celebrity/bollywood) and the test
  // harness route (/celebrity/:category/).
  const hubSlug = (params.category
    || location.pathname.replace(/\/+$/, '').split('/').pop()
    || '').toLowerCase();

  if (!HUB_SLUGS.includes(hubSlug)) return <Navigate to="/celebrity/" replace />;

  const cfg = getHubConfig(hubSlug);
  const celebs = (indianCelebrities as unknown as Record<string, unknown>[])
    .filter(c => getCategoryHubSlug(String(c.category || '')) === hubSlug)
    .map(c => ({ slug: CELEB_TO_SLUG.get(c) || '', name: String(c.name), category: String(c.category || '') }))
    .filter(c => c.slug)
    .sort((a, b) => a.name.localeCompare(b.name));

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bornclock.com' },
      { '@type': 'ListItem', position: 2, name: 'Celebrity Profiles', item: 'https://bornclock.com/celebrity/' },
      { '@type': 'ListItem', position: 3, name: cfg.label, item: `https://bornclock.com/celebrity/${hubSlug}/` },
    ],
  };

  return (
    <>
      <SEO
        title={`${cfg.h1} | BornClock`.length <= 70 ? `${cfg.h1} | BornClock` : `${cfg.label} Celebrity Profiles | BornClock`}
        description={cfg.desc}
        canonicalUrl={`/celebrity/${hubSlug}`}
        ogType="website"
      />
      <JsonLd data={breadcrumbSchema} />

      <main data-testid="celebrity-hub-page" className="min-h-screen bg-white">
        {/* ── BREADCRUMB ── */}
        <nav aria-label="Breadcrumb" className="max-w-5xl mx-auto px-4 pt-4">
          <ol className="flex items-center gap-2 text-sm text-gray-400 flex-wrap list-none p-0">
            <li data-testid="breadcrumb-item"><Link to="/" className="hover:text-indigo-600">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li data-testid="breadcrumb-item"><Link to="/celebrity/" className="hover:text-indigo-600">Celebrity Profiles</Link></li>
            <li aria-hidden="true">›</li>
            <li data-testid="breadcrumb-item" className="text-gray-700 font-medium" aria-current="page">{cfg.label}</li>
          </ol>
        </nav>

        {/* ── HERO ── */}
        <section aria-labelledby="page-h1" className="bg-gradient-to-br from-indigo-50 to-indigo-50 border-b border-indigo-100 py-10 px-4 mt-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              ⭐ {celebs.length} {cfg.label} Profiles
            </div>
            <h1 id="page-h1" className="text-3xl sm:text-4xl lg:text-5xl font-black gradient-text-primary leading-tight mb-3">
              {cfg.h1}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">{cfg.desc}</p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 pb-16">
          <section className="mt-8" aria-labelledby="list-heading">
            <h2 id="list-heading" className="text-2xl font-black text-gray-900 mb-4 pb-3 border-b border-gray-200">
              {cfg.label} Celebrities (A–Z)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {celebs.map(c => (
                <Link
                  key={c.slug}
                  to={`/celebrity/${c.slug}/`}
                  data-testid="hub-celebrity-link"
                  className="flex flex-col p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <span className="font-semibold text-sm text-gray-900">{c.name}</span>
                  <span className="text-xs text-gray-500">{c.category}</span>
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <Link to="/celebrity/" className="text-sm text-indigo-600 hover:underline">← All celebrity profiles</Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default CelebrityHubPage;
