// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';

// Mock auth + birthdate context so the homepage renders without Supabase/session.
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, profile: null, isPremium: false }),
}));
vi.mock('@/context/BirthDateContext', () => ({
  useBirthDate: () => ({ birthDate: null, setBirthDate: vi.fn() }),
  BirthDateProvider: ({ children }: { children: React.ReactNode }) => children,
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

describe('Homepage Hero — TC-HERO', () => {
  afterEach(() => cleanup());

  it('TC-HERO-P-03: H1 references birthday, not longevity, as the primary framing', () => {
    renderPage();
    const h1 = document.querySelector('h1')?.textContent?.toLowerCase() || '';
    expect(h1.includes('birthday') || h1.includes('birth')).toBe(true);
  });
  it('TC-HERO-P-04: primary CTA links to /birthday-report', () => {
    renderPage();
    const primary = document.querySelector('[data-testid="hero-primary-cta"]');
    expect(primary?.getAttribute('href')).toContain('birthday-report');
  });
  it('TC-HERO-N-01: longevity still accessible below the fold', () => {
    renderPage();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('longevity'))).toBe(true);
  });
  it('TC-HERO-EDGE-01: homepage renders without throwing', () => {
    expect(() => renderPage()).not.toThrow();
  });
});
