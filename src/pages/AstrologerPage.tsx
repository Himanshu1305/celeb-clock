import { Link } from 'react-router-dom';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { KundaliTabs } from '@/components/KundaliTabs';
import { AstrologerChat } from '@/components/AstrologerChat';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { useAuth } from '@/hooks/useAuth';

export default function AstrologerPage() {
  const { profile, loaded, isFull } = useSavedProfile();
  // Part N: unlimited testing for a verified admin. `isAdmin` (from the logged-in
  // email) drives the UI; `session.access_token` is what the SERVER verifies to
  // actually grant it — the two must agree, and the server is authoritative.
  const { isAdmin, session } = useAuth();

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="astrologer-page"
      seo={(
        <SEO
          title="Ask Your Personal Astrologer — AI Vedic Chat | BornClock"
          description="Chat privately with a personal AI astrologer grounded in your own Vedic birth chart. Ask about career, relationships and life — thoughtful, judgment-free, never a verdict."
          canonicalUrl="/astrologer"
          ogType="website"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Ask Your Astrologer', edition: 'AI Vedic chat' }}
      footer={{
        tagline: 'A private conversation grounded in your own Vedic birth chart.',
        nav: [
          { label: 'Vedic Astrology', to: '/vedic-astrology' },
          { label: 'Kundali', to: '/kundali' },
          { label: 'Sade Sati', to: '/sade-sati' },
          { label: 'Gemstones', to: '/gemstones' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Vedic astrology, computed with care.',
      }}
    >
      <section className="section">
        <div className="max-w-3xl mx-auto">
          <div className="section-head">
            <div><span className="eyebrow">Ask your astrologer</span><h1>Ask Your Personal Astrologer.</h1></div>
            <p>
              A private, judgment-free conversation grounded in your own birth chart. Traditional guidance, offered
              gently — one perspective among many, never a verdict.
            </p>
          </div>

          <KundaliTabs active="astrologer" />

          {loaded && isFull ? (
            <AstrologerChat profile={profile} isAdmin={isAdmin} accessToken={session?.access_token ?? null} />
          ) : loaded ? (
            <div data-testid="astrologer-no-profile" className="rounded-xl border border-[#6E5AA6]/30 bg-[#6E5AA6]/10 p-6 text-center">
              <p className="text-[#6E5AA6] font-semibold mb-2">{profile ? 'Just add your birth time and place' : 'First, add your birth details'}</p>
              <p className="text-sm text-[#6E5AA6]/80 mb-4">
                {profile
                  ? `We have your birth date (${profile.dob}) saved. Your astrologer answers from your full chart, so it also needs your birth time and place — add them once on the Kundali page and come back here.`
                  : 'Your astrologer answers from your real chart, so it needs your date, time and place of birth. Add them once on the Kundali page (you choose whether to save them) and come back here.'}
              </p>
              <Link to="/kundali" data-testid="astrologer-add-details"
                    className="inline-flex items-center gap-2 bg-[#0E2238] text-white rounded-lg px-6 py-3 font-semibold hover:bg-[#0E2238]">
                {profile ? 'Complete my birth details →' : 'Add my birth details →'}
              </Link>
            </div>
          ) : null}

          <p className="mt-6 text-xs text-muted-foreground">
            This is traditional astrology for reflection and entertainment — not medical, legal, or financial advice.
            If you're going through a hard time, please reach out to a doctor or a local support line.
          </p>
        </div>
      </section>
    </PajPage>
  );
}
