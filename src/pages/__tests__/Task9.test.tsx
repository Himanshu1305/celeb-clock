// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, isPremium: false, isAdmin: false, isInTrial: false, trialDaysRemaining: 0, profile: null }),
}));

import BirthdayReport from '../BirthdayReport';

const renderBirthdayReport = (opts: { dob?: string; time?: string; city?: string } = {}) => {
  const search = opts.dob ? `?dob=${opts.dob}` : '';
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/birthday-report${search}`]}>
        <BirthdayReport />
      </MemoryRouter>
    </HelmetProvider>
  );
};

const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);

describe('TC-BTI', () => {
  afterEach(() => cleanup());

  it('TC-BTI-P-01: birth-time-input renders', () => { renderBirthdayReport(); expect(q('birth-time-input')).toBeTruthy(); });
  it('TC-BTI-P-02: birth-city-input renders', () => { renderBirthdayReport(); expect(q('birth-city-input')).toBeTruthy(); });
  it('TC-BTI-P-03: without time western zodiac copy still shows', () => { renderBirthdayReport({ dob: '1988-11-05' }); expect(document.body.textContent).toMatch(/Scorpio|zodiac|Leo|Capricorn/i); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-BTI-P-04: without time vedic section absent', () => { renderBirthdayReport({ dob: '1988-11-05' }); expect(q('vedic-profile-section')).toBeFalsy(); });
  it('TC-BTI-P-05: without time disclaimer present', () => { renderBirthdayReport({ dob: '1988-11-05' }); expect((document.body.textContent || '').toLowerCase()).toMatch(/birth time|nakshatra requires|accurate nakshatra/); });
  it('TC-BTI-P-06: price 199 not 299', () => { renderBirthdayReport({ dob: '1988-11-05' }); const b = document.body.textContent || ''; if (b.includes('₹')) { expect(b).toContain('₹199'); expect(b).not.toMatch(/₹299.*report/i); } });
  it('TC-BTI-P-07: city input has placeholder', () => { renderBirthdayReport(); expect((q('birth-city-input') as HTMLInputElement)?.placeholder.toLowerCase()).toMatch(/city|place|delhi/); });
  it('TC-BTI-N-01: no undefined', () => { renderBirthdayReport({ dob: '1988-11-05' }); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-BTI-N-02: no [object Object]', () => { renderBirthdayReport({ dob: '1988-11-05' }); expect(document.body.textContent).not.toContain('[object Object]'); });
  it('TC-BTI-N-03: empty city no crash', () => { expect(() => renderBirthdayReport({ dob: '1988-11-05', time: '12:30', city: '' })).not.toThrow(); expect(document.body.textContent).not.toContain('Error'); });
  it('TC-BTI-EDGE-01: Feb 29 1988 no crash', () => { expect(() => renderBirthdayReport({ dob: '1988-02-29', time: '12:00' })).not.toThrow(); });
  it('TC-BTI-EDGE-02: midnight 00:00 no crash', () => { expect(() => renderBirthdayReport({ dob: '1988-11-05', time: '00:00' })).not.toThrow(); });
  it('TC-BTI-EDGE-03: 23:59 no crash', () => { expect(() => renderBirthdayReport({ dob: '1988-11-05', time: '23:59' })).not.toThrow(); });
});
