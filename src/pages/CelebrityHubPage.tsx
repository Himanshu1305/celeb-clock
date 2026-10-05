import { useParams, useLocation, Navigate, Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { CollectionLayout } from '@/components/central';
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
    <CollectionLayout
      theme="birthday"
      testId="celebrity-hub-page"
      seo={(
        <>
          <SEO
            title={`${cfg.h1} | BornClock`.length <= 70 ? `${cfg.h1} | BornClock` : `${cfg.label} Celebrity Profiles | BornClock`}
            description={cfg.desc}
            canonicalUrl={`/celebrity/${hubSlug}`}
            ogType="website"
          />
          <JsonLd data={breadcrumbSchema} />
        </>
      )}
      breadcrumb={{ trail: [{ label: 'Celebrities', to: '/celebrity' }], current: cfg.label }}
      footer={{
        tagline: cfg.desc,
        nav: [
          { label: 'Celebrities', to: '/celebrity' },
          { label: 'Birthdays Today', to: '/todays-birthdays' },
          { label: 'Born On', to: '/born-on' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Celebrity birthdays.',
      }}
      eyebrow={`⭐ ${celebs.length} ${cfg.label} Profiles`}
      h1={cfg.h1}
      lead={<>{cfg.desc}</>}
    >
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
                  className="flex flex-col p-4 bg-white rounded-xl border border-gray-200 hover:border-[#6E5AA6]/30 hover:bg-[#6E5AA6]/10 transition-colors"
                >
                  <span className="font-semibold text-sm text-gray-900">{c.name}</span>
                  <span className="text-xs text-gray-500">{c.category}</span>
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <Link to="/celebrity/" className="text-sm text-[#6E5AA6] hover:underline">← All celebrity profiles</Link>
            </div>
          </section>
        </div>
    </CollectionLayout>
  );
}

export default CelebrityHubPage;
