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
  it('TC-HERO-P-04: a primary CTA links to /birthday-report (Part AH: final-CTA card)', () => {
    renderPage();
    // Part AH redesign moved the Birthday Blueprint CTA into the final-CTA card block.
    const primary = document.querySelector('[data-testid="cta-birthday"]');
    expect(primary?.getAttribute('href')).toContain('birthday-report');
  });
  it('TC-HERO-N-01: Science & Longevity still accessible (Part AH: orbit tile + footer)', () => {
    renderPage();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('life-expectancy'))).toBe(true);
  });
  it('TC-HERO-EDGE-01: homepage renders without throwing', () => {
    expect(() => renderPage()).not.toThrow();
  });
});
