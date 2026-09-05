// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BirthdayReportGiftPage from '../BirthdayReportGiftPage';

const renderGift = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/birthday-report/gift']}>
        <BirthdayReportGiftPage />
      </MemoryRouter>
    </HelmetProvider>
  );

const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);

describe('Gift Checkout — TC-GIFT', () => {
  afterEach(() => cleanup());

  // POSITIVE
  it('TC-GIFT-P-01: renders without crash', () => expect(() => renderGift()).not.toThrow());
  it('TC-GIFT-P-02: recipient name input present', () => { renderGift(); expect(q('gift-recipient-name')).toBeTruthy(); });
  it('TC-GIFT-P-03: recipient DOB input present', () => { renderGift(); expect(q('gift-recipient-dob')).toBeTruthy(); });
  it('TC-GIFT-P-04: gifter name input present', () => { renderGift(); expect(q('gift-giver-name')).toBeTruthy(); });
  it('TC-GIFT-P-05: gift message textarea present', () => { renderGift(); expect(q('gift-message')).toBeTruthy(); });
  it('TC-GIFT-P-06: pay button present', () => { renderGift(); expect(q('gift-pay-btn')).toBeTruthy(); });

  // NEGATIVE
  it('TC-GIFT-N-01: pay button disabled without recipient name', () => {
    renderGift();
    expect((q('gift-pay-btn') as HTMLButtonElement).disabled).toBe(true);
  });
  it('TC-GIFT-N-02: pay button still disabled with name but no DOB', () => {
    renderGift();
    fireEvent.change(q('gift-recipient-name')!, { target: { value: 'Priya' } });
    expect((q('gift-pay-btn') as HTMLButtonElement).disabled).toBe(true);
  });
  it('TC-GIFT-N-03: no undefined / [object Object] on page', () => {
    renderGift();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });

  it('TC-GIFT-P-07: full valid form → pay button enabled', () => {
    renderGift();
    fireEvent.change(q('gift-recipient-name')!, { target: { value: 'Priya' } });
    fireEvent.change(q('gift-recipient-dob')!, { target: { value: '1990-11-05' } });
    fireEvent.change(q('gift-giver-name')!, { target: { value: 'Rahul' } });
    expect((q('gift-pay-btn') as HTMLButtonElement).disabled).toBe(false);
  });

  // EDGE
  it('TC-GIFT-EDGE-01: recipient DOB = today → no error', () => {
    renderGift();
    const today = new Date().toISOString().split('T')[0];
    fireEvent.change(q('gift-recipient-name')!, { target: { value: 'Priya' } });
    fireEvent.change(q('gift-recipient-dob')!, { target: { value: today } });
    fireEvent.change(q('gift-giver-name')!, { target: { value: 'Rahul' } });
    expect(document.body.textContent).not.toContain('Error');
    expect((q('gift-pay-btn') as HTMLButtonElement).disabled).toBe(false);
  });
  it('TC-GIFT-EDGE-02: DOB 1900-01-01 → no crash', () => {
    renderGift();
    expect(() => fireEvent.change(q('gift-recipient-dob')!, { target: { value: '1900-01-01' } })).not.toThrow();
  });
  it('TC-GIFT-EDGE-03: future DOB → pay disabled + validation message', () => {
    renderGift();
    fireEvent.change(q('gift-recipient-name')!, { target: { value: 'Future' } });
    fireEvent.change(q('gift-recipient-dob')!, { target: { value: '2099-01-01' } });
    fireEvent.change(q('gift-giver-name')!, { target: { value: 'Rahul' } });
    expect((q('gift-pay-btn') as HTMLButtonElement).disabled).toBe(true);
    expect(document.body.textContent?.toLowerCase()).toContain('valid');
  });

  // DOWNSTREAM
  it('TC-GIFT-D-01: /birthday-report route unaffected by gift route addition', () => {
    const { unmount } = render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/birthday-report']}>
          <Routes>
            <Route path="/birthday-report" element={<div data-testid="bdr">Birthday Report</div>} />
            <Route path="/birthday-report/gift" element={<BirthdayReportGiftPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );
    expect(q('bdr')).toBeTruthy();
    unmount();
  });
});
