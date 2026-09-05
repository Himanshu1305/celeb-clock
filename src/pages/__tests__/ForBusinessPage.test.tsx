// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ForBusinessPage from '../ForBusinessPage';
import { CelebrityPage } from '../CelebrityPage';

const renderB2B = () =>
  render(<HelmetProvider><MemoryRouter initialEntries={['/for-business']}><ForBusinessPage /></MemoryRouter></HelmetProvider>);

const renderCeleb = (slug: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/celebrity/${slug}`]}>
        <Routes>
          <Route path="/celebrity/:slug" element={<CelebrityPage />} />
          <Route path="/celebrity/" element={<div>Index</div>} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

describe('B2B + Cosmic Twins — TC-B2B', () => {
  beforeEach(() => { try { localStorage.clear(); } catch { /* noop */ } });
  afterEach(() => cleanup());

  it('TC-B2B-P-01: /for-business renders without crash', () => {
    expect(() => renderB2B()).not.toThrow();
  });
  it('TC-B2B-P-02: API pricing section visible', () => {
    renderB2B();
    const text = document.body.textContent || '';
    expect(text).toMatch(/₹\d|API|pricing|plan/i);
  });
  it('TC-B2B-P-03: contact CTA (email link) present', () => {
    renderB2B();
    const mailto = document.querySelector('a[href^="mailto:"]');
    expect(mailto).toBeTruthy();
  });
  it('TC-B2B-N-01: no undefined / [object Object] on page', () => {
    renderB2B();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-B2B-EDGE-01: Cosmic Twins section absent without a matching saved DOB', () => {
    renderCeleb('virat-kohli');
    expect(document.querySelector('[data-testid="cosmic-twins"]')).toBeFalsy();
  });
});
