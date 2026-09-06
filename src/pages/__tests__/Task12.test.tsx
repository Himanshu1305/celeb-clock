// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, isPremium: false, isAdmin: false, isInTrial: false, trialDaysRemaining: 0, profile: null }),
}));

import BirthdayReportGiftPage from '../BirthdayReportGiftPage';
import BirthdayReport from '../BirthdayReport';

const renderGiftPage = () =>
  render(<HelmetProvider><MemoryRouter initialEntries={['/birthday-report/gift']}><BirthdayReportGiftPage /></MemoryRouter></HelmetProvider>);

const renderBirthdayReport = (opts: { dob?: string } = {}) =>
  render(<HelmetProvider><MemoryRouter initialEntries={[`/birthday-report${opts.dob ? `?dob=${opts.dob}` : ''}`]}><BirthdayReport /></MemoryRouter></HelmetProvider>);

const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);

describe('TC-KGIFT', () => {
  afterEach(() => cleanup());

  it('TC-KGIFT-P-01: renders', () => { renderGiftPage(); expect(q('gift-page')).toBeTruthy(); });
  it('TC-KGIFT-P-02: Kundali option visible', () => { renderGiftPage(); expect(document.body.textContent).toMatch(/Kundali|kundali/); });
  it('TC-KGIFT-P-03: shows 199', () => { renderGiftPage(); expect(document.body.textContent).toContain('₹199'); });
  it('TC-KGIFT-P-04: 299 only on combo card; individual products are 199 (scoped to product cards — global nav/footer legitimately link "Birthday Report")', () => {
    renderGiftPage();
    const report = q('gift-product-report')?.textContent || '';
    const kundali = q('gift-product-kundali')?.textContent || '';
    const combo = q('gift-product-combo')?.textContent || '';
    expect(report).toContain('₹199');
    expect(report).not.toContain('₹299');
    expect(kundali).toContain('₹199');
    expect(kundali).not.toContain('₹299');
    expect(combo).toContain('₹299');
  });
  it('TC-KGIFT-P-05: recipient name input', () => { renderGiftPage(); expect(q('gift-recipient-name')).toBeTruthy(); });
  it('TC-KGIFT-P-06: recipient DOB input', () => { renderGiftPage(); expect(q('gift-recipient-dob')).toBeTruthy(); });
  it('TC-KGIFT-P-07: combo shows 299', () => { renderGiftPage(); const b = document.body.textContent || ''; expect(b).toContain('₹299'); expect(b.toLowerCase()).toContain('combo'); });
  it('TC-KGIFT-N-01: pay button disabled without name', () => { renderGiftPage(); expect((q('gift-pay-btn') as HTMLButtonElement)?.disabled).toBe(true); });
  it('TC-KGIFT-N-02: no undefined', () => { renderGiftPage(); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-KGIFT-D-01: original birthday report still works', () => { renderBirthdayReport({ dob: '1988-11-05' }); expect(document.body.textContent).not.toContain('undefined'); expect(document.body.textContent).toMatch(/Scorpio|zodiac/i); });
});
