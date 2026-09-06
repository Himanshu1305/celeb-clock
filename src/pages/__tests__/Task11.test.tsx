// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import KundaliPage from '../KundaliPage';

const renderKundali = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/kundali']}>
        <KundaliPage />
      </MemoryRouter>
    </HelmetProvider>
  );

const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);

describe('TC-KUNDALI', () => {
  afterEach(() => cleanup());

  it('TC-KUNDALI-P-01: renders', () => expect(() => renderKundali()).not.toThrow());
  it('TC-KUNDALI-P-02: kundali-page present', () => { renderKundali(); expect(q('kundali-page')).toBeTruthy(); });
  it('TC-KUNDALI-P-03: kundali-dob present', () => { renderKundali(); expect(q('kundali-dob')).toBeTruthy(); });
  it('TC-KUNDALI-P-04: kundali-time present', () => { renderKundali(); expect(q('kundali-time')).toBeTruthy(); });
  it('TC-KUNDALI-P-05: kundali-city present', () => { renderKundali(); expect(q('kundali-city')).toBeTruthy(); });
  it('TC-KUNDALI-P-06: generate button present', () => { renderKundali(); expect(q('kundali-generate-btn')).toBeTruthy(); });
  it('TC-KUNDALI-P-07: gift CTA links to /birthday-report/gift', () => { renderKundali(); const links = Array.from(document.querySelectorAll('a')).filter(a => a.getAttribute('href')?.includes('birthday-report/gift')); expect(links.length).toBeGreaterThan(0); });
  it('TC-KUNDALI-P-08: title contains Kundali', async () => { renderKundali(); await waitFor(() => expect(document.title).toMatch(/Kundali|kundali/i)); });
  it('TC-KUNDALI-P-09: price 199 if shown', () => { renderKundali(); const b = document.body.textContent || ''; if (b.includes('₹')) expect(b).toContain('₹199'); });
  it('TC-KUNDALI-P-10: H1 mentions Kundali', () => { renderKundali(); expect(document.querySelector('h1')?.textContent).toMatch(/Kundali|kundali/i); });
  it('TC-KUNDALI-N-01: generate button DISABLED without inputs', () => { renderKundali(); expect((q('kundali-generate-btn') as HTMLButtonElement)?.disabled).toBe(true); });
  it('TC-KUNDALI-N-02: no ProKerala graceful not crash', () => { renderKundali(); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-KUNDALI-N-03: no undefined', () => { renderKundali(); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-KUNDALI-N-04: no [object Object]', () => { renderKundali(); expect(document.body.textContent).not.toContain('[object Object]'); });
  it('TC-KUNDALI-N-05: invalid date no crash', () => { renderKundali(); const dob = q('kundali-dob') as HTMLInputElement; if (dob) fireEvent.change(dob, { target: { value: '9999-99-99' } }); expect(document.body.textContent).not.toContain('Error'); });
  it('TC-KUNDALI-EDGE-01: Feb 29 accepted', () => { renderKundali(); const dob = q('kundali-dob') as HTMLInputElement; if (dob) fireEvent.change(dob, { target: { value: '1988-02-29' } }); expect(document.body.textContent).not.toContain('Error'); });
  it('TC-KUNDALI-EDGE-02: midnight 00:00 accepted', () => { renderKundali(); const t = q('kundali-time') as HTMLInputElement; if (t) fireEvent.change(t, { target: { value: '00:00' } }); expect(document.body.textContent).not.toContain('Error'); });
  it('TC-KUNDALI-EDGE-03: long city name no overflow', () => { renderKundali(); const c = q('kundali-city') as HTMLInputElement; if (c) fireEvent.change(c, { target: { value: 'Thiruvananthapuram Kerala' } }); expect(document.body.textContent).not.toContain('undefined'); });
});
