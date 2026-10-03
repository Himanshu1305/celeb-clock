// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';

// Mock contexts/hooks + data services so the homepage renders hermetically (no Supabase/network).
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, profile: null, isPremium: false, signOut: vi.fn() }),
}));
vi.mock('@/hooks/useIsAdmin', () => ({ useIsAdmin: () => ({ isAdmin: false }) }));
vi.mock('@/context/BirthDateContext', () => ({
  useBirthDate: () => ({ birthDate: null, setBirthDate: vi.fn() }),
  BirthDateProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@/hooks/useSavedProfile', () => ({ useSavedProfile: () => ({ profile: null }) }));
vi.mock('@/services/BirthdaySearchService', () => ({ getRankedBirthdayCelebrities: () => Promise.resolve([]) }));
vi.mock('@/services/WikipediaImageService', () => ({ fetchCelebrityImage: () => Promise.resolve(null) }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({ select: () => ({ eq: () => Promise.resolve({ count: 0 }) }) }),
    auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }), getSession: () => Promise.resolve({ data: { session: null } }) },
  },
}));

import Index from '@/pages/Index';

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    </HelmetProvider>
  );

describe('Homepage (Part AN) — TC-HERO', () => {
  afterEach(() => cleanup());

  it('TC-HERO-P-03: H1 is the finalized birth-framing headline', () => {
    renderPage();
    const h1 = document.querySelector('h1')?.textContent?.toLowerCase() || '';
    expect(h1.includes('birth')).toBe(true);
    expect(document.querySelectorAll('h1').length).toBe(1); // exactly one h1
  });

  it('TC-HERO-P-04: primary flow ("See your full birthday profile") present AND /birthday-report reachable', () => {
    renderPage();
    const hasPrimaryFlow = Array.from(document.querySelectorAll('button'))
      .some(b => /see your full birthday profile/i.test(b.textContent || ''));
    expect(hasPrimaryFlow).toBe(true);
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('birthday-report'))).toBe(true);
  });

  it('TC-HERO-N-01: Science & Longevity still reachable (life-expectancy)', () => {
    renderPage();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('life-expectancy'))).toBe(true);
  });

  it('TC-HERO-P-05: example labelling shown when no date entered / no saved profile', () => {
    renderPage();
    expect(/example:/i.test(document.body.textContent || '')).toBe(true);
    // clock heading reads as an example, not "you've been alive"
    expect(/EXAMPLE — ALIVE FOR/i.test(document.body.textContent || '')).toBe(true);
  });

  it('TC-HERO-EDGE-01: homepage renders without throwing', () => {
    expect(() => renderPage()).not.toThrow();
  });
});
