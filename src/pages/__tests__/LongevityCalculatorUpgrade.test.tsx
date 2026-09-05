// @vitest-environment jsdom
import { afterEach, describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LongevityCalculatorPage } from '../LongevityCalculatorPage';

afterEach(cleanup);

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/longevity-calculator']}>
        <LongevityCalculatorPage />
      </MemoryRouter>
    </HelmetProvider>
  );

describe('LongevityCalculatorPage — Task 31 upgrade blocks', () => {

  it('TC-UP-01: WhatsApp share block is present', () => {
    renderPage();
    const share = document.querySelector('[data-testid="longevity-whatsapp-share"]');
    expect(share).toBeTruthy();
    // and the underlying share button rendered with a wa.me link
    const btn = share?.querySelector('[data-testid="whatsapp-share-btn"]');
    expect(btn).toBeTruthy();
    expect(btn?.getAttribute('href')).toContain('wa.me');
  });

  it('TC-UP-02: PDF CTA links to /birthday-report', () => {
    renderPage();
    const cta = document.querySelector('[data-testid="longevity-pdf-cta"]');
    expect(cta).toBeTruthy();
    expect(cta?.getAttribute('href')).toBe('/birthday-report');
  });

  it('TC-UP-03: comparison teaser is present with the expected copy', () => {
    renderPage();
    const teaser = document.querySelector('[data-testid="longevity-comparison-teaser"]');
    expect(teaser).toBeTruthy();
    expect(teaser?.textContent).toContain('70.2 years');
  });

  it('TC-UP-04: page still has exactly one H1', () => {
    renderPage();
    expect(document.querySelectorAll('h1').length).toBe(1);
  });

});
