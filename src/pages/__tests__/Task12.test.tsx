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
  // Audit round 2, item 6 (Oct 2026): "Kundali ₹199" and "Combo ₹299" gift
  // listings were removed — neither product exists. Only the Birthday Blueprint.
  it('TC-KGIFT-P-02: no Kundali or Combo gift listing (products that do not exist)', () => {
    renderGiftPage();
    expect(q('gift-product-kundali')).toBeNull();
    expect(q('gift-product-combo')).toBeNull();
    expect((q('gift-products')?.textContent || '').toLowerCase()).not.toMatch(/kundali|combo/);
  });
  it('TC-KGIFT-P-03: shows 199', () => { renderGiftPage(); expect(document.body.textContent).toContain('₹199'); });
  it('TC-KGIFT-P-04: the only product card is the Birthday Blueprint at 199; no 299 anywhere', () => {
    renderGiftPage();
    const report = q('gift-product-report')?.textContent || '';
    expect(report).toContain('Birthday Blueprint');
    expect(report).toContain('₹199');
    expect(document.body.textContent).not.toContain('₹299');
  });
  it('TC-KGIFT-P-05: recipient name input', () => { renderGiftPage(); expect(q('gift-recipient-name')).toBeTruthy(); });
  it('TC-KGIFT-P-06: recipient DOB input', () => { renderGiftPage(); expect(q('gift-recipient-dob')).toBeTruthy(); });
  it('TC-KGIFT-P-07: ?to= from the Diwali page prefills the recipient', () => {
    render(<HelmetProvider><MemoryRouter initialEntries={['/birthday-report/gift?to=Asha']}><BirthdayReportGiftPage /></MemoryRouter></HelmetProvider>);
    expect((q('gift-recipient-name') as HTMLInputElement).value).toBe('Asha');
  });
  it('TC-KGIFT-P-08: gift hand-off keeps recipient, giver and message on /birthday-report', () => {
    render(<HelmetProvider><MemoryRouter initialEntries={['/birthday-report?dob=1990-05-14&gift=1&to=Asha&from=Ravi&note=Happy%20birthday%20Asha']}><BirthdayReport /></MemoryRouter></HelmetProvider>);
    const values = Array.from(document.querySelectorAll('input, textarea')).map(el => (el as HTMLInputElement).value);
    expect(values).toContain('Asha');
    expect(values).toContain('Ravi');
    expect(values).toContain('Happy birthday Asha');
  });
  it('TC-KGIFT-N-01: pay button disabled without name', () => { renderGiftPage(); expect((q('gift-pay-btn') as HTMLButtonElement)?.disabled).toBe(true); });
  it('TC-KGIFT-N-02: no undefined', () => { renderGiftPage(); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-KGIFT-D-01: original birthday report still works', () => { renderBirthdayReport({ dob: '1988-11-05' }); expect(document.body.textContent).not.toContain('undefined'); expect(document.body.textContent).toMatch(/Scorpio|zodiac/i); });
});
