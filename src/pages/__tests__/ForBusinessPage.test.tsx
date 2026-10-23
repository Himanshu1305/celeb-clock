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
  it('TC-B2B-P-02 (S16): marked "Coming soon — join the waitlist"; no prices or SLA claims', () => {
    renderB2B();
    const text = document.body.textContent || '';
    expect(text).toContain('Coming soon — join the waitlist');
    expect(text).not.toMatch(/₹\s?\d/);
    expect(text).not.toMatch(/SLA|99\.9|uptime/i);
    expect(text).not.toMatch(/\/mo\b|per month|API calls/i);
  });
  it('TC-B2B-P-03 (S16): contact uses the official hello@bornclock.com, never a personal Gmail', () => {
    renderB2B();
    const mailtos = Array.from(document.querySelectorAll('a[href^="mailto:"]')).map(a => a.getAttribute('href') || '');
    expect(mailtos.length).toBeGreaterThan(0);
    mailtos.forEach(h => expect(h).toMatch(/^mailto:hello@bornclock\.com/));
    expect(document.body.innerHTML).not.toMatch(/gmail\.com/i);
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
